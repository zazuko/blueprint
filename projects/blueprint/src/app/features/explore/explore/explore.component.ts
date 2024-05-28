import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  DestroyRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, RouterModule, Router, ParamMap } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import rdfEnvironment from '@zazuko/env';

import { ExploreHeaderComponent } from '../explore-header/explore-header.component';
import { GraphComponent } from '../../../core/component/graph/graph/graph.component';
import { NeighborNodesComponent } from "../../../core/component/neighbor-nodes/neighbor-nodes.component";
import { UiViewComponent } from '../../../core/ui-view/ui-view/ui-view.component';
import { ViewDataService } from '../../../core/ui-view/service/view-data/view-data.service';
import { RdfUiView, UiView } from '../../../core/ui-view/model/ui-view.model';
import { MultiLinkLabels } from '../../../core/component/graph';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { UiHierarchyViewComponent } from '../../../core/ui-view/ui-hierarchy-view/ui-hierarchy-view.component';
import { Avatar } from '../../../core/component/avatar/avatar.component';

import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { UiDetailService } from '../../../core/service/ui-config/ui-detail/ui-detail.service';
import { UiDetailElement } from '../../../core/service/ui-config/ui-detail/model/ui-detail-element';
import { LiteralViewComponent } from "../../../core/ui-view/ui-detail-view/literal-view/literal-view.component";
import { RdfUiHierarchyView, UiHierarchyView } from '../../../core/ui-view/ui-hierarchy-view/model/ui-hierarchy-view';
import { blueprint, nileaUi, rdf, rdfs, shacl } from '@blueprint/ontology';
import { GraphService } from '../service/graph/graph.service';
import { SelectionService } from '../service/selection/selection.service';
import { GraphNode } from '@blueprint/component/graph/model/graph-node.model';
import { Graph } from '@blueprint/component/graph/model/graph.model';
import { DetailsComponent } from '@blueprint/component/details';
import { RdfUiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { fadeInOut, fadeIn } from '@blueprint/animation/index';
import { AggregateRelationComponent } from "../../../core/ui-view/view-component-library/aggregate-relation/aggregate-relation.component";
import { CompositionLinkResult } from '@blueprint/service/graph/aggregate/model/composition-link-result/composition-result';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';
import { TooltipModule } from 'primeng/tooltip';
import { CommentComponent } from "../../../core/component/comment/comment.component";


// create an enum about page views we have Views, Graph and Nearby

enum PageView {
  Details,
  Graph,
  Nearby,
  Views
}

@Component({
  standalone: true,
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
  animations: [fadeInOut, fadeIn],
  imports: [
    CommonModule,
    RouterModule,
    ExploreHeaderComponent,
    UiViewComponent,
    GraphComponent,
    ExploreHeaderComponent,
    NeighborNodesComponent,
    UiHierarchyViewComponent,
    TabMenuModule,
    LiteralViewComponent,
    DetailsComponent,
    AggregateRelationComponent,
    TooltipModule,
    JsonPipe,
    CommentComponent
  ]
})
export class ExploreComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly graphService = inject(GraphService);
  private readonly selectionService = inject(SelectionService);
  private readonly viewData = inject(ViewDataService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly uiDetailService = inject(UiDetailService);

  public compositionLinks = signal<CompositionLinkResult[]>([]);
  public thisNodeElement = signal<NodeElement | null>(null);

  tabNavItems: MenuItem[] = [
    { label: 'Information', icon: 'pi pi-info-circle' },
    { label: 'Context', icon: 'pi pi-sitemap' },

    { label: 'Nearby', icon: 'pi pi-fw pi-calendar' },
    { label: 'Graph', icon: 'fa-solid fa-circle-nodes' },
  ];

  public activeItem = this.tabNavItems[0];


  subject: string = '';
  graphOpenState = signal(true);
  currentPageView = signal<PageView>(PageView.Details);
  expandedNode: GraphNode | null = null;

  public PageView: typeof PageView = PageView;


  uiView: UiView[] = [];
  uiHierarchy: UiHierarchyView[] = [];
  term: string;
  subjectLabel = signal<string>('');
  subjectComment = signal<string>('');
  subjectClassLabel = signal<string>('');
  graph = signal<Graph>({ nodes: [], links: [] });
  subjectAvatars = signal<Avatar[]>([]);

  uiDetailElementsSignal = signal<UiDetailElement[]>([]);

  searchTerm: string;
  searchFilter: string;
  expanded = true;

  routeParamMap$: Observable<ParamMap>
  graph$: Observable<Graph>;

  multiLinks: MultiLinkLabels = null;
  linkPanelIsOpen = false;

  constructor() {
    this.routeParamMap$ = this.route.paramMap;
  }

  ngOnInit(): void {

    this.graphService.clearGraph();


    this.graphService.graph$.pipe(
      takeUntilDestroyed(this.destroyRef),
      map(graph => {
        if (this.expandedNode !== null) {
          // set the nodes without x and y to the expanded node's x and y. this makes new nodes appear from the expanded node
          // and not the center of the graph 
          graph.nodes.filter(nodeWithoutX => !nodeWithoutX.x).forEach((newNode) => {
            newNode.x = this.expandedNode.x;
            newNode.y = this.expandedNode.y;
          });
          this.expandedNode = null;
        }
        return graph;
      })
    ).subscribe({
      next: graph => {
        this.graph.set(graph);
      },
      error: (error) => {
        console.error('error', error);
        this.loadingIndicatorService.done();
      }
    });


  }
  ngAfterViewInit(): void {
    // fetch the view for the subject on route change
    this.routeParamMap$.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => {
        this.loadingIndicatorService.loading();
      }),
      map((params) => params.get('subject')),
      switchMap((subject) => {
        this.subject = subject;
        this.graphService.expandNode(subject);
        return this.viewData.getViewForSubject(rdfEnvironment.namedNode(subject));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(
      {
        next: (viewGraph) => {
          const cfViewGraph = rdfEnvironment.clownface({ dataset: viewGraph, term: nileaUi.UiViewNamedNode });

          // ---- composition link result
          this.compositionLinks.set(cfViewGraph.node(blueprint.CompositionLinkResultNamedNode).in(rdf.typeNamedNode).map((node) => new CompositionLinkResult(node)));
          this.thisNodeElement.set(cfViewGraph.namedNode(this.subject).map((node) => new NodeElement(node))[0]);
          // ---- composition link result end

          const cfHierarchyGraph = rdfEnvironment.clownface({ dataset: viewGraph }).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
          const uiDetails = this.uiDetailService.extractUiDetailComponents(this.subject, viewGraph);
          this.uiDetailElementsSignal.set(uiDetails.sort((a, b) => a.order - b.order));
          // make it better 
          const subjectGraph = rdfEnvironment.clownface({ dataset: viewGraph }).namedNode(this.subject);
          this.subjectLabel.set(subjectGraph.out(rdfs.labelNamedNode).values.join(', '));
          this.subjectComment.set(subjectGraph.out(rdfs.commentNamedNode).values.join(', '));

          const metaGraph = rdfEnvironment.clownface({ dataset: viewGraph }).namedNode(this.subject).out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode);

          this.subjectClassLabel.set(metaGraph.out(rdfs.labelNamedNode).values.join(','));

          // loop over metaGraph and get all icons and colors
          const avatarArray: Avatar[] = metaGraph.map((metaData) => {
            const uiClassMetaData = new RdfUiClassMetadata(metaData);
            const icon = uiClassMetaData.icon;
            const color = uiClassMetaData.color;
            const label = uiClassMetaData.label;
            return { label, icon, color };
          });
          this.subjectAvatars.set(avatarArray);
          // 
          this.uiView = cfViewGraph.in(rdf.typeNamedNode).map(view => new RdfUiView(view));

          this.uiView.length === 0 ? this.graphOpenState.set(true) : this.graphOpenState.set(false);



          this.uiHierarchy = cfHierarchyGraph.map(view => new RdfUiHierarchyView(rdfEnvironment.namedNode(view.value), viewGraph));

          this.loadingIndicatorService.done();
          this.selectionService.setSelectedNode(this.subject);
        },
        error: (error) => {
          console.error('error', error);
          this.loadingIndicatorService.done();
        }
      });

  }

  ngOnDestroy(): void {
    this.selectionService.clearSelection();
  }

  toggleSidebar(): void {
    this.expanded = !this.expanded;
  }

  // graph events
  onNodeSelected(node: GraphNode): void {
    this.expandedNode = node;
    this.selectByIri(node.id);
  }

  selectByIri(iri: string): void {
    this.selectionService.setSelectedNode(iri);
    this.router.navigate(['explore', iri]);
  }

  onNodeExpanded(node: GraphNode): void {
    this.expandedNode = node;
    this.loadingIndicatorService.loading();

    this.graphService.expandNode(node.id);
  }

  onNodeFocused(node: GraphNode): void {
    this.graphService.clearGraph();
    this.expandedNode = node;
    this.graphService.expandNode(node.id);
  }

  onMultiLinkSelected(multiLinks: MultiLinkLabels): void {
    // this.multiLinks = multiLinks;
    // this.linkPanelIsOpen = true;
    console.log('onMultiLinkSelected', multiLinks);
  }


  showView(view: PageView) {
    this.currentPageView.set(view);
  }

  openView(item: MenuItem) {
    switch (item.label) {
      case 'Information':
        this.currentPageView.set(PageView.Details);
        break;
      case 'Nearby':
        this.currentPageView.set(PageView.Nearby);
        break;
      case 'Graph':
        this.currentPageView.set(PageView.Graph);
        break;
      case 'Context':
        this.currentPageView.set(PageView.Views);
        break;
      default:
        this.currentPageView.set(PageView.Details);
    }
  }
}
