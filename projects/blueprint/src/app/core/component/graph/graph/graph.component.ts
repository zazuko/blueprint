// combined pk ->  <http://data.table.org/Plankton-metadata/Messorte>
import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  NgZone,
  inject,
  signal,
  input,
  output
} from '@angular/core';

import { Subject, Subscription } from 'rxjs';

import { select, scaleOrdinal, schemeSet2, schemeSet3, zoom, ZoomBehavior } from 'd3';

import { ButtonModule } from 'primeng/button';

import * as cola from 'webcola';

import { LayoutAdaptor } from './layout-adapter';
import { MultiLinkLabels } from '../graph-elements/model/multi-link-labels.model';
import { ArrowComponent, NodeComponent } from '../graph-elements';
import { LinkPanelComponent } from '../link-panel/link-panel.component';
import { DraggableDirective } from './draggable/draggable.directive';
import { GraphNode } from '../model/graph-node.model';
import { Graph } from '../model/graph.model';
import { GraphLink } from '../model/graph-link.model';
import { ColorUtil } from '@blueprint/utils';

@Component({
    selector: 'bp-graph',
    templateUrl: './graph.component.html',
    styleUrl: './graph.component.scss',
    imports: [
        ArrowComponent,
        NodeComponent,
        LinkPanelComponent,
        DraggableDirective,
        ButtonModule
    ]
})
export class GraphComponent implements OnInit, OnChanges, OnDestroy {
  @Input() graph: Graph = null;
  disableZoomMenu = input<boolean>(false);
  disableNodeMenu = input<boolean>(false);
  @Input() xOffset = '0';
  @Input() yOffset = '0';

  nodeSelected = output<GraphNode>();
  nodeExpanded = output<GraphNode>();
  nodeFocused = output<GraphNode>();
  linkSelected = output<string>();
  multiLinkSelected = output<MultiLinkLabels>();


  private readonly element = inject(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly cd = inject(ChangeDetectorRef);

  public linksSignal = signal<GraphLink[]>([]);
  public nodesSignal = signal<GraphNode[]>([]);

  private destroy$ = new Subject<void>();

  private _indexedColorScheme;
  private _dynamicColorScheme;
  DEFAULT_QUERY_LIMIT;

  public layout: LayoutAdaptor | null = null;
  private d3zoom;
  private svg;
  private zoomLayer;
  private resizeOb: ResizeObserver;
  private resizeOb$ = new Subject<void>();
  private resizeSub: Subscription;

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
    this.resizeSub = this.resizeOb$.subscribe(() => {
      if (this.layoutIsRunning) {
        this.layout.stop();
      }

      this.layout = this.createLayout();
      this.createChart(this.graph);
      this.cd.detectChanges();
    });

    this.resizeOb = this.ngZone.runOutsideAngular(
      () =>
        new window.ResizeObserver(() => {
          this.resizeOb$.next();
        })
    );
    this.resizeOb.observe(this.element.nativeElement.parentNode);

    this.initStaticVisualizationElements();
    this.layout = this.createLayout();
    this.d3zoom = this.createZoom();
    this.svg.call(this.d3zoom).on('dblclick.zoom', null);


    // zoom out 
    this.svg.transition().call(this.d3zoom.scaleBy, 0.618);
    // zoom out 
    this.svg.transition().call(this.d3zoom.scaleBy, 0.618);

    // this.createChart(this._nodes, this._links);

  }

  ngOnDestroy(): void {
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }

    if (this.resizeOb) {
      this.resizeOb.unobserve(this.element.nativeElement);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  private createChart(graph: Graph): void {
    if (this.layout && this.graph) {
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

  onZoomIn(): void {
    this.svg.transition().call(this.d3zoom.scaleBy, 1.618);
  }

  onZoomOut(): void {
    this.svg.transition().call(this.d3zoom.scaleBy, 0.618);
  }

  togglePinMode(): void {
    this.pinNodes = !this.pinNodes;
  }

  colorForNode(colorIndex: string): string {
    return ColorUtil.getColorForIndex(Number(colorIndex));
  }

  private createLayout(): LayoutAdaptor {
    if (!this.element.nativeElement.parentNode) {
      throw new Error('no parent node')
    }

    if (this.layout) {
      this.layout.stop();
      this.layout.nodes([]);
      this.layout.links([]);
    }
    // Get the container dimensions
    const dims =
      this.element.nativeElement.parentNode.getBoundingClientRect();
    this.svgWidthSignal.set(dims.width);
    this.svgHeightSignal.set(dims.height);

    this.svgWidth = dims.width;
    this.svgHeight = dims.height;

    const layout = new LayoutAdaptor();
    layout.size([dims.width, dims.height]);
    layout.jaccardLinkLengths(200, 1);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    layout.on(cola.EventType.start, () => {
      this.linksSignal.set(this.graph.links);
      this.nodesSignal.set(this.graph.nodes);
      this.layoutIsRunning = true;
    });
    layout.on(cola.EventType.tick, () => {

      this.linksSignal.set(this.graph.links);
      this.nodesSignal.set(this.graph.nodes);

    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    layout.on(cola.EventType.end, () => {

      this.linksSignal.set(this.graph.links);
      this.nodesSignal.set(this.graph.nodes);
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

  private createZoom(): ZoomBehavior<Element, unknown> {
    // Create a new zoom behavior
    const d3zoom = zoom();

    // Set the zoomable area to the size of the SVG
    //  this.setZoomExtent(d3zoom);

    // Set the minimum and maximum zoom levels
    this.setZoomScaleExtent(d3zoom);

    // Set up an event listener for the 'zoom' event
    this.setZoomEvent(d3zoom);

    return d3zoom;
  }

  // Set the zoomable area to the size of the SVG
  private setZoomExtent(d3zoom: ZoomBehavior<Element, unknown>): void {
    d3zoom.extent([
      [0, 0],
      [this.svgWidth, this.svgHeight],
    ]);
  }

  // Set the minimum and maximum zoom levels
  private setZoomScaleExtent(d3zoom: ZoomBehavior<Element, unknown>): void {
    d3zoom.scaleExtent([0.05, 1]);
  }

  // Set up an event listener for the 'zoom' event
  private setZoomEvent(d3zoom: ZoomBehavior<Element, unknown>): void {
    d3zoom.on('zoom', (event) => {
      this.zoomLayer.attr('transform', event.transform);
    });
  }

  // end setup the zoom behavior

  initStaticVisualizationElements(): void {
    this._indexedColorScheme = scaleOrdinal(schemeSet2).domain([
      ...Array(schemeSet2.length).keys(),
    ]);
    this._dynamicColorScheme = scaleOrdinal(schemeSet3);
    this.svg = select(this.element.nativeElement).select('svg');
    this.zoomLayer = this.svg.select('.zoomable');
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
}
