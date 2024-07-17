import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import rdfEnvironment from '@zazuko/env';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { rdf, blueprintShape } from '@blueprint/ontology';
import { RdfUiClassMetadata, UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { UiAppearanceReasonerService } from '../../ui-appearance-reasoner/ui-appearance-reasoner.service';


@Injectable({
  providedIn: 'root'
})
export class UiClassMetadataService {
  readonly #sparqlService = inject(SparqlService);
  readonly #uiAppearanceReasonerService = inject(UiAppearanceReasonerService);

  private cachedUiClassMetadata$: Observable<UiClassMetadata[]> | null = null;

  /**
   * Return all FluxClassMetadata Entities. This method caches the result.
   * 
   * @returns An Observable return all FluxClassMetadata Entities.
   */
  public getClassMetadata(): Observable<UiClassMetadata[]> {
    console.log('Getting class metadata');
    if (this.cachedUiClassMetadata$ === null) {
      this.cachedUiClassMetadata$ = this.#sparqlService.construct(this.getClassMetadataSparqlQuery()).pipe(
        map(dataset => {
          const uiClassMetadata = rdfEnvironment.clownface({ dataset }).node(blueprintShape.ClassMetadataShapeNamedNode).in(rdf.typeNamedNode).map(metadataPtr => new RdfUiClassMetadata(metadataPtr));
          this.#uiAppearanceReasonerService.addLegacyConfiguration(uiClassMetadata);
          return uiClassMetadata;
        }),
        shareReplay(1)
      );
    }
    return this.cachedUiClassMetadata$;
  }

  /**
   * Get the SPARQL query to fetch the FluxClassMetadataGraph
   * 
   * @returns A SPARQL query sting to fetch this entity graph
   */
  public getClassMetadataSparqlQuery(): string {
    return `
${blueprintShape.sparqlPrefix()}
CONSTRUCT {
  ?metaShape ?p ?o . 
} WHERE {
  {
    SELECT ?metaShape WHERE {
      ?metaShape a ${blueprintShape.ClassMetadataShapePrefixed} .
    }
  }
  ?metaShape ?p ?o .
}
`;
  }
}
