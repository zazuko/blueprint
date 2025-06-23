import { flux, rdf, rdfs } from "@blueprint/ontology";

export function getIncomingQuery(iri: string, predicate: string): string {
    const object = iri;
    const query = `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${flux.sparqlPrefix()}

CONSTRUCT {
    ?subject ?predicate ?object.
    ?subject ?p ?literal .

    ?subject ${flux.inferredTypePrefixed} ?transitiveType .
    ?subject rdf:type ?type .
} WHERE {
   { 
        BIND (<${object}> AS ?object)
        BIND (<${predicate}> AS ?predicate)

        ?subject <${predicate}> <${iri}> .
        ?subject ?p ?literal .
        FILTER (isLiteral(?literal))
    } UNION {
        BIND (<${iri}> AS ?subject)
        ?subject rdf:type/rdfs:SubClassOf* ?transitiveType .
        ?subject rdf:type ?type .
    } UNION {
        ?subject <${predicate}> <${iri}> .
        ?subject rdf:type/rdfs:SubClassOf* ?transitiveType .
        ?subject rdf:type ?type .
    }    
}
`;
    return query;
}