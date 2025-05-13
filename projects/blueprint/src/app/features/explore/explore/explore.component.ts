import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  DestroyRef,
  AfterViewInit,
  computed,
  effect,
} from '@angular/core';
import { ActivatedRoute, RouterModule, Router, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { Observable, map, switchMap, tap } from 'rxjs';

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
import { Avatar } from '../../../core/component/avatar/avatar.component';

import { blueprint, nileaUi, rdf, rdfs, shacl, schema, skos } from '@blueprint/ontology';
import { Graph, IUiGraphNode } from '@blueprint/component/graph/model/graph.model';
import { RdfUiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { CompositionLinkResult } from '@blueprint/service/graph/aggregate/model/composition-link-result/composition-result';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';

import { UiDetailService } from '../../../core/service/ui-config/ui-detail/ui-detail.service';
import { IUiDetailElement } from '../../../core/service/ui-config/ui-detail/model/ui-detail-element';
import { LiteralViewComponent } from "../../../core/ui-view/ui-detail-view/literal-view/literal-view.component";
import { RdfUiHierarchyView, UiHierarchyView } from '../../../core/ui-view/ui-hierarchy-view/model/ui-hierarchy-view';
import { GraphService } from '../service/graph/graph.service';
import { SelectionService } from '../service/selection/selection.service';
import { AggregateRelationComponent } from "../../../core/ui-view/view-component-library/aggregate-relation/aggregate-relation.component";

import { rdfEnvironment, RdfTypes } from '../../../core/rdf/rdf-environment';
import { fadeInOut, fadeIn } from '../../../core/animation/fade-in-out/fade-in-out';
import { PanelModule } from 'primeng/panel';
import { GraphPointer } from 'clownface';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { UILiteral, LiteralComponent } from '../../../core/ui-view/ui-detail-view/literal/literal.component';
import { LiteralRenderType } from '@blueprint/service/ui-config/ui-detail/model/ui-detail-configuration-element';

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
    LiteralViewComponent,
    AggregateRelationComponent,
    TooltipModule,
    TabsModule,
    PanelModule,
    LiteralComponent
  ]
})
export class ExploreComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #graphService = inject(GraphService);
  readonly #selectionService = inject(SelectionService);
  readonly #viewData = inject(ViewDataService);
  readonly #destroyRef = inject(DestroyRef);
  public readonly loadingIndicatorService = inject(LoadingIndicatorService);
  readonly #uiDetailService = inject(UiDetailService);

  public compositionLinks = signal<CompositionLinkResult[]>([]);
  public thisNodeElement = signal<NodeElement | null>(null);

  tabNavItems: MenuItem[] = [
    { label: 'Information', icon: 'pi pi-info-circle', fragment: 'Information' },
    { label: 'Context', icon: 'pi pi-sitemap', fragment: 'Context' },
    { label: 'Nearby', icon: 'pi pi-fw pi-calendar', fragment: 'Nearby' },
    { label: 'Graph', icon: 'fa-solid fa-circle-nodes', fragment: 'Graph' },
  ];

  public activeItem = this.tabNavItems[0];

  public currentGraphResource = signal<GraphResource | null>(null);

  subject: string = '';
  graphOpenState = signal(true);
  expandedNode: IUiGraphNode | null = null;
  routeFragment = toSignal(this.#route.fragment, { initialValue: 'Information' });


  uiView: UiView[] = [];
  uiHierarchy: UiHierarchyView[] = [];
  term: string;
  graph = signal<Graph>({ nodes: [], links: [] });

  uiDetailElementsSignal = signal<IUiDetailElement[]>([]);

  searchTerm: string;
  searchFilter: string;
  expanded = true;

  routeParamMap$: Observable<ParamMap>
  graph$: Observable<Graph>;


  constructor() {
    this.routeParamMap$ = this.#route.paramMap;
  }

  literalConfigurationRules = toSignal(toObservable(computed(() => {
    return this.currentGraphResource()?.rdfTypeIri ?? [];
  })).pipe(
    switchMap((rdfTypeIri) => this.#uiDetailService.getLiteralRulesForClasses(rdfTypeIri)),
    map((rules) => {

      return rules;
    }))
  );

  literalDetailElements = computed<UILiteral[]>(() => {
    const currentResource = this.currentGraphResource();
    if (currentResource === null) {
      return [];
    }
    const literalMap = currentResource.getLiteralTripleMap();
    const literalRules = this.literalConfigurationRules();
    const literalElements: UILiteral[] = [];

    console.log('literalMap', literalMap);
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


  ngOnInit(): void {

    this.#graphService.clearGraph();


    this.#graphService.graph$.pipe(
      takeUntilDestroyed(this.#destroyRef),
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
      takeUntilDestroyed(this.#destroyRef),
      tap(() => {
        this.loadingIndicatorService.loading();
      }),
      map((params) => params.get('subject')),
      switchMap((subject) => {
        this.subject = subject;
        this.#graphService.expandNode(subject);
        return this.#viewData.getViewForSubject(rdfEnvironment.namedNode(subject));
      }),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe(
      {
        next: (viewGraph) => {
          const currentResource = new GraphResource(rdfEnvironment.clownface(viewGraph).namedNode(this.subject));
          this.currentGraphResource.set(currentResource);
          console.log('viewGraph', viewGraph);
          const cfViewGraph = rdfEnvironment.clownface(viewGraph, nileaUi.UiViewNamedNode);

          // ---- composition link result
          this.compositionLinks.set(cfViewGraph.node(blueprint.CompositionLinkResultNamedNode).in(rdf.typeNamedNode).map((node) => new CompositionLinkResult(node)));
          this.thisNodeElement.set(cfViewGraph.namedNode(this.subject).map((node) => new NodeElement(node))[0]);
          // ---- composition link result end

          const cfHierarchyGraph = rdfEnvironment.clownface(viewGraph).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
          const uiDetails = [] //this.#uiDetailService.extractUiDetailComponents(this.subject, viewGraph);
          this.uiDetailElementsSignal.set(uiDetails.sort((a, b) => a.order - b.order));
          // make it better 
          const subjectGraph = rdfEnvironment.clownface(viewGraph).namedNode(this.subject);


          this.uiView = cfViewGraph.in(rdf.typeNamedNode).map(view => new RdfUiView(view));
          this.uiView.length === 0 ? this.graphOpenState.set(true) : this.graphOpenState.set(false);

          this.uiHierarchy = cfHierarchyGraph.map(view => new RdfUiHierarchyView(rdfEnvironment.namedNode(view.value), viewGraph));

          this.loadingIndicatorService.done();
          this.#selectionService.setSelectedNode(this.subject);
        },
        error: (error) => {
          console.error('error', error);
          this.loadingIndicatorService.done();
        }
      });
  }

  ngOnDestroy(): void {
    this.#selectionService.clearSelection();
  }


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



class GraphResource extends ClownfaceObject {

  #title: string | undefined = undefined;
  #avatars: Avatar[] | undefined = undefined;
  #classLabel: string | undefined = undefined;
  #rdfTypeIri: string[] | null = null;

  constructor(node: GraphPointer) {
    super(node);
  }

  get rdfTypeIri(): string[] {
    if (this.#rdfTypeIri === null) {
      this.#rdfTypeIri = this._node.out(rdf.typeNamedNode).values;
    }
    return this.#rdfTypeIri;
  }

  /**
   * Get the title of the resource. It will try to get the title from the following predicates in order:
   * - skos:prefLabel
   * - rdfs:label
   * - schema:name
   * - the resource IRI
   * 
   * Then it is ordered by the language tag. We find a label with the language tag "en" first. This my be not 
   * the best solution, but it is the best we can do for now.
   */
  get title(): string {
    if (this.#title === undefined) {
      const rdfsLabelTerm = this._node.out(rdfs.labelNamedNode).terms.filter((term) => term.termType === 'Literal');
      const schemaNameTerm = this._node.out(schema.nameNamedNode).terms.filter((term) => term.termType === 'Literal');
      const skosPrefLabelTerm = this._node.out(skos.prefLabelNamedNode).terms.filter((term) => term.termType === 'Literal');

      if (skosPrefLabelTerm.length > 0) {
        this.#title = skosPrefLabelTerm.sort(precedence)[0].value;
      }
      else if (rdfsLabelTerm.length > 0) {
        this.#title = rdfsLabelTerm.sort(precedence)[0].value;
      }
      else if (schemaNameTerm.length > 0) {
        // order by langage tag and terms with langage en first
        this.#title = schemaNameTerm.sort(precedence)[0].value;
      }
      else {
        this.#title = this._node.value;
      }
    }
    return this.#title;
  }

  /**
   * Get the avatars of the resource.
   */
  get avatars(): Avatar[] {
    if (this.#avatars === undefined) {
      const metaGraph = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode);
      const avatarArray: Avatar[] = metaGraph.map((metaData) => {
        const uiClassMetaData = new RdfUiClassMetadata(metaData);
        const icon = uiClassMetaData.icon;
        const color = uiClassMetaData.color;
        const label = uiClassMetaData.label;
        return { label, icon, color };
      });
      this.#avatars = avatarArray;
    }
    return this.#avatars;
  }

  /**
   * Get the class label of the resource.
   * 
   * @todo: this should be part of the avatar
   */
  get classLabel(): string {
    if (this.#classLabel === undefined) {
      const metaGraph = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode);
      this.#classLabel = metaGraph.out(rdfs.labelNamedNode).values.join(',')
    }
    return this.#classLabel;
  }

  /**
   * Get all predicates for the resource where the object is a literal.
   * 
   * @returns An array of literal predicates for the resource. This is done by getting all the quads for the resource and filtering
   */
  getLiteralTripleMap(): Map<string, RdfTypes.Quad[]> {
    const quads = [...this._node.dataset.match(this._node.term, null, null)];
    const literalQuads = quads.filter(quad => quad.object.termType === 'Literal');
    // create a map with predicate as key and then the quads as array
    const literalPredicateMap = new Map<string, RdfTypes.Quad[]>();
    literalQuads.forEach((quad) => {
      const key = quad.predicate.value;
      if (!literalPredicateMap.has(key)) {
        literalPredicateMap.set(key, []);
      }
      literalPredicateMap.get(key)?.push(quad);
    });
    return literalPredicateMap;
  }

  resolveLabelForPredicate(predicate: string): string {
    const predicatePtr = this._node.namedNode(predicate);
    const rdfsLabelTerms = predicatePtr.out(rdfs.labelNamedNode).terms as RdfTypes.Literal[];
    const skosPrefLabelTerms = predicatePtr.out(skos.prefLabelNamedNode).terms as RdfTypes.Literal[];
    const name = [...rdfsLabelTerms, ...skosPrefLabelTerms].sort(precedence);
    if (name.length > 0) {
      return name[0].value;
    }
    const predicateString = predicate.includes('#')
      ? predicate.split('#').pop()
      : predicate.split('/').pop();
    if (predicateString) {
      return predicateString.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    return predicate;
  }




}


function precedence(a: RdfTypes.Literal, b: RdfTypes.Literal): number {
  const aTerm = a as RdfTypes.Literal;
  const bTerm = b as RdfTypes.Literal;
  if (aTerm.language.startsWith('en') && !aTerm.language.startsWith('en')) {
    return -1;
  } else if (!aTerm.language.startsWith('en') && bTerm.language.startsWith('en')) {
    return 1;
  } else {
    return 0;
  }
}