import { Injectable, inject } from '@angular/core';

import { Observable, map, switchMap } from 'rxjs';


import { ViewMetadata } from '../view-metadata/view-metadata.service';
import { RdfUiView, RdfUiViewComponentDefinition, UiView } from '../../model/ui-view.model';

import { HierarchyService } from 'projects/blueprint/src/app/features/configuration/topology/service/hierarchy.service';
import { MessageChannelService } from '../../../service/message-channel/message-channel.service';
import { UiDetailService } from '../../../service/ui-config/ui-detail/ui-detail.service';

import { flux, rdf, shacl, nileaUi, blueprintShape } from '@blueprint/ontology';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { sparqlUtils } from 'projects/blueprint/src/app/core/utils/sparql-utils';
import { AggregateService } from '@blueprint/service/graph/aggregate/aggregate.service';
import { HierarchyDefinition } from 'projects/blueprint/src/app/features/configuration/topology/service/model/hierarchy-definition.model';
import { rdfEnvironment, RdfTypes } from '../../../rdf/rdf-environment';
import { defaultSubjectQuery } from './query/default-subject.query';

@Injectable({
  providedIn: 'root'
})
/**
 * This service is responsible for fetching the data for a given subject and the corresponding view definition.
 * It uses the ViewMetadataService to get the view definition for the subject.
 * It uses the SparqlService to fetch the data for the subject.
 */
export class ViewDataService {
  readonly #messageChannel = inject(MessageChannelService);

  readonly #uiClassMetadataService = inject(UiClassMetadataService);
  readonly #sparql = inject(SparqlService);
  readonly #viewMetadata = inject(ViewMetadata);
  readonly #hierarchyService = inject(HierarchyService);
  readonly #uiDetailService = inject(UiDetailService);
  readonly #aggregateService = inject(AggregateService);

  getViewForSubject(subject: RdfTypes.NamedNode): Observable<RdfTypes.Dataset> {
    const dataset = rdfEnvironment.dataset();
    const typeQuery = `
    ${shacl.sparqlPrefix()}
    ${blueprintShape.sparqlPrefix()}
    
    CONSTRUCT {
      <${subject.value}> a ?type .
    }
    WHERE {
      <${subject.value}> a ?type .
      ?meta ${shacl.targetNodePrefixed} ?type .
      ?meta a ${blueprintShape.ClassMetadataShapePrefixed}.
    }
    `;

    let types: string[] = [];
    // 0. fetch the type of the subject
    const obs = this.#sparql.construct(typeQuery).pipe(
      switchMap((typeGraph) => {
        dataset.addAll(typeGraph);

        /* 1. get the rdf types of the subject and get the UIView and getViewConfigForClassQuery */
        const typeCfGraph = rdfEnvironment.clownface(typeGraph, subject);
        types = typeCfGraph.out(rdf.typeNamedNode).values;

        const viewMetaQueries = types.map((type) => this.#viewMetadata.getViewConfigForClassQuery(rdfEnvironment.namedNode(type)));

        const hierarchyQueries = this.#hierarchyService.getAllHierarchiesQuery();

        const aggregateToAggregateLinkQueries = types.map((type) => this.#aggregateService.getCompositionToCompositionLinksForClassQuery(type));
        const aggregateToNodeLinkQueries = types.map((type) => this.#aggregateService.getAggregateToNodeLinkForClassQuery(type));
        const uiClassMetadataQuery = this.#uiClassMetadataService.getClassMetadataSparqlQuery();


        const mergedMetaQuery = sparqlUtils.mergeConstruct([...viewMetaQueries, hierarchyQueries, uiClassMetadataQuery, ...aggregateToNodeLinkQueries, ...aggregateToAggregateLinkQueries]);

        return this.#sparql.construct(mergedMetaQuery);
      }),
      switchMap((viewGraphMetadata) => {
        dataset.addAll(viewGraphMetadata);

        /* 1. get detail config */
        const uiDetails = [] //this.#uiDetailService.extractUiDetails(viewGraphMetadata);
        const uiDetailQueries = uiDetails.map((uiDetail) => uiDetail.getSparqlDetailQueryForSubject(subject));

        /* 2. get the sparql queries from the UiComponentDefinition and create a query to fetch the data the the whole View */
        const viewMetadataGraph = rdfEnvironment.clownface(viewGraphMetadata, nileaUi.UiViewNamedNode);
        const uiViews: UiView[] = viewMetadataGraph.in(rdf.typeNamedNode).map((view) => {
          const uiView = new RdfUiView(view);
          return uiView;
        });
        const uiViewQueries = uiViews.flatMap((uiView) => uiView.viewContainer.flatMap(container => container.viewComponent.flatMap(component => {
          const query = (component.componentDefinition as RdfUiViewComponentDefinition).generateSparqlQueryForSubject(subject);
          return query;
        })));


        // 2.1 get the hierarchy definitions
        const hierarchyGraph = rdfEnvironment.clownface(viewGraphMetadata).node(flux.HierarchyNamedNode).in(rdf.typeNamedNode);
        const hierarchyDefinitions = hierarchyGraph.map(hierarchyCfNode => new HierarchyDefinition(rdfEnvironment.namedNode(hierarchyCfNode.value), viewGraphMetadata)).filter(d => {
          const classesInHierarchy = d.aggregateNodes.map(node => node.targetClassIri);
          return classesInHierarchy.some(c => types.includes(c));

        });

        const hierarchyViews: UiView[] = [];
        const implicitViewsFromHierarchies: UiView[] = hierarchyDefinitions.flatMap((hierarchyDefinition, index) => {
          const sparqlTemplates = types.map((type, index) => hierarchyDefinition.getViewQuerySparqlTemplate(type, hierarchyDefinition.iri + '/view/' + index + "-" + index)).filter(template => template.length > 0);
          if (sparqlTemplates.length === 0) {
            return [];
          }
          const views: UiView[] = sparqlTemplates.map((sparqlTemplate, i) => {
            const view: UiView = {
              iri: hierarchyDefinition.iri + '/view/' + i + "-" + index,
              viewContainer: [
                {
                  iri: `${hierarchyDefinition.iri}/viewContainer/${i}-${index}`,
                  order: index,
                  viewComponent: [
                    {
                      iri: `${hierarchyDefinition.iri}/viewComponent/${i}-${index}`,
                      componentDefinition: {
                        iri: `${nileaUi.namespace[''].value}/TreeViewDefinition/${i}-${index}`,
                        componentIri: `${nileaUi.namespace[''].value}/TreeViewComponent/${i}-${index}`,
                        comment: '',
                        label: hierarchyDefinition.label,
                        sparqlQuery: sparqlTemplate,
                      },
                    }],
                }
              ]
            };
            return view;
          });
          return views;
        });



        hierarchyViews.push(...implicitViewsFromHierarchies);


        const hierarchyQueries = hierarchyDefinitions.flatMap(hierarchyDefinition => {
          const queries = types.map(type => {
            const query = hierarchyDefinition.getDataSparqlQueryForType(type);
            const queryWithSubject = query.replaceAll(/(SELECT\s+.*?)\?subject\s*(?=.*WHERE)/gi, "$1") // Remove ?subject from SELECT
              .replaceAll(/\?subject/g, `<${subject.value}>`);
            const queryWithComponentIri = queryWithSubject.replaceAll(/(SELECT\s+.*?)\?componentIri\s*(?=.*WHERE)/gi, "$1") // Remove ?subject from SELECT
              .replaceAll(/\?componentIri/g, `<${hierarchyDefinition.iri}>`);
            return queryWithComponentIri;
          });

          return queries;
        }
        );

        // 2.2 get the aggregate link to aggregate link queries

        const compositionToCompositionQueries = this.#aggregateService.getCompositionToCompositionLinkQueries(viewGraphMetadata, types, subject.value);

        const compositionToNodeLinkQueries = this.#aggregateService.getCompositionToNodeLinkQueries(viewGraphMetadata, types, subject.value);
        compositionToNodeLinkQueries.forEach(console.log);
        /* 3. get the sparql queries from the UiComponentDefinition and create a query to fetch the data the the whole View */

        const hierarchyViewQueries = hierarchyViews.map(uiView => {
          return uiView.viewContainer.map(viewContainer => {
            const viewComponents = viewContainer.viewComponent;
            const sparqlQueries = viewComponents.map(viewComponent => {
              // update query with subject
              const queryWithSubject = viewComponent.componentDefinition.sparqlQuery
                .replaceAll(/(SELECT\s+.*?)\?subject\s*(?=.*WHERE)/gi, "$1") // Remove ?subject from SELECT
                .replaceAll(/\?subject/g, `<${subject.value}>`);
              // update query with componentIri
              const queryWithComponentIri = queryWithSubject.replaceAll('?componentIri ', `<${viewComponent.iri}> `);
              // update query with componentDataIri
              const queryWithComponentDataIri = queryWithComponentIri.replaceAll('?componentDataIri ', `<${viewComponent.iri}/data> `);

              return queryWithComponentDataIri;
            });
            return sparqlQueries;
          }).flat();
        }).flat();


        // add default query
        const queries = [defaultSubjectQuery(subject), ...hierarchyViewQueries, ...uiViewQueries, ...hierarchyQueries, ...uiDetailQueries, ...compositionToCompositionQueries, ...compositionToNodeLinkQueries];

        // merge all queries
        const mergedQuery = sparqlUtils.mergeConstruct(queries);

        return this.#sparql.construct(mergedQuery);
      }
      ),
      map((viewGraph) => {
        dataset.addAll(viewGraph);

        /* 3. all the query results are collected in one dataset. It contains the data for the component and the UiView definition graph */
        return dataset;
      }
      )

    );

    return obs;

  }



}

