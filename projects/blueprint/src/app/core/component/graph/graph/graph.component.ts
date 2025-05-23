import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  input,
  output,
  DestroyRef,
  effect,
  computed
} from '@angular/core';

import { Subject } from 'rxjs';

import { select, zoom, ZoomBehavior, Selection, BaseType } from 'd3';

import { ButtonModule } from 'primeng/button';

import * as cola from 'webcola';

import { LayoutAdaptor } from './layout-adapter';

import { DraggableDirective } from './draggable/draggable.directive';
import { Graph, IUiGraphNode, IUiLink, ConsolidatedLink, ConsolidatedGraph, LabelWithLinkDefinition } from '../model/graph.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArrowComponent } from '../graph-elements/arrow/arrow.component';
import { NodeComponent } from '../graph-elements/node/node.component';
import { ColorUtil } from '../../../utils/color-util';

@Component({
  selector: 'bp-graph',
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
  imports: [
    ArrowComponent,
    NodeComponent,
    DraggableDirective,
    ButtonModule
  ]
})
export class GraphComponent implements OnInit, OnDestroy {
  readonly graph = input.required<Graph>();
  readonly selectedNodeId = input<string>('');
  readonly disableZoomMenu = input<boolean>(false);
  readonly disableNodeMenu = input<boolean>(false);

  readonly xOffset = input('0');
  readonly yOffset = input('0');

  readonly nodeSelected = output<IUiGraphNode>();
  readonly nodeExpanded = output<IUiGraphNode>();
  readonly nodeFocused = output<IUiGraphNode>();
  readonly linkSelected = output<string>();


  readonly #element = inject(ElementRef).nativeElement;
  readonly #destroyRef = inject(DestroyRef);

  public linksSignal = signal<ConsolidatedLink[]>([]);
  public nodesSignal = signal<IUiGraphNode[]>([]);


  public layout: LayoutAdaptor | null = null;
  private d3zoom; // ZoomBehavior<Element, unknown> | null = null;
  private svg: Selection<BaseType, unknown, null, undefined> | null = null;
  private zoomLayer: Selection<BaseType, unknown, null, undefined> | null = null;

  #resizeObserver: ResizeObserver | null = null;
  #resize$ = new Subject<void>();

  pinNodes = true;

  svgWidthSignal = signal(0);
  svgHeightSignal = signal(0);

  dragstart = { x: 0, y: 0 };

  isLinkPanelOpen = false;

  layoutIsRunning = false;
  layoutQueue: Graph[] = [];

  consolidatedGraph = computed<ConsolidatedGraph>(() => {
    const graph = this.graph();

    const nodes = graph.nodes;
    const links = graph.links;
    const linkMap = new Map<string, UiLinkWithDirection[]>();

    for (const link of links) {
      const sourceIri = link.source.iri;
      const targetIri = link.target.iri;
      const outgoingKey = `${sourceIri}-${targetIri}`;
      const incomingKey = `${targetIri}-${sourceIri}`;

      const outgoingLink = linkMap.get(outgoingKey);
      const incomingLink = linkMap.get(incomingKey);
      if (outgoingLink === undefined && incomingLink === undefined) {
        // if there is no link in the map, add it
        const directionalLink = (link as UiLinkWithDirection);
        directionalLink.direction = 'outgoing';
        linkMap.set(outgoingKey, [directionalLink]);
      } else if (outgoingLink !== undefined) {
        // if there is an outgoing link, add the link to the outgoing link array
        const directionalLink = (link as UiLinkWithDirection);
        directionalLink.direction = 'outgoing'; outgoingLink.push(directionalLink);
      } else if (incomingLink !== undefined) {
        // if there is an incoming link, add the link to the incoming link array
        const directionalLink = (link as UiLinkWithDirection);
        directionalLink.direction = 'incoming'; incomingLink.push(directionalLink);
      }
    };

    const consolidatedLinks: ConsolidatedLink[] = [...linkMap.keys()].flatMap((key, index) => {
      const links = linkMap.get(key);

      if (links === undefined) {
        // this will never happen
        return [];
      }
      if (links.length === 1) {
        // if there is only one link, return it
        const link = links[0];
        const consolidatedLink: ConsolidatedLink = {
          id: link.iri,
          label: link.label,
          source: link.source,
          target: link.target,
          iri: link.iri,
          incomingLabels: [],
          outgoingLabels: [{ label: link.label, linkDefinition: link.linkDefinition }],
          direction: 'outgoing',
          linkDefinition: link.linkDefinition,
        };
        return consolidatedLink
      }
      // if there are multiple links, consolidate them
      const incomingLabels: LabelWithLinkDefinition[] = [];
      const outgoingLabels: LabelWithLinkDefinition[] = [];
      links.forEach(link => {
        if (link.direction === 'incoming') {
          incomingLabels.push({ label: link.label, linkDefinition: link.linkDefinition });
        } else {
          outgoingLabels.push({ label: link.label, linkDefinition: link.linkDefinition });
        }
      }
      );
      if (incomingLabels.length > 0 && outgoingLabels.length > 0) {
        // if there are both incoming and outgoing links, return a bidirectional link
        const consolidatedLink: ConsolidatedLink = {
          id: links[0].iri,
          label: [...incomingLabels, ...outgoingLabels].join(', '),
          source: links[0].direction === 'outgoing' ? links[0].source : links[0].target,
          target: links[0].direction === 'outgoing' ? links[0].target : links[0].source,
          iri: links[0].iri,
          incomingLabels: incomingLabels,
          outgoingLabels: outgoingLabels,
          direction: 'bidirectional',
          linkDefinition: links[0].linkDefinition,
        };
        return consolidatedLink
      }
      if (incomingLabels.length > 0) {
        // if there are only incoming links, return an incoming link
        console.error('incoming link', links);
        console.error('incoming links are not possible');
        return [];
      }
      if (outgoingLabels.length > 0) {
        // if there are only outgoing links, return an outgoing link
        const consolidatedLink: ConsolidatedLink = {
          id: links[0].iri,
          label: [...incomingLabels, ...outgoingLabels].join(', '),
          source: links[0].direction === 'outgoing' ? links[0].source : links[0].target,
          target: links[0].direction === 'outgoing' ? links[0].target : links[0].source,
          iri: links[0].iri,
          incomingLabels: incomingLabels,
          outgoingLabels: outgoingLabels,
          direction: 'outgoing',
          linkDefinition: links[0].linkDefinition,
        };
        return consolidatedLink
      }
      // this will never happen
      return [];
    });

    return { nodes, links: consolidatedLinks };
  });

  constructor() {

    effect(() => {
      const graph = this.consolidatedGraph();

      if (this.layout) {
        this.layout.stop();

        if (this.layoutIsRunning) {
          this.layoutQueue.push(graph);
          this.layout.stop();
        } else {
          this.#createChart(graph);
        }
      }
    }
    );
  }

  ngOnInit(): void {

    if (!window.ResizeObserver) {
      throw new Error('please install a polyfill for ResizeObserver');
    }
    this.#resize$.pipe(
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe(() => {
      if (this.layoutIsRunning) {
        this.layout.stop();
      }
      this.layout = this.#createLayout();
      this.#createChart(this.consolidatedGraph());
    });

    this.#resizeObserver = new window.ResizeObserver(() => {
      this.#resize$.next();
    });

    this.#resizeObserver.observe(this.#element.parentNode);

    this.svg = select(this.#element).select('svg');
    this.zoomLayer = this.svg.select('.zoomable');

    this.layout = this.#createLayout();
    this.d3zoom = this.#createZoom();

    // this enables the panning of the graph
    this.svg.call(this.d3zoom).on('dblclick.zoom', null);

    // zoom out 
    this.svg.transition().call(this.d3zoom.scaleBy, 0.618);

  }



  #createChart(graph: Graph): void {

    if (this.layout && this.consolidatedGraph()) {

      const disconnectedGroups = this.#disconnectedNodeGroups(graph.links);
      if (disconnectedGroups.length < 2) {
        this.layout.nodes(graph.nodes);
        this.layout.links(graph.links as any);
        this.layout.start(0, 0, 0, 0, true, false);
        return
      }

      // if there are disconnected groups, we need to add fake links to connect them
      const links = graph.links.map(x => x) as any;

      disconnectedGroups.forEach((group, index) => {
        if (index === disconnectedGroups.length - 1) {
          // last group, no need to add a link
          return;
        }
        const nextGroup = disconnectedGroups[index + 1];

        const firstNode = group[0];
        const firstNextGroupNode = nextGroup[0];

        const fakeLink: IUiLink = {
          id: `fake-link-${index}`,
          iri: `fake-link-${index}`,
          source: firstNode,
          target: firstNextGroupNode,
          label: '',
          linkDefinition: null,
        };
        links.push(fakeLink);
      });
      this.layout.nodes(graph.nodes);
      this.layout.links(links);
      this.layout.start(0, 0, 0, 0, true, false);
      return
    }
  }

  #disconnectedNodeGroups(links: IUiLink[]): IUiGraphNode[][] {
    const disconnectedGroups: IUiGraphNode[][] = [];
    for (const link of links) {
      if (disconnectedGroups.length === 0) {
        disconnectedGroups.push([link.source, link.target]);
        continue;
      }
      const sourceNode = link.source;
      const targetNode = link.target;
      let found = false;
      for (const group of disconnectedGroups) {
        const findSource = group.find(node => node.id === sourceNode.id);
        const findTarget = group.find(node => node.id === targetNode.id);
        if (findSource && findTarget) {
          // both nodes are in the same group
          found = true;
          break;
        } else if (findSource) {
          // source node is in the group, add target node to the group
          group.push(targetNode);
          found = true;
          break;
        } else if (findTarget) {
          // target node is in the group, add source node to the group
          group.push(sourceNode);
          found = true;
          break;
        }
      }
      if (!found) {
        // create a new group
        disconnectedGroups.push([sourceNode, targetNode]);
      }
    }
    return disconnectedGroups
  }


  emitNodeSelected(node: IUiGraphNode): void {
    this.nodeSelected.emit(node);
  }

  emitNodeExpanded(node: IUiGraphNode): void {
    this.nodeExpanded.emit(node);
  }

  emitNodeFocused(node: IUiGraphNode): void {
    this.nodeFocused.emit(node);
  }

  onLinkSelected(link: IUiLink): void {
    console.log('link selected', link);
  }

  zoomInOneStep(): void {
    this.svg.transition().call(this.d3zoom.scaleBy, 1.618);
  }

  zoomOutOneStep(): void {
    this.svg.transition().call(this.d3zoom.scaleBy, 0.618);
  }

  togglePinMode(): void {
    this.pinNodes = !this.pinNodes;
  }

  colorForNode(colorIndex: string): string {
    return ColorUtil.getColorForIndex(Number(colorIndex));
  }

  #createLayout(): LayoutAdaptor {
    if (!this.#element.parentNode) {
      throw new Error('no parent node')
    }

    if (this.layout) {
      this.layout.stop();
      this.layout.nodes([]);
      this.layout.links([]);
    }
    // Get the container dimensions
    const elementDimensions = this.#element.parentNode.getBoundingClientRect();
    this.svgWidthSignal.set(elementDimensions.width);
    this.svgHeightSignal.set(elementDimensions.height);


    const layout = new LayoutAdaptor();
    layout.size([elementDimensions.width, elementDimensions.height]);
    layout.jaccardLinkLengths(280, 1);

    layout.on(cola.EventType.start, () => {
      const graph = this.consolidatedGraph();
      this.linksSignal.set(graph.links.map(l => l));
      this.nodesSignal.set(graph.nodes.map(n => n));
      this.layoutIsRunning = true;
    });

    layout.on(cola.EventType.tick, () => {
      const graph = this.consolidatedGraph();
      this.linksSignal.set(graph.links.map(l => l));
      this.nodesSignal.set(graph.nodes.map(n => n));

    });

    layout.on(cola.EventType.end, () => {

      const graphValue = this.consolidatedGraph();
      this.linksSignal.set(graphValue.links.map(l => l));
      this.nodesSignal.set(graphValue.nodes.map(n => n));
      this.layoutIsRunning = false;
      if (this.layoutQueue.length > 0) {
        // run the next layout
        const graph = this.layoutQueue.shift();
        this.#createChart(graph);
      }
    });

    return layout;
  }

  // setup the zoom behavior

  #createZoom(): ZoomBehavior<Element, unknown> {
    // Create a new zoom behavior
    const d3zoom = zoom();


    // Set the minimum and maximum zoom levels
    d3zoom.scaleExtent([0.05, 1]);

    // Set up an event listener for the 'zoom' event
    d3zoom.on('zoom', (event) => {
      this.zoomLayer.attr('transform', event.transform);
    });

    return d3zoom;
  }




  dragStart(event: DragEvent, node: IUiGraphNode): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cola.Layout.dragStart(node as any);
    this.dragstart.x = event.x;
    this.dragstart.y = event.y;
  }

  drag(event: DragEvent, node: IUiGraphNode): void {
    //  event.stopPropagation();
    this.layout.resume();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cola.Layout.drag(node as any, event);
  }

  dragEnd(event: DragEvent, node: IUiGraphNode): void {
    //   event.stopPropagation();
    cola.Layout.dragEnd(node);
    // only change the fixed/unfixed flag when the node is dragged a certain distance,
    // otherwise, simply clicking on a fixed node will un-fix it.
    if (
      Math.pow(event.x - this.dragstart.x, 2) +
      Math.pow(event.y - this.dragstart.y, 2) >
      30
    ) {
      node.isPinned = this.pinNodes;
      // the layout internally also changes the node.fixed flag, during drag and drop. In order NOT to
      // display these internal changes, we use a separate flag to control the pin icon on the node
      node.showPin = node.isPinned;
      node.fixed = node.isPinned ? 1 : 0;
    }
  }

  /**
   * This method is called when the component is destroyed.
   * 
   * It stops the layout and disconnects the resize observer.
   */
  ngOnDestroy(): void {
    if (this.layout) {
      this.layout.stop();
      this.layout.nodes([]);
      this.layout.links([]);
      this.layout = null;
    }

    if (this.#resizeObserver) {
      // stop observing the element
      this.#resizeObserver.unobserve(this.#element);
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  }
}


interface UiLinkWithDirection extends IUiLink {
  direction: 'incoming' | 'outgoing';
}