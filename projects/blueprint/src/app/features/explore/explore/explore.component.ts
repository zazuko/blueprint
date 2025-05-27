import {
  Component,
  inject,
  signal,
  DestroyRef,
  computed,
  effect,
  OnDestroy,
  model,
} from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { map, switchMap } from 'rxjs';

import { Clipboard } from '@angular/cdk/clipboard';

import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button'

import { ExploreHeaderComponent } from '../explore-header/explore-header.component';
import { GraphComponent } from '../../../core/component/graph/graph/graph.component';
import { NeighborNodesComponent } from "../../../core/component/neighbor-nodes/neighbor-nodes.component";
import { UiViewComponent } from '../../../core/ui-view/ui-view/ui-view.component';
import { ViewDataService } from '../../../core/ui-view/service/view-data/view-data.service';
import { RdfUiView, UiView } from '../../../core/ui-view/model/ui-view.model';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { UiHierarchyViewComponent } from '../../../core/ui-view/ui-hierarchy-view/ui-hierarchy-view.component';

import { flux, nileaUi, rdf, } from '@blueprint/ontology';
import { ConsolidatedLink, IUiGraphNode } from '@blueprint/component/graph/model/graph.model';
import { CompositionLinkResult } from '@blueprint/service/graph/aggregate/model/composition-link-result/composition-result';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';

import { UiDetailService } from '../../../core/service/ui-config/ui-detail/ui-detail.service';
import { RdfUiHierarchyView, UiHierarchyView } from '../../../core/ui-view/ui-hierarchy-view/model/ui-hierarchy-view';
import { GraphService } from '../service/graph/graph.service';
import { SelectionService } from '../service/selection/selection.service';
import { AggregateRelationComponent } from "../../../core/ui-view/view-component-library/aggregate-relation/aggregate-relation.component";

import { rdfEnvironment, RdfTypes } from '../../../core/rdf/rdf-environment';
import { fadeInOut, fadeIn } from '../../../core/animation/fade-in-out/fade-in-out';
import { PanelModule } from 'primeng/panel';
import { UILiteral, LiteralComponent, LiteralRenderType } from '../../../core/ui-view/ui-detail-view/literal/literal.component';
import { ExploredResource } from '../model/explored-resource.class';
import { MessageChannelService } from '@blueprint/service/message-channel/message-channel.service';
import { RdfPrefixPipe } from "../../../core/rdf/prefix/rdf-prefix.pipe";

type NodeExploreCommand = "expand" | "select";
type SelectionKind = "node" | "link";

@Component({
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
    AggregateRelationComponent,
    TooltipModule,
    TabsModule,
    PanelModule,
    LiteralComponent,
    DrawerModule,
    ButtonModule,
    RdfPrefixPipe
  ]
})
export class ExploreComponent implements OnDestroy {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #graphService = inject(GraphService);
  readonly #selectionService = inject(SelectionService);
  readonly #viewData = inject(ViewDataService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #uiDetailService = inject(UiDetailService);
  readonly #clipboard = inject(Clipboard);
  readonly loadingIndicatorService = inject(LoadingIndicatorService);
  readonly #messageChannelServie = inject(MessageChannelService);
  readonly compositionLinks = signal<CompositionLinkResult[]>([]);
  readonly thisNodeElement = signal<NodeElement | null>(null);

  readonly selectedNodeIri = this.#selectionService.selectedNodeIriSignal;
  tabNavItems: MenuItem[] = [
    { label: 'Information', icon: 'pi pi-info-circle', fragment: 'Information' },
    { label: 'Context', icon: 'pi pi-sitemap', fragment: 'Context' },
    { label: 'Nearby', icon: 'pi pi-fw pi-calendar', fragment: 'Nearby' },
    { label: 'Graph', icon: 'fa-solid fa-circle-nodes', fragment: 'Graph' },
  ];

  public activeItem = this.tabNavItems[0];

  visible = model<boolean>(false);
  pinDetailsPanel = signal<boolean>(false);
  selectionKind = signal<SelectionKind>('node');
  showLinks = signal<boolean>(false);
  selectedLink = signal<ConsolidatedLink | null>(null);

  drawerModal = computed(() => {
    return !this.pinDetailsPanel();
  });
  // this is the IRI of the subject in the route
  public currentGraphResource = signal<ExploredResource | null>(null);
  public bubbleGraph = this.#graphService.graphSignal;

  routeFragment = toSignal(this.#route.fragment, { initialValue: 'Information' });


  uiView: UiView[] = [];
  uiHierarchy: UiHierarchyView[] = [];
  term: string;

  searchTerm: string;
  searchFilter: string;

  nodeExploreCommand: NodeExploreCommand = 'expand'; // default command is expand

  constructor() {

    effect(() => {
      const selectedNodeIri = this.selectedNodeIri();
      if (selectedNodeIri && this.nodeExploreCommand === 'expand') {
        this.#graphService.expandNode(selectedNodeIri);
      }
    });

    effect(() => {
      const subject = this.subjectIri();

      if (subject === undefined) {
        return;
      }


      //   this.#graphService.expandNode(subject);
      this.#viewData.getViewForSubject(rdfEnvironment.namedNode(subject)).pipe(
        takeUntilDestroyed(this.#destroyRef),
      ).subscribe(
        {
          next: (viewGraph) => {
            console.log('viewGraph', viewGraph);

            const currentResource = new ExploredResource(rdfEnvironment.clownface(viewGraph).namedNode(this.subjectIri()));
            this.currentGraphResource.set(currentResource);

            const cfViewGraph = rdfEnvironment.clownface(viewGraph, nileaUi.UiViewNamedNode);

            // ---- composition link result
            this.compositionLinks.set(cfViewGraph.node(flux.CompositionLinkResultNamedNode).in(rdf.typeNamedNode).map((node) => new CompositionLinkResult(node)));
            this.thisNodeElement.set(cfViewGraph.namedNode(this.subjectIri()).map((node) => new NodeElement(node))[0]);
            // ---- composition link result end

            const cfHierarchyGraph = rdfEnvironment.clownface(viewGraph).node(flux.HierarchyNamedNode).in(rdf.typeNamedNode);
            // make it better 

            this.uiView = cfViewGraph.in(rdf.typeNamedNode).map(view => new RdfUiView(view));

            this.uiHierarchy = cfHierarchyGraph.map(view => new RdfUiHierarchyView(rdfEnvironment.namedNode(view.value), viewGraph));

            this.loadingIndicatorService.done();
            this.#selectionService.setSelectedNode(this.subjectIri());
          },
          error: (error) => {
            console.error('error', error);
            this.#messageChannelServie.error('Error loading view for subject', error, 'Please check the subject IRI and try again.');
            this.loadingIndicatorService.done();
          }
        });
    });
  }

  literalConfigurationRules = toSignal(toObservable(computed(() => {
    return this.currentGraphResource()?.rdfTypeIri ?? [];
  })).pipe(
    switchMap((rdfTypeIri) => this.#uiDetailService.getLiteralRulesForClasses(rdfTypeIri)),
  )
  );

  // create literal elements from the current graph resource
  literalDetailElements = computed<UILiteral[]>(() => {
    const currentResource = this.currentGraphResource();
    if (currentResource === null) {
      return [];
    }
    const literalMap = currentResource.getLiteralTripleMap();
    const literalRules = this.literalConfigurationRules();
    const literalElements: UILiteral[] = [];

    [...literalMap.keys()].forEach((key) => {
      const literalValues = literalMap.get(key).map(q => q.object as RdfTypes.Literal);

      const literalRule = literalRules.find((rule) => rule.path.value === key);
      if (literalRule) {
        if (literalValues) {
          const literalElement: UILiteral = {
            ruleIri: key,
            label: literalRule.label,
            order: literalRule.order,
            value: literalValues,
            renderer: literalRule.renderLiteralAs
          }
          literalElements.push(literalElement);
        }
      } else {
        // add a default value
        // here we go: The key is the IRI of the predicate
        // we have to transform this to a label 
        // - get the TBOX rdfs:label or skos:prefLabel
        // - if not found Create a label from it's IRI.
        // - if not found use the key as label
        const label = currentResource.resolveLabelForPredicate(key);
        const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);


        const literalElement: UILiteral = {
          ruleIri: key,
          label: capitalizedLabel,
          order: 10,
          value: literalValues,
          renderer: LiteralRenderType.PLAIN
        }
        literalElements.push(literalElement);
      }
    });
    return literalElements;


  });


  subjectIri = toSignal<string | undefined>(this.#route.paramMap.pipe(
    takeUntilDestroyed(this.#destroyRef),
    map((params) => params.get('subject')),
    map((subject) => {
      if (subject === null) {
        this.#router.navigate(['explore']);
        return '';
      }
      return subject;
    })
  ), { initialValue: undefined });


  // graph events
  onNodeSelected(node: IUiGraphNode): void {
    this.nodeExploreCommand = 'select';
    this.selectByIri(node.id);
  }

  selectByIri(iri: string): void {
    this.#selectionService.setSelectedNode(iri);
    this.selectionKind.set('node');
    this.#router.navigate(['explore', iri], { fragment: this.routeFragment() });
  }

  expandNode(node: IUiGraphNode): void {
    this.nodeExploreCommand = 'expand';
    if (this.selectedNodeIri() === node.id) {
      this.#graphService.expandNode(node.id);
      return;
    }
    this.selectByIri(node.id);
  }

  focusNode(node: IUiGraphNode): void {
    this.#graphService.clearGraph();
    this.nodeExploreCommand = 'expand';
    if (this.selectedNodeIri() === node.id) {
      this.#graphService.expandNode(node.id);
      return;
    }
    this.selectByIri(node.id);
  }

  showNodeDetails(node: IUiGraphNode): void {
    console.log('showNodeDetails', node);
    this.nodeExploreCommand = 'select';
    this.selectByIri(node.id);
    this.visible.set(true);
  }

  copyToClipboard(text: string): void {
    this.#clipboard.copy(text);
  };

  toggleModalDetailsDrawer(): void {
    this.visible.set(!this.visible());
    window.setTimeout(() => {
      const currentPinDetailsPanel = this.pinDetailsPanel();
      this.pinDetailsPanel.set(!currentPinDetailsPanel);
      if (!currentPinDetailsPanel) {
        window.setTimeout(() => {
          this.visible.set(!this.visible());

        }, 400);
      }
    }, 200);
  }

  selectLink(link: ConsolidatedLink): void {
    this.selectedLink.set(link);
    this.showLinks.set(true);
    this.visible.set(true);
    this.selectionKind.set('link');
  }

  ngOnDestroy(): void {
    console.log('%cExploreComponent ngOnDestroy', 'color: red; font-weight: bold;');
    this.#graphService.clearGraph();
    this.#selectionService.clearSelection();
  }
}


