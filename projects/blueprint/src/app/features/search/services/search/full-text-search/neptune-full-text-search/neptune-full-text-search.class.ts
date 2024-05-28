import { SearchContext } from "../../model/search-context.class";
import { FullTextSearch } from "../../util/abstract-search.class";

import { UiClassMetadata } from "@blueprint/model/ui-class-metadata/ui-class-metadata";
import { blueprint, rdfs, rdf, shacl } from "@blueprint/ontology";

import { environment } from "../../../../../../../environments/environment";

export class NeptuneFullTextSearch extends FullTextSearch {

  constructor(searchContext: SearchContext) {
    console.log('NeptuneFullTextSearch', searchContext);
    super(searchContext);
  }

  public searchQueryWithSearchTerm(metadata: UiClassMetadata[], pageNumber: number, pageSize: number): string {

    const sparqlFilterTerm = metadata.length > 0 ? `FILTER (${metadata.map(meta => {
      return `?bpClass = <${meta.targetNode.value}>`;
    }
    ).join(' || ')})` : '';

    console.log('sparqlFilterClause', sparqlFilterTerm);
    /*  const fluxClassQueries = metadata
        .map(metaShape => fluxClassSubQuery(metaShape))
        .join(' UNION');
  */
    const query = searchQueryWithSearchTerm(
      this._searchContext.searchTerm.toString(),
      sparqlFilterTerm,
      pageNumber,
      pageSize);
    return query;

  }

  public classCountQueryWithSearchTerm(metadata: UiClassMetadata[]): string {
    return classCountQuery(this._searchContext.searchTerm.toString(), metadata);
  }


  public totalCountQueryWithSearchTerm(metadata: UiClassMetadata[]): string {
    const fluxClassQueries = metadata
      .map(metaShape => fluxClassSubQuery(metaShape))
      .join(' UNION');

    return countTotalQuery(this._searchContext.searchTerm.toString(), fluxClassQueries);
  }
}

// search functions 


function fluxClassSubQuery(classMetadata: UiClassMetadata): string {
  return `
  {
    BIND( <${classMetadata.targetNode.value}> as ?fluxIri)
    BIND( ${classMetadata.searchPriority} as ?searchPriority) 

    ?sub a ?fluxIri .
    ?sub ${rdfs.labelPrefixed} ?label .
    OPTIONAL {
      ?sub ${rdfs.commentPrefixed} ?comment .
    }
  }`;
}



function searchQueryWithSearchTerm(searchTerm: string, filterTerm: string, pageNumber: number, pageSize: number): string {
  const query = `
  ${rdf.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${shacl.sparqlPrefix()}
  PREFIX fts: <http://aws.amazon.com/neptune/vocab/v01/services/fts#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  
  CONSTRUCT
  {
    ${blueprint.queryPrefixed} a ${blueprint.UiSearchResultPrefixed} ;
        ${blueprint.resultPrefixed} ?sub ;
        ${blueprint.pageSizePrefixed} $pageSize;
        ${blueprint.pageNumberPrefixed} $pageNumber. 
      ?sub a ${blueprint.UiSearchResultItemPrefixed};
          ${blueprint.scorePrefixed} ?luScore ;
          a ?bpClass ;
          ?searchItemP ?searchItemO .
          
  }
  WHERE
  {
    {
      {
        SELECT * WHERE {
          {
            SELECT ?sub ?luScore ?bpClass WHERE {
              SERVICE fts:search {
                fts:config fts:endpoint '${environment.neptune.ftsEndpoint}' .
                fts:config fts:queryType 'query_string' .
                fts:config fts:field rdfs:label .
                fts:config fts:field rdfs:comment .
                fts:config fts:query "${searchTerm} OR ${searchTerm}*" .
                fts:config fts:return ?sub .
                fts:config fts:maxResults 1000 .  
                fts:config fts:minScore 0.9 .
              }
              ?sub a ?bpClass .
              ?metaShape sh:targetNode ?bpClass .
              ?metaShape a <https://ld.flux.zazuko.com/shapes/metadata/ClassMetadataShape> .
              BIND (1 AS ?luScore)
              ${filterTerm}
            }
          }
          VALUES ?searchItemP  {
            ${rdfs.labelPrefixed}
            ${rdfs.commentPrefixed}
          }
          ?sub ?searchItemP ?searchItemO .
          BIND (1 AS ?score)  
        }
        OFFSET  ${pageNumber * pageSize}
        LIMIT   ${pageSize}
      }
    } UNION {
      BIND (${pageNumber} AS $pageNumber)
      BIND (${pageSize} AS $pageSize)
    }
  }
  `;

  console.log('searchQueryWithSearchTerm', query);
  return query;
}



function countTotalQuery(
  searchTerm: string,
  fluxClassQueries: string
): string {
  if (searchTerm && searchTerm.length > 0) {
    return `
${rdf.sparqlPrefix()}
${blueprint.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}
PREFIX fts: <http://aws.amazon.com/neptune/vocab/v01/services/fts#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>

CONSTRUCT
{
    ${blueprint.queryPrefixed} a ${blueprint.UiSearchResultPrefixed} ;
      ${blueprint.totalPrefixed} ?count .
}
WHERE
{
  {
    {
      SELECT (count(DISTINCT ?sub) as ?count) WHERE {
        {
          SELECT ?sub ?luScore WHERE {
            SERVICE fts:search {
              fts:config fts:endpoint '${environment.neptune.ftsEndpoint}' .
              fts:config fts:queryType 'query_string' .
              fts:config fts:field rdfs:label .
              fts:config fts:query "${searchTerm} OR ${searchTerm}*" .
              fts:config fts:return ?sub .
              fts:config fts:maxResults 1000 .  
              fts:config fts:minScore 0.9 .
            }
            ?sub a ?bpClass .
            ?metaShape sh:targetNode ?bpClass .
            ?metaShape a <https://ld.flux.zazuko.com/shapes/metadata/ClassMetadataShape> .
            BIND (1 AS ?luScore)
          }
        }
        
        ${fluxClassQueries}

      }
    }
  } 
}
 `;
  }
  return `
${rdf.sparqlPrefix()}
${blueprint.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>

CONSTRUCT
{
  ${blueprint.queryPrefixed} a ${blueprint.UiSearchResultPrefixed} ;
  ${blueprint.totalPrefixed} ?count .
}
WHERE
{
    SELECT (count( DISTINCT ?sub) as ?count) WHERE {
      ${fluxClassQueries}
      BIND ((xsd:float(?searchPriority)) AS ?score)   
    }
}
`;
}


function classCountQuery(
  input: string,
  classMetadata: UiClassMetadata[]
): string {
  let subQueries: string[] = [];
  /*  if (filter.length > 0) {
      subQueries = filter.map((iri) => {
        return classSparqlBlock(iri, fullTextSearchQuery(input));
      });
    } else {*/
  subQueries = classMetadata.map((meta) => {
    return classSparqlBlock(meta.targetNode.value, fullTextSearchQuery(input));
  });
  // }

  let query = `
# 2 instance count per flux type class
${blueprint.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}
PREFIX fts: <http://aws.amazon.com/neptune/vocab/v01/services/fts#>

CONSTRUCT {
?fluxIri a ${blueprint.UiClassCountPrefixed} ; 
   ${blueprint.countPrefixed} ?count .
} where {`;
  subQueries.forEach((subQuery, index) => {
    if (index === 0) {
      query += `
{
${subQuery}
}`;
    } else {
      query += `
UNION {
${subQuery}
}`;
    }
  });
  query += `
}
`;
  //  console.log('classCountQuery', query);
  return query;
}




function fullTextSearchQuery(input: string): string {
  if (!input || input.length === 0) {
    return '';
  }

  return `
      SERVICE fts:search {
        fts:config fts:endpoint '${environment.neptune.ftsEndpoint}' .
        fts:config fts:queryType 'query_string' .
        fts:config fts:field rdfs:label .
        fts:config fts:query "${input} OR ${input}*" .
        fts:config fts:return ?sub .
        fts:config fts:maxResults 1000 .  
        fts:config fts:minScore 0.9 .
      }
      ?sub a ?bpClass .
      ?metaShape sh:targetNode ?bpClass .
      ?metaShape a <https://ld.flux.zazuko.com/shapes/metadata/ClassMetadataShape> .
      BIND (1 AS ?luScore)
  `;
}

function classSparqlBlock(iri: string, fullTextSearchBlock: string): string {
  return `
  {
    SELECT ?fluxIri (COUNT(DISTINCT ?sub) AS ?count) WHERE {
      VALUES ?fluxIri
      {
        <${iri}>
      }
      ?sub a  <${iri}> .
      ${fullTextSearchBlock}
    } GROUP BY ?fluxIri
}
  `;
}

