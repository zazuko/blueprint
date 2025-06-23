import { flux, rdf, rdfs } from "@blueprint/ontology";

export function getBidirectionalQuery(iri: string, outPredicate: string, inPredicate: string): string {
    const query = `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${flux.sparqlPrefix()}

CONSTRUCT {
    ?subject ?predicate ?object.
    ?object ?p ?literal .

    ?subject ${flux.inferredTypePrefixed} ?transitiveType .
    ?subject rdf:type ?type .

    ?object ${flux.inferredTypePrefixed} ?transitiveType .
    ?object rdf:type ?type .
} WHERE {
    {
        BIND (<${iri}> AS ?subject)
        BIND (<${outPredicate}> AS ?predicate)
        BIND (<${inPredicate}> AS ?inPredicate)

        ?object <${inPredicate}> <${iri}> .
        <${iri}> <${outPredicate}> ?object .
        ?object ?p ?literal .
        FILTER (isLiteral(?literal))
    } UNION {
        BIND (<${iri}> AS ?subject)
        BIND (<${outPredicate}> AS ?predicate)
        BIND (<${inPredicate}> AS ?inPredicate)

        ?object <${inPredicate}> <${iri}> .
        <${iri}> <${outPredicate}> ?object .
        ?object rdf:type/rdfs:SubClassOf* ?transitiveType .
        ?object rdf:type ?type .
       } UNION {
        BIND (<${iri}> AS ?subject)
        <${iri}> rdf:type/rdfs:SubClassOf* ?transitiveType .
        <${iri}> rdf:type ?type .
       }
}
`;
    return query;
}