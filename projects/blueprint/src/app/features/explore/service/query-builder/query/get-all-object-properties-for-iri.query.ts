import { rdf, rdfs, schema, skos } from "@blueprint/ontology";



export function getAllObjectPropertiesForIriQuery(iri: string): string {
    const query = `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${schema.sparqlPrefix()}
${skos.sparqlPrefix()}

CONSTRUCT {
    <${iri}> ?p ?o.
    ?o ?op ?oo .

    ?s ?reverseP <${iri}> .
    ?s ?reverseOp ?oo .
} WHERE {
    {
        <${iri}> ?p ?o.
        FILTER (!isLiteral(?o))
    } UNION {
        <${iri}> ?p ?o.
        FILTER (!isLiteral(?o))
        VALUES ?op {
            ${rdf.typePrefixed}
            ${rdfs.labelPrefixed}
            ${skos.prefLabelPrefixed}
            ${schema.namePrefixed}
        }
        ?o ?op ?oo .
    } UNION  {
        ?s ?reverseP <${iri}> .
        FILTER (!isLiteral(?s))
    } UNION {
        ?s ?reverseP <${iri}> .
        FILTER (!isLiteral(?s))
        VALUES ?reverseOp {
            ${rdf.typePrefixed}
            ${rdfs.labelPrefixed}
            ${skos.prefLabelPrefixed}
            ${schema.namePrefixed}
        }
        ?s ?reverseOp ?oo .
    }
}`;
    return query;
}
