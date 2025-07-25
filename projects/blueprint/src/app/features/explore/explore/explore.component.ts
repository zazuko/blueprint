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

import { map, of, switchMap, tap } from 'rxjs';

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
import { IUConsolidatedLink, IUiGraphNode } from '@blueprint/component/graph/model/graph.model';
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
//import { LinkPanelComponent } from "../link-panel/link-panel.component";
import { NodeRelationsComponent } from '@blueprint/component/node-relations/node-relations.component';

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
    // LinkPanelComponent,
    NodeRelationsComponent
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

  readonly selectedNodeIri = this.#selectionService.selectedNodeIriSignal;
  tabNavItems: MenuItem[] = [
    { label: 'Information', icon: 'pi pi-info-circle', fragment: 'Information' },
    { label: 'Context', icon: 'pi pi-sitemap', fragment: 'Context' },
    { label: 'Relations', icon: 'pi pi-arrow-right-arrow-left', fragment: 'Relations' },
    { label: 'Graph', icon: 'fa-solid fa-circle-nodes', fragment: 'Graph' },
  ];

  public activeItem = this.tabNavItems[0];
  routeFragment = toSignal(this.#route.fragment.pipe(map(f => { if (f === null) { return 'Information' } return f })), { initialValue: 'Information' });

  isInformationPanelOpen = model<boolean>(false);

  canIOpenInformationPanel = computed(() => {
    return this.routeFragment() === 'Graph';
  });

  selectionKind = signal<SelectionKind>('node');
  showLinks = signal<boolean>(false);
  selectedLink = signal<IUConsolidatedLink | null>(null);

  selectedLinkIri = computed(() => {
    const link = this.selectedLink();
    if (!link) {
      return '';
    }
    return link.iri;
  });


  public bubbleGraph = this.#graphService.graphSignal;



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
      if (subject) {
        this.#selectionService.setSelectedNode(subject);
      }
    })
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
    if (currentResource === undefined) {
      return [];
    }
    const literalMap = currentResource.getLiteralTripleMap();
    const literalRules = this.literalConfigurationRules();
    const literalElements: UILiteral[] = [];

    [...literalMap.keys()].forEach((key) => {
      const literalValues = literalMap.get(key).map(q => q.object as RdfTypes.Literal);

      if (!literalRules) {
        console.warn('No literal rules found for key:', key);
      }
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
        const predicateAbox = currentResource.getPrdicateAbox(key);
        const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);


        const literalElement: UILiteral = {
          ruleIri: key,
          label: capitalizedLabel,
          order: 10,
          value: literalValues,
          renderer: LiteralRenderType.PLAIN,
          predicate: predicateAbox
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

  viewGraphDataset = toSignal(toObservable<string | undefined>(this.subjectIri).pipe(
    switchMap((subjectIri) => {
      if (subjectIri === undefined) {
        return of(rdfEnvironment.dataset());
      }
      this.loadingIndicatorService.start();
      return this.#viewData.getViewForSubject(rdfEnvironment.namedNode(subjectIri))
    }),
    takeUntilDestroyed(this.#destroyRef),
    tap(() => {
      this.loadingIndicatorService.done();
    })
  )
  );

  currentGraphResource = computed<ExploredResource | undefined>(() => {
    const viewGraphDataset = this.viewGraphDataset();

    if (!viewGraphDataset || viewGraphDataset.size === 0) {
      return undefined;
    }

    const currentNode = rdfEnvironment.clownface(viewGraphDataset).namedNode(this.subjectIri());
    if (!currentNode) {
      return undefined;
    }
    const currentResource = new ExploredResource(currentNode);
    return currentResource;
  });

  compositionLinks = computed<CompositionLinkResult[]>(() => {
    const viewGraphDataset = this.viewGraphDataset();
    const cfViewGraph = rdfEnvironment.clownface(viewGraphDataset, nileaUi.UiViewNamedNode);
    return cfViewGraph.node(flux.CompositionLinkResultNamedNode).in(rdf.typeNamedNode).map((node) => new CompositionLinkResult(node));
  });

  thisNodeElement = computed<NodeElement | null>(() => {
    const subjectIri = this.subjectIri();
    if (!subjectIri) {
      return null;
    }
    const viewGraphDataset = this.viewGraphDataset();
    const thisNode = rdfEnvironment.clownface(viewGraphDataset).namedNode(this.subjectIri());
    if (!thisNode.value) {
      return null;
    }
    return new NodeElement(thisNode);
  }
  );

  uiView = computed<UiView[]>(() => {
    const subjectIri = this.subjectIri();
    if (!subjectIri) {
      return [];
    }

    const viewGraphDataset = this.viewGraphDataset();
    const cfViewGraph = rdfEnvironment.clownface(viewGraphDataset, nileaUi.UiViewNamedNode);
    const uiView = cfViewGraph.in(rdf.typeNamedNode).map(view => new RdfUiView(view));

    return uiView;
  });

  uiHierarchy = computed<UiHierarchyView[]>(() => {
    const subjectIri = this.subjectIri();
    if (!subjectIri) {
      return [];
    }

    const viewGraphDataset = this.viewGraphDataset();
    return rdfEnvironment.clownface(viewGraphDataset).node(flux.HierarchyNamedNode).in(rdf.typeNamedNode).map(view => new RdfUiHierarchyView(rdfEnvironment.namedNode(view.value), viewGraphDataset));
  });


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

  expandNode(node: IUiGraphNode | NodeElement): void {
    this.nodeExploreCommand = 'expand';
    if (this.selectedNodeIri() === node.iri) {
      this.#graphService.expandNode(node.iri);
      return;
    }
    this.selectByIri(node.iri);
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
    this.isInformationPanelOpen.set(true);
  }

  copyToClipboard(text: string): void {
    this.#clipboard.copy(text);
  };

  selectLink(link: IUConsolidatedLink): void {
    this.selectedLink.set(link);

    this.showLinks.set(true);
    this.isInformationPanelOpen.set(true);
    this.selectionKind.set('link');
  }

  ngOnDestroy(): void {
    this.#graphService.clearGraph();
    this.#selectionService.clearSelection();
  }
}
