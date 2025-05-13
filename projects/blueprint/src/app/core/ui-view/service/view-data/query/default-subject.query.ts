
/**
 * This function generates a default SPARQL query to fetch the data for a given subject.
 * 
 * Default query is a bad name for it. Because it is important. 
 * 
 * - We fetch all literals for the subject
 * - We fetch the color, icon etc. Metadata for the subject
 * - We getch the tbox metatadata - right now just predicates
 */

import { rdf, rdfs, shacl, blueprint } from "@blueprint/ontology";
import { RdfTypes } from "../../../../rdf/rdf-environment";

export function defaultSubjectQuery(subject: RdfTypes.NamedNode): string {
    const query = `
  ${rdf.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${shacl.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}

  CONSTRUCT {
    <${subject.value}> ?p ?o .
    <${subject.value}> ?literalP ?literalO .
    ?literalPT ?literalTboxP ?literalTboxO .
    ?metaShape ?shapeP ?oo .
  }
  WHERE {
    {
      VALUES (?p) {
        (${rdf.typePrefixed})
      }
      <${subject.value}> ?p ?o  .
    } UNION {
      <${subject.value}> ?literalP ?literalO .
      FILTER(isLiteral(?literalO))
    }
    UNION {
      <${subject.value}> ?literalPT ?literalPO .
      ?literalPT ?literalTboxP ?literalTboxO .
    } UNION {
      {
        SELECT ?metaShape
        WHERE {
          <${subject.value}> a ?type .
          ?metaShape ${shacl.targetNodePrefixed} ?type .
        }
      }
      VALUES ?shapeP {
        ${blueprint.colorIndexPrefixed}
        ${blueprint.searchPriorityPrefixed}
        ${blueprint.faIconPrefixed}
        ${blueprint.iconPrefixed}
        ${rdfs.labelPrefixed}
        ${rdfs.commentPrefixed}
        ${shacl.targetNodePrefixed}
       
      }
      ?metaShape ?shapeP ?oo .

    }
  }
  `;

    return query;
}
