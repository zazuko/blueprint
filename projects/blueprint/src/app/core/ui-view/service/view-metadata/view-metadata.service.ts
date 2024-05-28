import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { NamedNode, Dataset } from '@rdfjs/types';
import { nileaUi } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';


@Injectable({
  providedIn: 'root'
})
export class ViewMetadata {
  private readonly sparqlService = inject(SparqlService);
  /**
   * Get the view config graph for a given rdf type / class.
   * 
   * @param typeIri The IRI of the rdf type / class
   * @returns Observable<Dataset> the graph withe the View configuration as a dataset 
   */
  getViewConfigForClass(typeIri: NamedNode): Observable<Dataset> {
    const query = this.getViewConfigForClassQuery(typeIri);
    return this.sparqlService.construct(query);
  }

  /**
   * Returns the query to get the view config graph for a given rdf type / class.
   * 
   * @param typeIri The IRI of the rdf type / class
   * @returns the sparql query as string 
   */
  getViewConfigForClassQuery(typeIri: NamedNode): string {
    return viewConfigQueryForClass(typeIri);
  }
}


function viewConfigQueryForClass(typeIri: NamedNode): string {
  const query = `
  ${nileaUi.sparqlPrefix()}

  CONSTRUCT {
      ?view ?pView ?oView .
      ?viewContainer ?pViewContainer ?oViewContainer.
      ?component ?pComponent ?oComponent.
      ?componentDefinition ?pComponentDefinition ?oComponentDefinition.
  } WHERE {
    {
        {
            SELECT ?view  WHERE {
                ?view a ${nileaUi.UiViewPrefixed}; 
                    ${nileaUi.forClassPrefixed} <${typeIri.value}> .
            }
        }
        ?view ?pView ?oView .
    } UNION {
        {
            {
                SELECT ?viewContainer WHERE {
                    ?view a ${nileaUi.UiViewPrefixed}; 
                      ${nileaUi.forClassPrefixed} <${typeIri.value}> ;
                      ${nileaUi.hasViewContainerPrefixed} ?viewContainer.
                }
            }
            ?viewContainer ?pViewContainer ?oViewContainer.
        }
    } UNION {
        {
            {
                SELECT ?component WHERE {
                    ?view a  ${nileaUi.UiViewPrefixed}; 
                      ${nileaUi.forClassPrefixed} <${typeIri.value}> ;
                      ${nileaUi.hasViewContainerPrefixed} ?viewContainer .
                    ?viewContainer  ${nileaUi.hasViewComponentPrefixed} ?component .
                }
            }
            ?component ?pComponent ?oComponent.
        }
      } UNION {
        {
            {
                SELECT ?componentDefinition WHERE {
                    ?view a  ${nileaUi.UiViewPrefixed}; 
                      ${nileaUi.forClassPrefixed} <${typeIri.value}> ;
                      ${nileaUi.hasViewContainerPrefixed} ?viewContainer .
                    ?viewContainer ${nileaUi.hasViewComponentPrefixed} ?component .
                    ?component ${nileaUi.hasComponentDefinitionPrefixed} ?componentDefinition .
                }
            }
            ?componentDefinition ?pComponentDefinition ?oComponentDefinition.
        }
    }
  
}
`;
  return query;
}