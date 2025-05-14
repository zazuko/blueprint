import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { blueprintShape, rdf } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { rdfEnvironment } from '../../../rdf/rdf-environment';
import { getAllUiDetailConfiguration } from './query/get-all-ui-detail-configuration.query';
import { LiteralDisplayRule, RdfLiteralDisplayRule } from './new_model/literal.model';

/**
 * Service to handle UI detail configuration.
 * 
 * UI Detail is a missleading name for what it is. We should think about renaming it.
 * It is about what to show when you explore a resource.
 * 
 * There are literals and there are relationships. 
 * 
 * 1. Literal: A literal is a value that is not a resource. It is a value that is not a link to another resource.
 * We focus on the literal values first. 
 * - the strategy is to show all literals and provide a way to influence how they are rendered if needed.
 * - this reduces the configuration effort for the user and we learn faster what is needed.
 * 
 * We call the rules to influence literals "Literal Presentation Rule". 
 */
@Injectable({
  providedIn: 'root'
})
export class UiDetailService {
  readonly #sparqlService = inject(SparqlService);

  #literalPresentationRule$: Observable<LiteralDisplayRule[]> | null = null;

  constructor() {
    this.fetchLiteralPresentationRules().subscribe();
  }

  public fetchLiteralPresentationRules(): Observable<LiteralDisplayRule[]> {
    if (this.#literalPresentationRule$ === null) {
      this.#literalPresentationRule$ = this.#sparqlService.construct(getAllUiDetailConfiguration()).pipe(
        map(dataset => {
          const literalRules = rdfEnvironment.clownface(dataset).namedNode(blueprintShape.ClassDetailShapeNamedNode).in(rdf.typeNamedNode).map(n => new RdfLiteralDisplayRule(n));
          return literalRules;
        })
      );
    }
    return this.#literalPresentationRule$;
  }



  /**
   * Fetches the detail configuration for a given class IRI from the SPARQL endpoint.
   * 
   * @param classIri The IRI of the class to get the detail configuration for.
   * @returns An observable that emits an array of detail configuration elements.
   */
  getLiteralRulesForClasses(classIris: string[]): Observable<LiteralDisplayRule[]> {
    return this.fetchLiteralPresentationRules().pipe(
      map((rules) => {
        const filteredRules = rules.filter((rule) =>
          rule.targetClass.some((targetClass) => classIris.includes(targetClass.value))
        );
        return filteredRules;
      })
    );
  }
}
/**
 * Fetches the detail configuration for a given instance IRI from the SPARQL endpoint.
 * 
 * @param instanceIri The IRI of the instance to get the detail configuration for.
 * @returns An observable that emits an array of detail configuration elements.
 
extractUiDetails(dataset: RdfTypes.Dataset) {
  const detailConfigCfGraph = rdfEnvironment.clownface(dataset).node(blueprintShape.ClassDetailShapeNamedNode).in(rdf.typeNamedNode);
  const details = detailConfigCfGraph.map((node) => new RdfDetailConfigurationElement(node));
  console.log('details', details);
  return details;
}

extractUiDetailComponents(subjectIri: string, dataset: RdfTypes.Dataset): IUiDetailElement[] {
  const subject = rdfEnvironment.clownface(dataset).namedNode(subjectIri);
  const details = subject.out(blueprint.detailNamedNode).map((node) => new RdfDetailElement(node));
  const literalPredicatesDataset = dataset.match(rdfEnvironment.namedNode(subjectIri), null, null).filter(quad => quad.object.termType === 'Literal');

  const literalModels: UILiteral[] = [];

  details.forEach((detail) => {
    console.log('detail', detail.iri);
    console.log('detail', detail.label);
    console.log('detail', detail.linkLabel);
    console.log('detail', detail.order);
    console.log('detail', detail.renderLiteralAs);
    console.log('detail', detail.value);
    console.log('detail', detail.path);

  });



  const literalPredicateMap = new Map<string, RdfTypes.Quad[]>();
  literalPredicatesDataset.forEach((quad) => {
    const key = quad.predicate.value;
    if (!literalPredicateMap.has(key)) {
      literalPredicateMap.set(key, []);
    }
    literalPredicateMap.get(key)?.push(quad);
  });

  const syntheticDetails = [...literalPredicateMap.keys()].map((key) => {
    const predicateString = key.includes('#')
      ? key.split('#').pop()
      : key.split('/').pop();

    const syntheticDetail: IUiDetailElement = {
      label: predicateString,
      iri: subjectIri + key,
      order: 0,
      renderLiteralAs: LiteralRenderType.PLAIN,
      value: literalPredicateMap.get(key)!.map((quad) => quad.object as RdfTypes.Literal),
      path: key
    }
    return syntheticDetail;
  });

  details.forEach((detail) => {
    console.log('detail', detail.iri);
    console.log('detail', detail.label);
    console.log('detail', detail.linkLabel);
    console.log('detail', detail.order);
    console.log('detail', detail.renderLiteralAs);
    // console.log('detail', detail.);
  });
  console.log('literalPredicatesDataset', literalPredicatesDataset);
  console.log('details', details);
  console.log(rdfEnvironment.serialize(dataset));
  return [...details, ...syntheticDetails]
}

}
*/