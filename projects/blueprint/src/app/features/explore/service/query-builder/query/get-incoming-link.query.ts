import { UiLinkDefinition } from "@blueprint/model/ui-link-definition/ui-link-definition";
import { rdf, shacl, rdfs, flux, schema, skos } from "@blueprint/ontology";
import { RdfTypes } from "projects/blueprint/src/app/core/rdf/rdf-environment";

export function getIncomingLinkQuery(input: RdfTypes.NamedNode, link: UiLinkDefinition): string {
  const query = `
  ${shacl.sparqlPrefix()}
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${flux.sparqlPrefix()}
  ${schema.sparqlPrefix()}
  ${skos.sparqlPrefix()}

CONSTRUCT {
  ?input a ?fluxUiType .

  ?linkIri a ${flux.ConsolidatedLinkPrefixed} .
  ?linkIri  ${flux.sourcePrefixed} ?target.
  ?linkIri ${flux.targetPrefixed} ?input .
  ?linkIri ${flux.hasChildLinkPrefixed} ?linkSource .

  ?link a ${flux.ChildLinkPrefixed} .
  ?link ${flux.linkPrefixed} ?linkSource .
  ?linkSource ${flux.linkPrefixed} ?link .
  ?linkSource ${flux.targetPrefixed} ?input .
  ?linkSource ${flux.sourcePrefixed} ?target .
  ?linkSource ${flux.labelPrefixed} ?linkLabel .
  # Get type of the target node
  ?target a ?targetType .
  ?target a ?fluxUiType.
  ?target ${rdfs.labelPrefixed} ?targetLabel.
  ?target ${schema.namePrefixed} ?targetName .
  ?target ${skos.prefLabelPrefixed} ?skowPrefLabel .
  ?target ${schema.familyNamePrefixed} ?familyName .
} WHERE {
  BIND (<${input.value}> as ?input)
  BIND (<${link.iri}> as ?link)
  BIND (${flux.UiNodePrefixed} as ?fluxUiType)

  ${link.isSynthetic ? `` : `BIND (<${link.arrowSource}> as ?targetType)`}

  OPTIONAL {
    ?target a ?targetType .
  }
  ?target ${link.propertyPath}  ?input  .
  FILTER (!isLiteral(?target))
  FILTER (!isBlank(?target))

  OPTIONAL {
    ?target ${rdfs.labelPrefixed} ?targetLabel .
  }
  OPTIONAL {
    ?target ${schema.namePrefixed} ?targetName .
  }
  OPTIONAL {
    ?target ${skos.prefLabelPrefixed} ?skowPrefLabel .
  }
  OPTIONAL {
    ?target ${schema.familyNamePrefixed} ?familyName .
  }
  BIND ("${link.label}" as ?linkLabel) .
  
  # create a unique iri for the link (reification)
  BIND(str(?input) AS ?inputStr)
  BIND(str(?target) AS ?targetStr)

  BIND(
    IF(?inputStr < ?targetStr,
      CONCAT(?inputStr, "-", ?targetStr),
      CONCAT(?targetStr, "-", ?inputStr)
    ) AS ?orderedConcat
  )

  BIND(SHA256(?orderedConcat) AS ?hash)

  BIND(IRI(CONCAT("urn:consolidated_link/", ?hash)) AS ?linkIri)
  BIND(IRI(CONCAT(str(?linkIri), '/', '${link.iri}')) as ?linkSource )

}
`;
  return query;
}
