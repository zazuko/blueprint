import { Injectable, inject } from '@angular/core';

import { Observable, map, switchMap } from 'rxjs';

import rdfEnvironment from '@zazuko/env';
import { Dataset, NamedNode } from '@rdfjs/types';

import { ViewMetadata } from '../view-metadata/view-metadata.service';
import { RdfUiView, UiView } from '../../model/ui-view.model';

import { HierarchyService } from 'projects/blueprint/src/app/features/configuration/topology/service/hierarchy.service';
import { MessageChannelService } from '../../../service/message-channel/message-channel.service';
import { UiDetailService } from '../../../service/ui-config/ui-detail/ui-detail.service';

import { blueprint, rdf, rdfs, shacl, nileaUi, blueprintShape } from '@blueprint/ontology';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { sparqlUtils } from '@blueprint/utils';
import { AggregateService } from '@blueprint/service/graph/aggregate/aggregate.service';
import { HierarchyDefinition } from 'projects/blueprint/src/app/features/configuration/topology/service/model/hierarchy-definition.model';

@Injectable({
  providedIn: 'root'
})
/**
 * This service is responsible for fetching the data for a given subject and the corresponding view definition.
 * It uses the ViewMetadataService to get the view definition for the subject.
 * It uses the SparqlService to fetch the data for the subject.
 */
export class ViewDataService {
  private readonly messageChannel = inject(MessageChannelService);

  private readonly uiClassMetadataService = inject(UiClassMetadataService);
  private readonly sparql = inject(SparqlService);
  private readonly viewMetadata = inject(ViewMetadata);
  private readonly hierarchyService = inject(HierarchyService);
  private readonly uiDetailService = inject(UiDetailService);
  private readonly aggregateService = inject(AggregateService);

  getViewForSubject(subject: NamedNode): Observable<Dataset> {
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
    const obs = this.sparql.constructWithoutReasoning(typeQuery).pipe(
      switchMap((typeGraph) => {
        dataset.addAll(typeGraph);

        /* 1. get the rdf types of the subject and get the UIView and getViewConfigForClassQuery */
        const typeCfGraph = rdfEnvironment.clownface({ dataset: typeGraph, term: subject });
        types = typeCfGraph.out(rdf.typeNamedNode).values;


        const viewMetaQueries = types.map((type) => this.viewMetadata.getViewConfigForClassQuery(rdfEnvironment.namedNode(type)));

        const hierarchyQueries = this.hierarchyService.getAllHierarchiesQuery();

        const aggregateToAggregateLinkQueries = types.map((type) => this.aggregateService.getCompositionToCompositionLinksForClassQuery(type));
        const aggregateToNodeLinkQueries = types.map((type) => this.aggregateService.getAggregateToNodeLinkForClassQuery(type));

        const uiDetailQueries = types.map((type) => this.uiDetailService.getUiDetailForClassQuery(type));

        const mergedMetaQuery = sparqlUtils.mergeConstruct([...viewMetaQueries, hierarchyQueries, ...uiDetailQueries, ...aggregateToNodeLinkQueries, ...aggregateToAggregateLinkQueries]);


        return this.sparql.construct(mergedMetaQuery);
      }),
      switchMap((viewGraphMetadata) => {
        dataset.addAll(viewGraphMetadata);

        /* 1. get detail config */
        const uiDetails = this.uiDetailService.extractUiDetails(viewGraphMetadata);
        const uiDetailQueries = uiDetails.map((uiDetail) => uiDetail.getSparqlDetailQueryForSubject(subject.value));

        /* 2. get the sparql queries from the UiComponentDefinition and create a query to fetch the data the the whole View */
        const viewMetadataGraph = rdfEnvironment.clownface({ dataset: viewGraphMetadata, term: nileaUi.UiViewNamedNode });
        const uiViews: UiView[] = viewMetadataGraph.in(rdf.typeNamedNode).map((view) => {
          const uiView = new RdfUiView(view);
          return uiView;
        });

        // 2.1 get the hierarchy definitions
        const hierarchyGraph = rdfEnvironment.clownface({ dataset: viewGraphMetadata }).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
        const hierarchyDefinitions = hierarchyGraph.map(hierarchyCfNode => new HierarchyDefinition(rdfEnvironment.namedNode(hierarchyCfNode.value), viewGraphMetadata)).filter(d => {
          const classesInHierarchy = d.aggregateNodes.map(node => node.targetClassIri);
          return classesInHierarchy.some(c => types.includes(c));

        });

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


        uiViews.push(...implicitViewsFromHierarchies);

        const hierarchyQueries = hierarchyDefinitions.flatMap(hierarchyDefinition => {
          const queries = types.map(type => hierarchyDefinition.getDataSparqlQueryForType(type));
          return queries;
        }
        );


        // 2.2 get the aggregate link to aggregate link queries
        const compositionToCompositionQueries = this.aggregateService.getCompositionToCompositionLinkQueries(viewGraphMetadata, types, subject.value);
        const compositionToNodeLinkQueries = this.aggregateService.getCompositionToNodeLinkQueries(viewGraphMetadata, types, subject.value);

        /* 3. get the sparql queries from the UiComponentDefinition and create a query to fetch the data the the whole View */
        const viewQueries = uiViews.map(uiView => {
          return uiView.viewContainer.map(viewContainer => {
            const viewComponents = viewContainer.viewComponent;
            const sparqlQueries = viewComponents.map(viewComponent => {
              return viewComponent.componentDefinition.sparqlQuery;
            });
            return sparqlQueries;
          }).flat();
        }).flat();

        // generate values clause

        const valuesVariables: string[] = [];

        // to this but for the viewQueries and the hierarchyQueries
        const numberOfQueries = viewQueries.length + hierarchyQueries.length;

        for (let index = 0; index < numberOfQueries; index++) {
          valuesVariables.push(`?${index}_subject`);
          valuesVariables.push(`?${index}_componentIri`);
          valuesVariables.push(`?${index}_componentDataIri`);
        }
        const values: string[] = [];

        uiViews.forEach(uiView => {
          uiView.viewContainer.forEach(viewContainer => {
            viewContainer.viewComponent.forEach(component => {
              values.push(`<${subject.value}>`);
              values.push(`<${component.iri}>`);
              values.push(`<${component.iri}/data>`);
            });
          });
        });
        hierarchyDefinitions.forEach(hierarchyDefinition => {
          values.push(`<${subject.value}>`);
          values.push(`<${hierarchyDefinition.iri}>`);
          values.push(`<${hierarchyDefinition.iri}/not_used>`);
        }
        );

        let valuesClause = '';
        if (values.length > 0) {
          valuesClause = `\nVALUES (${valuesVariables.join(' ')}) {\n  (${values.join(' ')})\n}`;

        }
        // done values clause


        // add default query
        const queries = [...viewQueries, ...hierarchyQueries, defaultQuery(subject), ...uiDetailQueries, ...compositionToCompositionQueries, ...compositionToNodeLinkQueries];

        // merge all queries
        const mergedQuery = sparqlUtils.mergeConstruct(queries);

        return this.sparql.construct(mergedQuery + valuesClause);
      }
      ),
      map((viewGraph) => {
        dataset.addAll(viewGraph);
        /* 3. all the query results are collected in one dataset. It contains the data for the component and the UiView definition graph */
        return dataset as unknown as Dataset;
      }
      )

    );

    return obs;

  }



}


function defaultQuery(subject: NamedNode): string {
  return `
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${shacl.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}

  CONSTRUCT {
    <${subject.value}> ?p ?o .
    ?metaShape ?shapeP ?oo .
  }
  WHERE {
    {
      VALUES (?p) {
        (${rdf.typePrefixed})
        (${rdfs.labelPrefixed})
        (${rdfs.commentPrefixed})
      }
      <${subject.value}> ?p ?o  .
    } UNION {
      {
        SELECT ?metaShape
        WHERE {
          <${subject.value}> a ?type .
          ?metaShape ${shacl.targetNodePrefixed} ?type .
        }
      }
      VALUES ?shapeP {
        ${blueprint.colorIndexPrefixed}
        ${blueprint.searchPriorityPrefixed}
        ${blueprint.faIconPrefixed}
        ${blueprint.iconPrefixed}
        ${rdfs.labelPrefixed}
        ${rdfs.commentPrefixed}
        ${shacl.targetNodePrefixed}
       
      }
      ?metaShape ?shapeP ?oo .

    }
  }
  `;
}
