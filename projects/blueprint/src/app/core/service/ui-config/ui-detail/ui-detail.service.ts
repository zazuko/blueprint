import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RdfDetailConfigurationElement } from './model/ui-detail-configuration-element';

import { IUiDetailElement, RdfDetailElement } from './model/ui-detail-element';

import { blueprint, blueprintShape, rdf, rdfs, shacl } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
import { rdfEnvironment, RdfTypes } from '../../../rdf/rdf-environment';
import { LiteralRenderType } from './model/ui-detail-configuration-element';

@Injectable({
  providedIn: 'root'
})
export class UiDetailService {
  readonly #sparqlService = inject(SparqlService);


  getDetailConfigurationForClass(classIri: string): Observable<RdfDetailConfigurationElement[]> {
    return this.#sparqlService.construct(this.getUiDetailForClassQuery(classIri)).pipe(
      map(dataset => {
        const detail = this.extractUiDetails(dataset);


        console.log('detail', detail);
        return detail
      })
    )

  }


  getUiDetailForClassQuery(classIri: string): string {
    return getUiDetailForClassQuery(classIri);
  }

  getUiDetailForInstanceQuery(instanceIri: string): string {
    return getUiDetailForInstanceQuery(instanceIri);
  }

  extractUiDetails(dataset: RdfTypes.Dataset) {
    const detailConfigCfGraph = rdfEnvironment.clownface(dataset).node(blueprintShape.ClassDetailShapeNamedNode).in(rdf.typeNamedNode);
    return detailConfigCfGraph.map((node) => new RdfDetailConfigurationElement(node));

  }

  extractUiDetailComponents(subjectIri: string, dataset: RdfTypes.Dataset): IUiDetailElement[] {
    const subject = rdfEnvironment.clownface(dataset).namedNode(subjectIri);
    const details = subject.out(blueprint.detailNamedNode).map((node) => new RdfDetailElement(node));
    const literalPredicatesDataset = dataset.match(rdfEnvironment.namedNode(subjectIri), null, null).filter(quad => quad.object.termType === 'Literal');

    const syntheticDetails = [...literalPredicatesDataset].map((quad) => {
      const predicateString = quad.predicate.value.includes('#')
        ? quad.predicate.value.split('#').pop()
        : quad.predicate.value.split('/').pop();
      const syntheticDetail: IUiDetailElement = {
        label: predicateString,
        iri: subjectIri + quad.predicate.value,
        order: 0,
        renderLiteralAs: LiteralRenderType.PLAIN,
        value: [quad.object.value],
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

function getUiDetailForClassQuery(classIri: string): string {
  return `
  # getUiDetailForClass <${classIri}>
  #
  ${rdf.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${shacl.sparqlPrefix()}
  ${blueprintShape.sparqlPrefix()}

  CONSTRUCT {
    ?detailShape ?p ?o  .
  }
  WHERE {
    {
      SELECT ?detailShape WHERE {
        ?detailShape ${shacl.targetClassPrefixed} <${classIri}> .
        ?detailShape a ${blueprintShape.ClassDetailShapePrefixed} .
      }
    }
    {
      VALUES ?p {
        ${rdf.typePrefixed}
        ${rdfs.labelPrefixed}
        ${shacl.pathPrefixed}
        ${shacl.orderPrefixed}
        ${shacl.targetClassPrefixed}
        ${blueprint.showAsPrefixed}
        ${blueprint.linkLabelPrefixed}
      }
      ?detailShape ?p ?o  .
    } 
  }
  `;
}


function getUiDetailForInstanceQuery(instanceIri: string): string {
  return `
  # getUiDetailForInstance <${instanceIri}>
  #
  ${rdf.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${shacl.sparqlPrefix()}
  ${blueprintShape.sparqlPrefix()}
  
  CONSTRUCT {
    ?detailShape ?p ?o  .
  }
  WHERE {
    {
      SELECT ?detailShape WHERE {
        <${instanceIri}> ${rdf.typePrefixed}/(${rdf.subclassOfPrefixed}*) ?classIri .
        ?detailShape ${shacl.targetClassPrefixed} ?classIri .
        ?detailShape a ${blueprintShape.ClassDetailShapePrefixed} .
      }
    }
    {
      VALUES ?p {
        ${rdfs.labelPrefixed}
        ${shacl.pathPrefixed}
        ${shacl.orderPrefixed}
        ${shacl.targetClassPrefixed}
        ${blueprint.showAsPrefixed}
        ${blueprint.linkLabelPrefixed}
      }
      ?detailShape ?p ?o  .
    } 
  }
  `;
}