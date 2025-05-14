import { shacl, flux, rdfs, rdf } from "@blueprint/ontology";

export function compositionToCompositionLinksForClassQuery(type: string): string {
    const query = `
  ${shacl.sparqlPrefix()}
  ${flux.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${rdf.sparqlPrefix()}
  
  CONSTRUCT {
      ?shape ${shacl.groupPrefixed} ?aggregate .
      ?shape ${shacl.targetClassPrefixed} ?type .
  
      ?outgoingLinks ?linkP ?linkO .
      ?propertyShape ?propertyP ?propertyO .
      ?path ${shacl.inversePathPrefixed} ?inversePath .
  
      ?inShape ${shacl.groupPrefixed} ?inAggregate .
      ?inShape ${shacl.targetClassPrefixed} ?type.
  
      ?incomingLinks ?linkP ?linkO .
      ?incomingLinks ${rdfs.labelPrefixed} ?inverseLabel .
    
      ?listRest rdf:first ?head .
      ?head ?pHead ?oHead .
      ?listRest rdf:rest ?tail .
  } 
  WHERE {
      {
          # outgoing links
          {
              SELECT ?outgoingLinks ?aggregate ?shape ?type WHERE {
                  BIND (<${type}> AS ?type)
                  ?shape ${shacl.targetClassPrefixed} ?type .
                  ?shape ${shacl.groupPrefixed} ?aggregate . 
                  ?aggregate ${rdf.typePrefixed} ${flux.CompositionPrefixed}.
                  ?outgoingLinks ${shacl.targetClassPrefixed} ?aggregate .
                  ?outgoingLinks a ${flux.CompositionToCompositionLinkPrefixed} .
              }
          }
          VALUES ?linkP { 
              ${shacl.targetClassPrefixed}
              ${shacl.propertyPrefixed}
              ${flux.targetPrefixed}
              ${rdfs.labelPrefixed}
              ${rdf.typePrefixed}
          }
          ?outgoingLinks ?linkP ?linkO .
      } UNION  {
          # outgoing links sh:property
          {
              SELECT ?outgoingLinks WHERE {
                  BIND (<${type}> AS ?type)
                  ?shape ${shacl.targetClassPrefixed} ?type .
                  ?shape ${shacl.groupPrefixed} ?aggregate . 
                  ?aggregate ${rdf.typePrefixed} ${flux.CompositionPrefixed}.
                  ?outgoingLinks ${shacl.targetClassPrefixed} ?aggregate .
                  ?outgoingLinks a ${flux.CompositionToCompositionLinkPrefixed} .
              }
          }
          
          ?outgoingLinks ${shacl.propertyPrefixed} ?propertyShape . 
  
          VALUES ?propertyP { 
              ${shacl.targetClassPrefixed}
              ${shacl.pathPrefixed}
              ${shacl.classPrefixed}
              ${shacl.namePrefixed}
          }
          ?propertyShape ?propertyP ?propertyO .
          OPTIONAL {
              ?propertyShape ${shacl.pathPrefixed} ?path .
              ?path ${shacl.inversePathPrefixed} ?inversePath .
          }
          OPTIONAL {
            ?propertyShape ${shacl.pathPrefixed} ?path .
            ?path rdf:rest* ?listRest .
            ?listRest rdf:first ?head .
            OPTIONAL {
                ?head ?pHead ?oHead .
            }
            ?listRest rdf:rest ?tail .
        }
      } UNION {
          # incoming links
          {
              SELECT ?incomingLinks ?inAggregate ?inShape ?type WHERE {
                  BIND (<${type}> AS ?type)
                  ?inShape ${shacl.targetClassPrefixed} ?type .
                  ?inShape ${shacl.groupPrefixed} ?inAggregate . 
                  ?aggregate ${rdf.typePrefixed} ${flux.CompositionPrefixed}.
                  ?incomingLinks ${flux.targetPrefixed} ?inAggregate .
                  ?incomingLinks a ${flux.CompositionToCompositionLinkPrefixed} .
              }
          }
          VALUES ?linkP { 
            ${shacl.targetClassPrefixed}
            ${shacl.propertyPrefixed}
            ${flux.targetPrefixed}
            ${rdf.typePrefixed}
          }
          ?incomingLinks ${flux.inverseLabelPrefixed} ?inverseLabel .
          ?incomingLinks ?linkP ?linkO .
      } UNION {
             # incoming links sh:property
          {
              SELECT ?incomingLinks WHERE {
                  BIND (<${type}> AS ?type)
                  ?shape ${shacl.targetClassPrefixed} ?type .
                  ?shape ${shacl.groupPrefixed} ?aggregate . 
                  ?aggregate ${rdf.typePrefixed} ${flux.CompositionPrefixed}.
                  ?incomingLinks ${flux.targetPrefixed} ?aggregate .
                  ?incomingLinks a  ${flux.CompositionToCompositionLinkPrefixed} .
              }
          }
          ?incomingLinks ${shacl.propertyPrefixed} ?propertyShape .
          VALUES ?propertyP { 
            ${shacl.targetClassPrefixed}
            ${shacl.pathPrefixed}
            ${shacl.classPrefixed}
            ${shacl.namePrefixed}
          }
          ?propertyShape ?propertyP ?propertyO .
          OPTIONAL {
            ?propertyShape ${shacl.pathPrefixed} ?path .
            ?path ${shacl.inversePathPrefixed} ?inversePath .
          }
          OPTIONAL {
            ?propertyShape ${shacl.pathPrefixed} ?path .
            ?path rdf:rest* ?listRest .
            ?listRest rdf:first ?head .
            OPTIONAL {
                ?head ?pHead ?oHead .
            }
            ?listRest rdf:rest ?tail .
        }
      }
  }
  `;
    return query;
}
