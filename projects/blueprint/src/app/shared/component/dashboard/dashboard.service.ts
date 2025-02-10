import { Injectable } from '@angular/core';
import { blueprint, nileaUi, rdf, rdfs, shacl } from '@blueprint/ontology';
import { NamedNode } from '@rdfjs/types';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() {
  }


  dashboardForInstanceQuery(instance: NamedNode) {
    const query = ` 
${blueprint.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${rdf.sparqlPrefix()}
${nileaUi.sparqlPrefix()}
${shacl.sparqlPrefix()}

CONSTRUCT {
  ?dashboard a ${blueprint.DashboardPrefixed} ;
    ${shacl.targetClassPrefixed} ?type ;
    ${blueprint.hasWidgetPrefixed} ?widget ;
  .
  ?widget ?widgetP ?widgetO . 
} WHERE {
	??subject a ?type. 
  ?dashboard ${shacl.targetClassPrefixed} ?type ;
    a ${blueprint.DashboardPrefixed} ;
    ${blueprint.hasWidgetPrefixed} ?widget .
  
   VALUES ?widgetP {
    ${blueprint.hasRowSpanPrefixed}
    ${blueprint.hasColumnSpanPrefixed}
    ${blueprint.indexPrefixed}
    ${blueprint.hasComponentPrefixed}
    ${blueprint.hasSparqlQueryTemplatePrefixed}
  }
  ?widget ?widgetP ?widgetO . 
}
`.replaceAll('??subject', `<${instance.value}> `);

    return query
  }


}
