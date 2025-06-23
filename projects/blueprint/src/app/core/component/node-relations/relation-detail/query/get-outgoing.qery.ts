import { rdf, rdfs, flux } from "@blueprint/ontology";

export function getOutgoingQuery(iri: string, predicate: string): string {
    const subject = iri;
    const query = `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${flux.sparqlPrefix()}

CONSTRUCT {
    ?subject ?predicate ?object .
    ?object ?p ?literal .

    ?subject ${flux.inferredTypePrefixed} ?transitiveType .
    ?subject rdf:type ?type .

    ?object  ${flux.inferredTypePrefixed} ?transitiveType .
    ?object rdf:type ?type .
} WHERE {
    {
        BIND (<${subject}> AS ?subject)
        BIND (<${predicate}> AS ?predicate)

        <${subject}> <${predicate}> ?object .
        ?object ?p ?literal .
        FILTER (isLiteral(?literal))
    } UNION {
        BIND (<${subject}> AS ?subject)
        <${subject}> rdf:type/rdfs:SubClassOf* ?transitiveType .
        <${subject}> rdf:type ?type .
    }  UNION {
       <${subject}> <${predicate}> ?object .
        ?object rdf:type/rdfs:SubClassOf* ?transitiveType .
        ?object rdf:type ?type .
    }
}
`;
    return query;
}       