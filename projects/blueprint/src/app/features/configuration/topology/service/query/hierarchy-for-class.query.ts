import { blueprint, rdf, rdfs, shacl } from "@blueprint/ontology";


export function hierarchyForClassQuery(iri: string): string {


    const query = `
${shacl.sparqlPrefix()}
${blueprint.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
      
  CONSTRUCT {
      ?group ?groupP ?groupO .    
      ?shape ?shapeP ?shapeO .
      ?property ?propertyP ?propertyO .
      ?propertyO ${shacl.inversePathPrefixed} ?inversePath .
      ?propertyO ${shacl.zeroOrMorePathPrefixed} ?zeroOrMorePath .
  } WHERE {
      {
          {
              SELECT ?group WHERE {
                  BIND(<${iri}> as ?class)
                  ?shape ${shacl.targetClassPrefixed} ?class .
                  ?shape ${shacl.groupPrefixed} ?group .
                  ?group a ${blueprint.HierarchyPrefixed} .
              }
          }
          VALUES ?groupP {
              ${blueprint.hasRootPrefixed}
              ${blueprint.parentPrefixed}
              ${rdfs.labelPrefixed}
              ${rdf.typePrefixed}
          }    
          ?group ?groupP ?groupO .    
      } UNION
      {
          {
              SELECT ?root WHERE {
                  BIND(<${iri}> as ?class)
                  ?shape ${shacl.targetClassPrefixed} ?class .
                  ?shape ${shacl.groupPrefixed} ?group .
                  ?group a ${blueprint.HierarchyPrefixed} .
                  ?group ${blueprint.hasRootPrefixed} ?root .
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
                  BIND(<${iri}> as ?class)
                  ?shape ${shacl.targetClassPrefixed} ?class .
                  ?shape ${shacl.groupPrefixed} ?group .
                  ?group a ${blueprint.HierarchyPrefixed} .
                  ?group ${blueprint.hasRootPrefixed} ?root .
              }
          }
          ?root (${shacl.propertyPrefixed}/${shacl.nodePrefixed})* ?shape .
          ?shape sh:property ?property .
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