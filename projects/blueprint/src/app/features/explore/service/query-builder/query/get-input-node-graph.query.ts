import { rdf, rdfs, schema, flux, skos } from "@blueprint/ontology";
import { RdfTypes } from "projects/blueprint/src/app/core/rdf/rdf-environment";




export function getInputNodeGraphQuery(input: RdfTypes.NamedNode): string {
  const query = `
${rdf.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${flux.sparqlPrefix()}
${schema.sparqlPrefix()}
${skos.sparqlPrefix()}

CONSTRUCT {
  ?input a ?bpNodeClass .
  ?input ${rdfs.labelPrefixed} ?inputObject .
  ?input ${schema.namePrefixed} ?targetName .
  ?input ${skos.prefLabelPrefixed} ?skowPrefLabel .
  ?input ${schema.familyNamePrefixed} ?familyName .
  ?input a ?inputClass .
} WHERE {
  BIND (<${input.value}> as ?input)
  BIND (${flux.UiNodePrefixed} as ?bpNodeClass) .

  OPTIONAL {
      ?input ${rdfs.labelPrefixed} ?targetLabel .
    }
    OPTIONAL {
      ?input ${schema.namePrefixed} ?targetName .
    }
    OPTIONAL {
      ?input ${skos.prefLabelPrefixed} ?skowPrefLabel .
    }
    OPTIONAL {
      ?input ${schema.familyNamePrefixed} ?familyName .
    }  
    OPTIONAL {
      ?input ${rdf.typePrefixed} ?inputClass .
    }
}
`;
  console.log(query);

  return query;
}