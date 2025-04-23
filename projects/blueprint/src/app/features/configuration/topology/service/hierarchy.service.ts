import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';


import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { sparqlUtils } from '@blueprint/utils';

import { blueprint, rdf, rdfs, shacl } from '@blueprint/ontology';
import { HierarchyDefinition } from './model/hierarchy-definition.model';
import { rdfEnvironment } from 'projects/blueprint/src/app/core/rdf/rdf-environment';

@Injectable({
    providedIn: 'root'
})
export class HierarchyService {

    private readonly sparqlService = inject(SparqlService);
    private readonly uiClassMetadataService = inject(UiClassMetadataService);

    getHierarchyByIri(iri: string): Observable<HierarchyDefinition | null> {
        const classMetadataQuery = this.uiClassMetadataService.getClassMetadataSparqlQuery();
        const hierarchyQuery = hierarchyByIriQuery(iri);
        return this.sparqlService.construct(sparqlUtils.mergeConstruct([classMetadataQuery, hierarchyQuery])).pipe(
            map((dataset) => {
                const hierarchyGraph = rdfEnvironment.clownface(dataset).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
                if (hierarchyGraph.values.length !== 1) {
                    return null;
                }
                const hierarchies = hierarchyGraph.map(hierarchyCfNode => {
                    const hierarchyNode = rdfEnvironment.namedNode(hierarchyCfNode.value);
                    return new HierarchyDefinition(hierarchyNode, dataset)
                })
                return hierarchies[0];
            }));
    }

    getHierarchiesForClass(iri: string): Observable<HierarchyDefinition[]> {
        const classMetadataQuery = this.uiClassMetadataService.getClassMetadataSparqlQuery();
        const hierarchyQuery = hierarchyForClassQuery(iri);


        return this.sparqlService.construct(sparqlUtils.mergeConstruct([classMetadataQuery, hierarchyQuery])).pipe(
            map((dataset) => {
                const hierarchyGraph = rdfEnvironment.clownface(dataset).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
                const hierarchies = hierarchyGraph.map(hierarchyCfNode => {
                    const hierarchyNode = rdfEnvironment.namedNode(hierarchyCfNode.value);
                    return new HierarchyDefinition(hierarchyNode, dataset)
                })
                return hierarchies;
            }));
    }

    getAllHierarchies(): Observable<HierarchyDefinition[]> {
        const classMetadataQuery = this.uiClassMetadataService.getClassMetadataSparqlQuery();
        const hierarchyQuery = getAllHierarchiesQuery();

        return this.sparqlService.construct(sparqlUtils.mergeConstruct([classMetadataQuery, hierarchyQuery])).pipe(
            map((dataset) => {
                const hierarchyGraph = rdfEnvironment.clownface(dataset).node(blueprint.HierarchyNamedNode).in(rdf.typeNamedNode);
                const hierarchies = hierarchyGraph.map(hierarchyCfNode => {
                    const hierarchyNode = rdfEnvironment.namedNode(hierarchyCfNode.value);
                    return new HierarchyDefinition(hierarchyNode, dataset)
                })
                return hierarchies;
            }));
    }

    getAllHierarchiesQuery(): string {
        return getAllHierarchiesQuery();
    }


    getHierarchiesForClassQuery(iri: string): string {
        return hierarchyForClassQuery(iri);
    }

}

function hierarchyByIriQuery(iri: string): string {

    return `
${shacl.sparqlPrefix()}
${blueprint.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
    
  CONSTRUCT {
    ?hierarchy ?hierarchyP ?hierarchyO .    
    ?shape ?shapeP ?shapeO .
      ?property ?propertyP ?propertyO .
      ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
  } WHERE {
      {
          {
              SELECT ?hierarchy WHERE {
                BIND(<${iri}> as ?hierarchy)
              }
          }
          VALUES ?hierarchyP {
            ${blueprint.hasRootPrefixed}
            ${blueprint.parentPrefixed}
            ${rdfs.commentPrefixed}
            ${rdfs.labelPrefixed}
            ${rdf.typePrefixed}
          }    
          ?hierarchy ?hierarchyP ?hierarchyO .    
      } UNION
      {
          {
              SELECT ?root WHERE {
                  BIND(<${iri}> as ?hierarchy)
                  ?hierarchy ${blueprint.hasRootPrefixed} ?root .
              }
          }
          ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
          VALUES ?shapeP {
            ${shacl.targetClassPrefixed}
            ${shacl.groupPrefixed}
            ${rdfs.labelPrefixed}
            ${shacl.propertyPrefixed}
            ${rdf.typePrefixed}
          }
          OPTIONAL {
            ?shape ?shapeP ?shapeO .
          }
      } UNION
      {
          {
            SELECT ?root WHERE {
                BIND(<${iri}> as ?hierarchy)
                ?hierarchy ${blueprint.hasRootPrefixed} ?root .
            }
          }
          ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
          ?shape ${shacl.propertyPrefixed} ?property .
          VALUES ?propertyP { 
            ${shacl.pathPrefixed}
            ${shacl.nodePrefixed}
           }
          
          ?property ?propertyP ?propertyO .
          OPTIONAL {
              ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
          }
      }
    
  }
  `;
}

function hierarchyForClassQuery(iri: string): string {
    console.log('%chierarchyForClassQuery', 'color: red', iri);

    const query = `
${shacl.sparqlPrefix()}
${blueprint.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
      
  CONSTRUCT {
      ?group ?groupP ?groupO .    
      ?shape ?shapeP ?shapeO .
      ?property ?propertyP ?propertyO .
      ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
  } WHERE {
      {
          {
              SELECT ?group WHERE {
                  BIND(<${iri}> as ?class)
                  ?shape ${shacl.targetClassPrefixed} ?class .
                  ?shape ${shacl.groupPrefixed} ?group .
                  ?group a ${blueprint.HierarchyPrefixed} .
              }
          }
          VALUES ?groupP {
              ${blueprint.hasRootPrefixed}
              ${blueprint.parentPrefixed}
              ${rdfs.labelPrefixed}
              ${rdf.typePrefixed}
          }    
          ?group ?groupP ?groupO .    
      } UNION
      {
          {
              SELECT ?root WHERE {
                  BIND(<${iri}> as ?class)
                  ?shape ${shacl.targetClassPrefixed} ?class .
                  ?shape ${shacl.groupPrefixed} ?group .
                  ?group a ${blueprint.HierarchyPrefixed} .
                  ?group ${blueprint.hasRootPrefixed} ?root .
              }
          }
          ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
          VALUES ?shapeP {
              ${shacl.targetClassPrefixed}
              ${shacl.groupPrefixed}
              ${rdfs.labelPrefixed}
              ${shacl.propertyPrefixed}
              ${rdf.typePrefixed}
          }
          OPTIONAL {
            ?shape ?shapeP ?shapeO .
          }
      } UNION
      {
          {
              SELECT ?root WHERE {
                  BIND(<${iri}> as ?class)
                  ?shape ${shacl.targetClassPrefixed} ?class .
                  ?shape ${shacl.groupPrefixed} ?group .
                  ?group a ${blueprint.HierarchyPrefixed} .
                  ?group ${blueprint.hasRootPrefixed} ?root .
              }
          }
          ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
          ?shape sh:property ?property .
          VALUES ?propertyP { 
            ${shacl.pathPrefixed}
            ${shacl.nodePrefixed}
           }
          
          ?property ?propertyP ?propertyO .
          OPTIONAL {
              ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
          }
      }
    
  }
  `;
    console.log('%chierarchyForClassQuery', 'color: red', query);

    return query;
}

function getAllHierarchiesQuery(): string {
    return `
    ${shacl.sparqlPrefix()}
    ${blueprint.sparqlPrefix()}
    ${rdf.sparqlPrefix()}
    ${rdfs.sparqlPrefix()}  

    CONSTRUCT {
        ?hierarchy ?hierarchyP ?hierarchyO .    
        ?shape ?shapeP ?shapeO .
        ?property ?propertyP ?propertyO .
        ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
    } WHERE {
        {
            {
                SELECT ?hierarchy WHERE {
                    ?hierarchy a ${blueprint.HierarchyPrefixed} .
                }
            }
            VALUES ?hierarchyP {
                ${blueprint.hasRootPrefixed}
                ${blueprint.parentPrefixed}
                ${rdfs.commentPrefixed}
                ${rdfs.labelPrefixed}
                ${rdf.typePrefixed}
            }    
            ?hierarchy ?hierarchyP ?hierarchyO .    
        } UNION
        {
            {
                SELECT ?root WHERE {
                    ?hierarchy a ${blueprint.HierarchyPrefixed} .
                    ?hierarchy ${blueprint.hasRootPrefixed} ?root .
                }
            }
            ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
            VALUES ?shapeP {
                ${shacl.targetClassPrefixed}
                ${shacl.groupPrefixed}
                ${rdfs.labelPrefixed}
                ${shacl.propertyPrefixed}
                ${rdf.typePrefixed}
            }
            OPTIONAL {
            ?shape ?shapeP ?shapeO .
            }
        } UNION
        {
            {
                SELECT ?root WHERE {
                    ?hierarchy a ${blueprint.HierarchyPrefixed} .
                    ?hierarchy ${blueprint.hasRootPrefixed} ?root .
                }
            }
            ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
            ?shape ${shacl.propertyPrefixed} ?property .
            VALUES ?propertyP { 
                ${shacl.pathPrefixed}
                ${shacl.nodePrefixed}
            }
            
            ?property ?propertyP ?propertyO .
            OPTIONAL {
                ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
            }
        }
        
    }
    `;
}