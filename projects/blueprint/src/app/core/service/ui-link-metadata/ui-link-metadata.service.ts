import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';


import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { flux, rdf } from '@blueprint/ontology';
import { UiLinkMetadata } from '@blueprint/model/ui-link-metadata/ui-link-metadata';
import { rdfEnvironment } from '../../rdf/rdf-environment';

import { linkDefinitionsForIriQuery } from './query/link-definitions-for-iri.query';

@Injectable({
  providedIn: 'root'
})
export class UiLinkMetadataService {
  readonly #sparqlService = inject(SparqlService);
  readonly #uiLinkNode = flux.LinkNamedNode;
  #cachedUiLinkMetadata$: Observable<UiLinkMetadata[]> | null = null;

  /**
   * Return all FluxLinkMetadataShape Entities. This method caches the result.
   * @todo: This is not fetching the path. This is not a bug, but it works because it is only used in concept relations.
   * watch out using this.
   * @returns An Observable return all FluxLinkMetadataShape Entities.
   */
  getLinkMetadata(): Observable<UiLinkMetadata[]> {
    if (this.#cachedUiLinkMetadata$ === null) {
      this.#cachedUiLinkMetadata$ = this.#sparqlService.construct(this.getLinkMetadataSparqlQuery()).pipe(
        map(dataset => {
          return rdfEnvironment.clownface(dataset).node(this.#uiLinkNode).in(rdf.typeNamedNode).map(metadataPtr => new UiLinkMetadata(metadataPtr))
        }),
        shareReplay(1)
      );
    }
    return this.#cachedUiLinkMetadata$;
  }

  /**
   * @todo: This is not fetching the path. This is not a bug, but it works because it is only used in concept relations.
   * But it would not work to use this for the explore graph.
   * @returns A SPARQL query sting to fetch this entity graph
   */
  public getLinkMetadataSparqlQuery(): string {
    const query = `
CONSTRUCT {
  ?link ?p ?o .
}
WHERE {
  {
    SELECT ?link WHERE {
      ?link a <${this.#uiLinkNode.value}> .
    }
  }
  ?link ?p ?o .
}
`;
    console.log(query);
    return query;
  }

  /**
   * This query fetches the link metadata for a given node IRI.
   * 
   * @param nodeIri The IRI of the node to fetch the link metadata for.
   * @returns 
   */
  getLinkMetadataSparqlQueryForNode(nodeIri: string): string {
    return linkDefinitionsForIriQuery(nodeIri);
  }
}

