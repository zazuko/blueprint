import { rdf, blueprint, rdfs, shacl, blueprintShape } from "@blueprint/ontology";

export function getAllUiDetailConfiguration() {
  const query = `
    # getAllUiDetailConfiguration
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
  return query;
}


