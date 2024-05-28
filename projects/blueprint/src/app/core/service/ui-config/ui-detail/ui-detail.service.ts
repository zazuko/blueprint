import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RdfDetailConfigurationElement } from './model/ui-detail-configuration-element';
import rdfEnvironment from '@zazuko/env';
import { Dataset } from '@rdfjs/types';
import { RdfDetailElement } from './model/ui-detail-element';

import { blueprint, blueprintShape, rdf, rdfs, shacl } from '@blueprint/ontology';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';


@Injectable({
  providedIn: 'root'
})
export class UiDetailService {
  private readonly sparqlService = inject(SparqlService);

  constructor() { }


  getDetailConfigurationForClass(classIri: string): Observable<RdfDetailConfigurationElement[]> {
    return this.sparqlService.construct(this.getUiDetailForClassQuery(classIri)).pipe(
      map(dataset => {
        return this.extractUiDetails(dataset);
      })
    )

  }


  getUiDetailForClassQuery(classIri: string): string {
    return getUiDetailForClassQuery(classIri);
  }

  getUiDetailForInstanceQuery(instanceIri: string): string {
    return getUiDetailForInstanceQuery(instanceIri);
  }

  extractUiDetails(dataset: Dataset) {
    const detailConfigCfGraph = rdfEnvironment.clownface({ dataset }).node(blueprintShape.ClassDetailShapeNamedNode).in(rdf.typeNamedNode);
    return detailConfigCfGraph.map((node) => new RdfDetailConfigurationElement(node));

  }

  extractUiDetailComponents(subjectIri: string, dataset: Dataset): RdfDetailElement[] {
    return rdfEnvironment.clownface({ dataset }).namedNode(subjectIri).out(blueprint.detailNamedNode).map((node) => new RdfDetailElement(node));
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