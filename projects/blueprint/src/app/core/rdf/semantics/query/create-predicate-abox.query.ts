import { rdf, rdfs } from "@blueprint/ontology";


export function createPredicateAboxQuery(
    predicateIri: string
): string {
    const query = `
${rdf.sparqlPrefix}
${rdfs.sparqlPrefix}

SELECT ?s ?o WHERE {
  ?s <${predicateIri}> ?o .
  FILTER(!isBlank(?o))      
}
`;
    return query;
}