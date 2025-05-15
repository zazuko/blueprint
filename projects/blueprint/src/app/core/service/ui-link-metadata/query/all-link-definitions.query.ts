import { flux, rdf, rdfs, shacl } from '@blueprint/ontology';


/**
 * Get the link definition for a given IRI.
 * 
 * @param input The IRI of the node to fetch the link metadata for.
 * @returns a sparql query
 */
export function allLinkDefinitionsQuery(): string {

    const query = `
${flux.sparqlPrefix()}
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}

CONSTRUCT {
    ?link ?p ?o .
    
    ?path ${shacl.inversePathPrefixed} ?inversePath .
    
    ?listRest rdf:first ?head ; 
    rdf:rest ?tail .
} WHERE {
    {
        VALUES ?p {
            ${shacl.namePrefixed}
            ${shacl.pathPrefixed}
            ${shacl.targetClassPrefixed}
            ${shacl.classPrefixed}
            ${rdf.typePrefixed}
        }
        ?link a ${flux.LinkPrefixed} .
        ?link ?p ?o .

        OPTIONAL {
            ?link ${shacl.pathPrefixed} ?path .
            ?path ${shacl.inversePathPrefixed} ?inversePath .
        }

    } UNION  {
        ?link1 a ${flux.LinkPrefixed} .
        ?link1 ${shacl.pathPrefixed} ?list .
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