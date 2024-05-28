import { UiClassMetadata } from "@blueprint/model/ui-class-metadata/ui-class-metadata";

/**
 * Creates a search query without a search term
 * 
 * @param fluxClassQueries class queries for the search
 * @param pageNumber current page number
 * @param pageSize size of the page
 * @returns search query without search term
 */
export function searchQueryWithoutSearchTerm(metadata: UiClassMetadata[], pageNumber: number, pageSize: number): string {
  const indent = 2;
  const sparqlFilterTerm = metadata.length > 0 ? `${'\t'.repeat(indent)}FILTER(\n${metadata.map(m => `${'\t'.repeat(indent + 1)}?type = <${m.targetNode.value}>`).join('||\n')}\n${'\t'.repeat(indent)})` : '';
  const query = `
#
# search query without search term
# pageNumber: ${pageNumber}
# pageSize: ${pageSize}
#
PREFIX  :     <https://flux.described.at/>
PREFIX schema: <https://schema.org/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

CONSTRUCT {
  :query a :UiSearchResult ;
  :result ?sub ;
  :pageSize $pageSize;
  :pageNumber $pageNumber.
  ?sub a ?type ;
    a :UiSearchResultItem;
    :score ?score ;    
    rdfs:label ?label;
    rdfs:comment ?comment .
} WHERE 
{
  {
    SELECT ?sub ?type ?label ?comment ?score WHERE {
      {
        SELECT DISTINCT ?type ?score WHERE {
          ?shape a <https://ld.flux.zazuko.com/shapes/metadata/ClassMetadataShape> ;
            sh:targetNode ?type ;
            :searchPrio ?searchPriority .
          BIND( xsd:float(?searchPriority) AS ?score )
${sparqlFilterTerm}
        }
      }
      ?sub a ?type;
        rdfs:label ?label.
      OPTIONAL { 
        ?sub rdfs:comment ?comment .
      }

    }
    ORDER BY (?score)
    OFFSET  ${pageNumber * pageSize}
    LIMIT   ${pageSize}
  } 
  UNION {
    BIND (${pageNumber} AS $pageNumber)
    BIND (${pageSize} AS $pageSize)
  }
}
`;
  return query
}

