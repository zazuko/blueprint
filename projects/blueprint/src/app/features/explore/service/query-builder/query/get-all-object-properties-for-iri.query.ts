import { rdf, rdfs, schema, skos } from "@blueprint/ontology";



export function getAllObjectPropertiesForIriQuery(iri: string): string {
    const query = `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${schema.sparqlPrefix()}
${skos.sparqlPrefix()}

CONSTRUCT {
    <${iri}> ?p ?o.
    ?predicate ?op ?oo .

    ?s ?reverseP <${iri}> .
    ?reversePredicate ?reverseOp ?oo .
} WHERE {
    {
        <${iri}> ?p ?o.
        FILTER (!isLiteral(?o))
    } UNION {
        {
            SELECT DISTINCT ?predicate WHERE {
                <${iri}> ?predicate ?o.
                FILTER (!isLiteral(?o))
            }
        }
        ?predicate ?op ?oo .
    } UNION  {
        ?s ?reverseP <${iri}> .
        FILTER (!isLiteral(?s))
    } UNION {
        {
            SELECT DISTINCT ?reversePredicate WHERE {
                ?s1 ?reversePredicate <${iri}> .
            }
        }
        ?reversePredicate ?reverseOp ?oo .
    }
}`;
    return query;
}
