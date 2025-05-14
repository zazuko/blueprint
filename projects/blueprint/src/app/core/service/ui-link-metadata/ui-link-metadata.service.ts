import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';


import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { flux, rdf, rdfs, shacl } from '@blueprint/ontology';
import { UiLinkMetadata } from '@blueprint/model/ui-link-metadata/ui-link-metadata';
import { rdfEnvironment } from '../../rdf/rdf-environment';

@Injectable({
  providedIn: 'root'
})
export class UiLinkMetadataService {
  private readonly sparqlService = inject(SparqlService);

  private readonly uiLinkNode = flux.LinkNamedNode;
  private cachedUiLinkMetadata$: Observable<UiLinkMetadata[]> | null = null;

  /**
   * Return all FluxLinkMetadataShape Entities. This method caches the result.
   * 
   * @returns An Observable return all FluxLinkMetadataShape Entities.
   */
  getLinkMetadata(): Observable<UiLinkMetadata[]> {
    if (this.cachedUiLinkMetadata$ === null) {
      this.cachedUiLinkMetadata$ = this.sparqlService.construct(this.getLinkMetadataSparqlQuery()).pipe(
        map(dataset => {
          return rdfEnvironment.clownface(dataset).node(this.uiLinkNode).in(rdf.typeNamedNode).map(metadataPtr => new UiLinkMetadata(metadataPtr))
        }),
        shareReplay(1)
      );
    }
    return this.cachedUiLinkMetadata$;
  }

  /**
   * 
   * @returns A SPARQL query sting to fetch this entity graph
   */
  public getLinkMetadataSparqlQuery(): string {
    return `
CONSTRUCT {
  ?link ?p ?o .
}
WHERE {
  {
    SELECT ?link WHERE {
      ?link a <${this.uiLinkNode.value}> .
    }
  }
  ?link ?p ?o .
}
`;
  }

  getLinkMetadataSparqlQueryForNode(nodeIri: string): string {
    return linkMetadataForIriQuery(nodeIri);
  }
}



function linkMetadataForIriQuery(input: string): string {
  return `
${flux.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}

CONSTRUCT {
  ?input a ?class .
  
  ?link a ${flux.LinkPrefixed} ;
    ${shacl.targetClassPrefixed} ?fromClass ;
    ${shacl.classPrefixed} ?toClass ;
    ${shacl.namePrefixed} ?name ;
    ${shacl.pathPrefixed} ?path .
  
  ?path ${shacl.inversePathPrefixed} ?inversePath .


  ?listRest rdf:first ?head ; 
    rdf:rest ?tail .
} WHERE {
  {
    BIND (<${input}> AS ?input)
    ?input a ?class .
  } UNION
  {
    # ---------------------- incoming and outgoing links -----------------------
    {
      {
        SELECT ?link ?fromClass ?toClass ?path WHERE {
          {
            SELECT ?fromClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?fromClass .
            }
          }
          ?link a ${flux.LinkPrefixed} ;
            ${shacl.targetClassPrefixed} ?fromClass ;
            ${shacl.classPrefixed} ?toClass ;
            ${shacl.pathPrefixed} ?path .
        }
      }  
    } UNION  {
      {
        SELECT ?link ?fromClass ?toClass ?path WHERE {
          {
            SELECT ?toClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?toClass .
            }
          }
          ?link a ${flux.LinkPrefixed} ;
            ${shacl.classPrefixed} ?toClass ;
            ${shacl.targetClassPrefixed} ?fromClass ;
            ${shacl.pathPrefixed} ?path .
          }
      }
    }
    # ---------------------- incoming and outgoing links -----------------------
    ?link sh:name ?name  .
    OPTIONAL {
      ?path ${shacl.inversePathPrefixed} ?inversePath .
    }
  } UNION {
    # ---------------------- incoming and outgoing links -----------------------
    {
      {
        SELECT ?link ?fromClass ?toClass WHERE {
          {
            SELECT ?fromClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?fromClass .
            }
          }
          ?link ${shacl.targetClassPrefixed} ?fromClass ;
                ${shacl.classPrefixed} ?toClass ;
                a ${flux.LinkPrefixed} .
        }
      }  
    } UNION  {  
      {
        SELECT ?link ?fromClass ?toClass WHERE {
          {
            SELECT ?toClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?toClass .
            }
          }
           ?link ${shacl.classPrefixed} ?toClass ;
            ${shacl.targetClassPrefixed} ?fromClass ;
            a ${flux.LinkPrefixed} .
        }
      }
      # ---------------------- incoming and outgoing links -----------------------
    }
    ?link ${shacl.pathPrefixed} ?list .
    ?list rdf:rest* ?listRest .
    ?listRest rdf:first ?head ;
    rdf:rest ?tail .
    OPTIONAL {
      ?head ?pHead ?oHead .
    }
  }
}
`;
}