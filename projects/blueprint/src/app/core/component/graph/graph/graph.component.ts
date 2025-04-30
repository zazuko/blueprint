import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  input,
  output,
  DestroyRef
} from '@angular/core';

import { Subject } from 'rxjs';

import { select, zoom, ZoomBehavior, Selection, BaseType } from 'd3';

import { ButtonModule } from 'primeng/button';

import * as cola from 'webcola';

import { LayoutAdaptor } from './layout-adapter';
import { MultiLinkLabels } from '../graph-elements/model/multi-link-labels.model';
import { ArrowComponent, NodeComponent } from '../graph-elements';

import { DraggableDirective } from './draggable/draggable.directive';
import { GraphNode } from '../model/graph-node.model';
import { Graph } from '../model/graph.model';
import { GraphLink } from '../model/graph-link.model';
import { ColorUtil } from '@blueprint/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class GraphComponent implements OnInit, OnChanges, OnDestroy {
  readonly graph = input<Graph>(null);
  readonly disableZoomMenu = input<boolean>(false);
  readonly disableNodeMenu = input<boolean>(false);

  readonly xOffset = input('0');
  readonly yOffset = input('0');

  readonly nodeSelected = output<GraphNode>();
  readonly nodeExpanded = output<GraphNode>();
  readonly nodeFocused = output<GraphNode>();
  readonly linkSelected = output<string>();
  readonly multiLinkSelected = output<MultiLinkLabels>();


  readonly #element = inject(ElementRef).nativeElement;
  readonly #destroyRef = inject(DestroyRef);

  public linksSignal = signal<GraphLink[]>([]);
  public nodesSignal = signal<GraphNode[]>([]);


  public layout: LayoutAdaptor | null = null;
  private d3zoom; // ZoomBehavior<Element, unknown> | null = null;
  private svg: Selection<BaseType, unknown, null, undefined> | null = null;
  private zoomLayer: Selection<BaseType, unknown, null, undefined> | null = null;

  #resizeObserver: ResizeObserver | null = null;
  #resize$ = new Subject<void>();

  pinNodes = true;

  svgWidthSignal = signal(0);
  svgHeightSignal = signal(0);
  svgWidth = 0;
  svgHeight = 0;

  dragstart = { x: 0, y: 0 };

  selectedSubject: string | null;
  isLinkPanelOpen = false;
  multiLinks: MultiLinkLabels | null = null;

  layoutIsRunning = false;
  layoutQueue: Graph[] = [];



  ngOnChanges(changes: SimpleChanges): void {
    console.log('%cngOnChanges', 'color:cyan', changes);
    const newGraph: Graph = changes['graph']?.currentValue;
    if (newGraph) {

      if (this.layout) {
        this.layout.stop();

        if (this.layoutIsRunning) {
          this.layoutQueue.push(newGraph);
          this.layout.stop();
        } else {

          this.createChart(newGraph);
        }
      }
    }
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
      this.createChart(this.graph());
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
    // zoom out 
    this.svg.transition().call(this.d3zoom.scaleBy, 0.618);

  }



  private createChart(graph: Graph): void {

    console.log('%ccreateChart', 'color:orange', graph);
    if (this.layout && this.graph()) {
      this.layout.nodes(graph.nodes);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.layout.links(graph.links as any);
      this.layout.start(0, 0, 0, 0, true, false);
    }
  }

  emitNodeSelected(node: GraphNode): void {
    this.selectedSubject = node.id;
    this.nodeSelected.emit(node);
  }

  emitNodeExpanded(node: GraphNode): void {
    this.nodeExpanded.emit(node);
  }

  emitNodeFocused(node: GraphNode): void {
    this.nodeFocused.emit(node);
  }

  onLinkSelected(link: GraphLink): void {
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
    const dims =
      this.#element.parentNode.getBoundingClientRect();
    this.svgWidthSignal.set(dims.width);
    this.svgHeightSignal.set(dims.height);

    this.svgWidth = dims.width;
    this.svgHeight = dims.height;

    const layout = new LayoutAdaptor();
    layout.size([dims.width, dims.height]);
    layout.jaccardLinkLengths(200, 1);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    layout.on(cola.EventType.start, () => {
      const graph = this.graph();
      this.linksSignal.set(graph.links.map(l => l));
      this.nodesSignal.set(graph.nodes.map(n => n));
      this.layoutIsRunning = true;
    });
    layout.on(cola.EventType.tick, () => {
      const graph = this.graph();
      this.linksSignal.set(graph.links.map(l => l));
      this.nodesSignal.set(graph.nodes.map(n => n));

    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    layout.on(cola.EventType.end, () => {

      const graphValue = this.graph();
      this.linksSignal.set(graphValue.links.map(l => l));
      this.nodesSignal.set(graphValue.nodes.map(n => n));
      this.layoutIsRunning = false;
      if (this.layoutQueue.length > 0) {
        // run the next layout
        const graph = this.layoutQueue.shift();
        this.createChart(graph);
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




  dragStart(event: DragEvent, node: GraphNode): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cola.Layout.dragStart(node as any);
    this.dragstart.x = event.x;
    this.dragstart.y = event.y;
  }

  drag(event: DragEvent, node: GraphNode): void {
    //  event.stopPropagation();
    this.layout.resume();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cola.Layout.drag(node as any, event);
  }

  dragEnd(event: DragEvent, node: GraphNode): void {
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

  onMultiLinkSelected(links: MultiLinkLabels) {
    this.isLinkPanelOpen = true;
    this.multiLinks = links;
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
