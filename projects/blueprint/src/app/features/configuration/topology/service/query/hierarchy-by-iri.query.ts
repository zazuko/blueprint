import { blueprint, rdf, rdfs, shacl } from "@blueprint/ontology";


export function hierarchyByIriQuery(iri: string): string {

  const query = `
${shacl.sparqlPrefix()}
${blueprint.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
    
  CONSTRUCT {
    ?hierarchy ?hierarchyP ?hierarchyO .    
    ?shape ?shapeP ?shapeO .
      ?property ?propertyP ?propertyO .
      ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
      ?propertyO ${shacl.zeroOrMorePathPrefixed} ?zeroOrMorePath .
  } WHERE {
      {
          {
              SELECT ?hierarchy WHERE {
                BIND(<${iri}> as ?hierarchy)
              }
          }
          VALUES ?hierarchyP {
            ${blueprint.hasRootPrefixed}
            ${blueprint.parentPrefixed}
            ${rdfs.commentPrefixed}
            ${rdfs.labelPrefixed}
            ${rdf.typePrefixed}
          }    
          ?hierarchy ?hierarchyP ?hierarchyO .    
      } UNION
      {
          {
              SELECT ?root WHERE {
                  BIND(<${iri}> as ?hierarchy)
                  ?hierarchy ${blueprint.hasRootPrefixed} ?root .
              }
          }
          ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
          VALUES ?shapeP {
            ${shacl.targetClassPrefixed}
            ${shacl.groupPrefixed}
            ${rdfs.labelPrefixed}
            ${shacl.propertyPrefixed}
            ${rdf.typePrefixed}
          }
          ?shape ?shapeP ?shapeO .
      } UNION
      {
          {
            SELECT ?root WHERE {
                BIND(<${iri}> as ?hierarchy)
                ?hierarchy ${blueprint.hasRootPrefixed} ?root .
            }
          }
          ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
          ?shape ${shacl.propertyPrefixed} ?property .
          VALUES ?propertyP { 
            ${shacl.pathPrefixed}
            ${shacl.nodePrefixed}
           }
          
          ?property ?propertyP ?propertyO .
          OPTIONAL {
              ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
          }
          OPTIONAL {
              ?propertyO ${shacl.zeroOrMorePathPrefixed} ?zeroOrMorePath .
          }
      }
    
  }
  `;

  return query;
}