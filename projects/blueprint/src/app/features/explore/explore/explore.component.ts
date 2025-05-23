import {
  Component,
  inject,
  signal,
  DestroyRef,
  computed,
  effect,
} from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { map, switchMap } from 'rxjs';

import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';


import { ExploreHeaderComponent } from '../explore-header/explore-header.component';
import { GraphComponent } from '../../../core/component/graph/graph/graph.component';
import { NeighborNodesComponent } from "../../../core/component/neighbor-nodes/neighbor-nodes.component";
import { UiViewComponent } from '../../../core/ui-view/ui-view/ui-view.component';
import { ViewDataService } from '../../../core/ui-view/service/view-data/view-data.service';
import { RdfUiView, UiView } from '../../../core/ui-view/model/ui-view.model';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { UiHierarchyViewComponent } from '../../../core/ui-view/ui-hierarchy-view/ui-hierarchy-view.component';

import { flux, nileaUi, rdf, } from '@blueprint/ontology';
import { IUiGraphNode } from '@blueprint/component/graph/model/graph.model';
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
    LiteralComponent
  ]
})
export class ExploreComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #graphService = inject(GraphService);
  readonly #selectionService = inject(SelectionService);
  readonly #viewData = inject(ViewDataService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #uiDetailService = inject(UiDetailService);
  readonly loadingIndicatorService = inject(LoadingIndicatorService);

  readonly compositionLinks = signal<CompositionLinkResult[]>([]);
  readonly thisNodeElement = signal<NodeElement | null>(null);

  tabNavItems: MenuItem[] = [
    { label: 'Information', icon: 'pi pi-info-circle', fragment: 'Information' },
    { label: 'Context', icon: 'pi pi-sitemap', fragment: 'Context' },
    { label: 'Nearby', icon: 'pi pi-fw pi-calendar', fragment: 'Nearby' },
    { label: 'Graph', icon: 'fa-solid fa-circle-nodes', fragment: 'Graph' },
  ];

  public activeItem = this.tabNavItems[0];


  // this is the IRI of the subject in the route
  public currentGraphResource = signal<ExploredResource | null>(null);
  public bubbleGraph = this.#graphService.graphSignal;

  expandedNode: IUiGraphNode | null = null;
  routeFragment = toSignal(this.#route.fragment, { initialValue: 'Information' });


  uiView: UiView[] = [];
  uiHierarchy: UiHierarchyView[] = [];
  term: string;

  searchTerm: string;
  searchFilter: string;
  expanded = true;

  constructor() {
    this.#graphService.clearGraph();

    effect(() => {
      const subject = this.subjectIri();
      console.log('subject', subject);
      if (subject === undefined) {
        return;
      }

      this.#graphService.expandNode(subject);
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
    this.expandedNode = node;
    this.selectByIri(node.id);
  }

  onNodeElementSelected(node: IUiGraphNode): void {
    this.selectByIri(node.iri);
  }

  selectByIri(iri: string): void {
    this.#selectionService.setSelectedNode(iri);
    this.#router.navigate(['explore', iri], { fragment: this.routeFragment() });
  }

  onNodeExpanded(node: IUiGraphNode): void {
    this.expandedNode = node;
    this.loadingIndicatorService.loading();

    this.#graphService.expandNode(node.id);
  }

  onNodeFocused(node: IUiGraphNode): void {
    this.#graphService.clearGraph();
    this.expandedNode = node;
    this.#graphService.expandNode(node.id);
  }

}

