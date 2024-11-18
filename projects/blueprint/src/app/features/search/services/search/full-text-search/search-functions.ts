import {UiClassMetadata} from "@blueprint/model/ui-class-metadata/ui-class-metadata";
import env from "@zazuko/env";
import {SELECT, sparql, SparqlTemplateResult} from "@tpluscode/sparql-builder";
import {UNION} from "@tpluscode/sparql-builder/expressions";
import {Term, Variable} from "@rdfjs/types";

const {rdfs} = env.ns

export function classQueries(metadata: UiClassMetadata[]) {
  return UNION(...metadata.map(classSubQuery));
}

function classSubQuery(classMetadata: UiClassMetadata) {
  return sparql`
  {
    BIND( ${classMetadata.targetNode} as ?fluxIri)
    BIND( ${classMetadata.searchPriority} as ?searchPriority)

    ?sub a ?fluxIri .
    ?sub ?l ?label .
    ?l ${rdfs.subPropertyOf}* ${rdfs.label} .
    OPTIONAL {
      ?sub ?c ?comment .
      ?c ${rdfs.subPropertyOf}* ${rdfs.comment} .
    }
  }`;
}

export function classSparqlBlock(fluxIri: Variable, iri: Term, fullTextSearchBlock: SparqlTemplateResult | '') {
  return  SELECT`${fluxIri} (COUNT(DISTINCT ?sub) AS ?count)`
    .WHERE`
      VALUES ${fluxIri}
      {
        ${iri}
      }
      ?sub a ${iri} .
      ${fullTextSearchBlock}
    `.GROUP().BY(fluxIri)
}
