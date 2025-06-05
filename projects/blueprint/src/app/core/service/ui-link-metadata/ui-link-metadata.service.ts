import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';


import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { flux, rdf } from '@blueprint/ontology';
import { rdfEnvironment } from '../../rdf/rdf-environment';

import { linkDefinitionsForIriQuery } from './query/link-definitions-for-iri.query';
import { allLinkDefinitionsQuery } from './query/all-link-definitions.query';
import { UiLinkDefinition, RdfUiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';

@Injectable({
  providedIn: 'root'
})
export class UiLinkMetadataService {
  readonly #sparqlService = inject(SparqlService);
  readonly #uiLinkNode = flux.LinkNamedNode;
  #cachedUiLinkMetadata$: Observable<UiLinkDefinition[]> | null = null;

  /**
   * Return all FluxLinkMetadataShape Entities. This method caches the result.
   * @todo: This is not fetching the path. This is not a bug, but it works because it is only used in concept relations.
   * watch out using this.
   * @returns An Observable return all FluxLinkMetadataShape Entities.
   */
  getLinkMetadata(): Observable<UiLinkDefinition[]> {
    if (this.#cachedUiLinkMetadata$ === null) {
      this.#cachedUiLinkMetadata$ = this.#sparqlService.construct(allLinkDefinitionsQuery()).pipe(
        map(dataset => {
          return rdfEnvironment.clownface(dataset).node(this.#uiLinkNode).in(rdf.typeNamedNode).map(metadataPtr => new RdfUiLinkDefinition(metadataPtr))
        }),
        shareReplay(1)
      );
    }
    return this.#cachedUiLinkMetadata$;
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

