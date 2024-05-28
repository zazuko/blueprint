import { SearchContext } from "../../model/search-context.class";
import { FullTextSearch } from "../../util/abstract-search.class";

import { UiClassMetadata } from "@blueprint/model/ui-class-metadata/ui-class-metadata";
import { blueprint, rdfs, rdf, shacl } from "@blueprint/ontology";


export class GraphDBFullTextSearch extends FullTextSearch {

  constructor(searchContext: SearchContext) {
    super(searchContext);
  }

  public searchQueryWithSearchTerm(metadata: UiClassMetadata[], pageNumber: number, pageSize: number): string {

    const fluxClassQueries = metadata
      .map(metaShape => fluxClassSubQuery(metaShape))
      .join(' UNION');

    const query = searchQueryWithSearchTerm(
      this._searchContext.searchTerm.toString(),
      fluxClassQueries,
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



function searchQueryWithSearchTerm(searchTerm: string, fluxClassQueries: string, pageNumber: number, pageSize: number): string {
  return `
  ${rdf.sparqlPrefix()}
  ${blueprint.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${shacl.sparqlPrefix()}
  PREFIX onto: <http://www.ontotext.com/>
  PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
  
  CONSTRUCT
  {
    ${blueprint.queryPrefixed} a ${blueprint.UiSearchResultPrefixed} ;
        ${blueprint.resultPrefixed} ?sub ;
        ${blueprint.pageSizePrefixed} $pageSize;
        ${blueprint.pageNumberPrefixed} $pageNumber. 
      ?sub a ?fluxIri ;
           a ${blueprint.UiSearchResultItemPrefixed};
          ${blueprint.scorePrefixed} ?score ;
          ${rdfs.labelPrefixed} ?label ;
          ${rdfs.commentPrefixed} ?comment .
          
  }
  WHERE
  {
    {
      {
        SELECT * WHERE {
          {
            SELECT ?sub (SUM(?luceneScore) as ?luScore) WHERE {
              ?sub (${rdfs.labelPrefixed} | ${rdfs.commentPrefixed}) ?l .
              ?l onto:fts "${searchTerm} OR ${searchTerm}*" .
              BIND(1.0 as ?luceneScore)
            }
            GROUP BY ?sub
          }
          
          ${fluxClassQueries}
  
          BIND ((xsd:float(?searchPriority) * xsd:float(?luScore)) AS ?score)
        }
        ORDER BY DESC(?score)
        OFFSET  ${pageNumber * pageSize}
        LIMIT   ${pageSize}
      }
    } UNION {
      BIND (${pageNumber} AS $pageNumber)
      BIND (${pageSize} AS $pageSize)
    }
  }
  `;
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
PREFIX onto: <http://www.ontotext.com/>
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
          SELECT ?sub (SUM(?luceneScore) as ?luScore) WHERE {
            ?sub ${rdfs.labelPrefixed}|${rdfs.commentPrefixed} ?l .
            ?l onto:fts "${searchTerm} OR ${searchTerm}*" .
            BIND(1.0 as ?luceneScore)
          }
          GROUP BY ?sub
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
PREFIX onto: <http://www.ontotext.com/>

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

  return query;
}




function fullTextSearchQuery(input: string): string {
  if (!input || input.length === 0) {
    return '';
  }

  return `
      ?s (${rdfs.labelPrefixed} | ${rdfs.commentPrefixed}) ?l .
      ?l onto:fts "${input} OR ${input}*" .
  `;
}

function classSparqlBlock(iri: string, fullTextSearchBlock: string): string {
  return `
  {
    SELECT ?fluxIri (COUNT(DISTINCT ?s) AS ?count) WHERE {
      VALUES ?fluxIri
      {
        <${iri}>
      }
      ?s a  <${iri}> .
      ${fullTextSearchBlock}
    } GROUP BY ?fluxIri
}
  `;
}

