import { flux, rdf, rdfs, shacl } from '@blueprint/ontology';


/**
 * Get the link definition for a given IRI.
 * 
 * @param input The IRI of the node to fetch the link metadata for.
 * @returns a sparql query
 */
export function linkDefinitionsForIriQuery(input: string): string {
  const query = `
${flux.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}

CONSTRUCT {
  ?input a ?class .
  
  ?link a ${flux.LinkPrefixed} ;
    ${shacl.targetClassPrefixed} ?fromClass ;
    ${shacl.classPrefixed} ?toClass ;
    ${shacl.namePrefixed} ?name ;
    ${shacl.pathPrefixed} ?path .
  
  ?path ${shacl.inversePathPrefixed} ?inversePath .


  ?listRest rdf:first ?head ; 
    rdf:rest ?tail .
} WHERE {
  {
    BIND (<${input}> AS ?input)
    ?input a ?class .
  } UNION
  {
    # ---------------------- incoming and outgoing links -----------------------
    {
      {
        SELECT ?link ?fromClass ?toClass ?path WHERE {
          {
            SELECT ?fromClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?fromClass .
            }
          }
          ?link a ${flux.LinkPrefixed} ;
            ${shacl.targetClassPrefixed} ?fromClass ;
            ${shacl.classPrefixed} ?toClass ;
            ${shacl.pathPrefixed} ?path .
        }
      }  
    } UNION  {
      {
        SELECT ?link ?fromClass ?toClass ?path WHERE {
          {
            SELECT ?toClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?toClass .
            }
          }
          ?link a ${flux.LinkPrefixed} ;
            ${shacl.classPrefixed} ?toClass ;
            ${shacl.targetClassPrefixed} ?fromClass ;
            ${shacl.pathPrefixed} ?path .
          }
      }
    }
    # ---------------------- incoming and outgoing links -----------------------
    ?link sh:name ?name  .
    OPTIONAL {
      ?path ${shacl.inversePathPrefixed} ?inversePath .
    }
  } UNION {
    # ---------------------- incoming and outgoing links -----------------------
    {
      {
        SELECT ?link ?fromClass ?toClass WHERE {
          {
            SELECT ?fromClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?fromClass .
            }
          }
          ?link ${shacl.targetClassPrefixed} ?fromClass ;
                ${shacl.classPrefixed} ?toClass ;
                a ${flux.LinkPrefixed} .
        }
      }  
    } UNION  {  
      {
        SELECT ?link ?fromClass ?toClass WHERE {
          {
            SELECT ?toClass WHERE {
              BIND (<${input}> AS ?input)
              ?input a ?toClass .
            }
          }
           ?link ${shacl.classPrefixed} ?toClass ;
            ${shacl.targetClassPrefixed} ?fromClass ;
            a ${flux.LinkPrefixed} .
        }
      }
      # ---------------------- incoming and outgoing links -----------------------
    }
    ?link ${shacl.pathPrefixed} ?list .
    ?list rdf:rest* ?listRest .
    ?listRest rdf:first ?head ;
    rdf:rest ?tail .
    OPTIONAL {
      ?head ?pHead ?oHead .
    }
  }
}
`;

  return query;
}