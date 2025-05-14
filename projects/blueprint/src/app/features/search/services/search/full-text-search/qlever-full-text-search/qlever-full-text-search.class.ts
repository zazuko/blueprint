import { SearchContext } from "../../model/search-context.class";
import { FullTextSearch } from "../../util/abstract-search.class";

import { UiClassMetadata } from "@blueprint/model/ui-class-metadata/ui-class-metadata";
import { flux, rdfs, rdf, shacl } from "@blueprint/ontology";


export class QleverFullTextSearch extends FullTextSearch {

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
  ${flux.sparqlPrefix()}
  ${rdfs.sparqlPrefix()}
  ${shacl.sparqlPrefix()}
  PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
  PREFIX ql: <http://qlever.cs.uni-freiburg.de/builtin-functions/>

  CONSTRUCT
  {
    ${flux.queryPrefixed} a ${flux.UiSearchResultPrefixed} ;
        ${flux.resultPrefixed} ?sub ;
        ${flux.pageSizePrefixed} $pageSize;
        ${flux.pageNumberPrefixed} $pageNumber. 
      ?sub a ?fluxIri ;
           a ${flux.UiSearchResultItemPrefixed};
          ${flux.scorePrefixed} ?score ;
          ${rdfs.labelPrefixed} ?label ;
          ${rdfs.commentPrefixed} ?comment .
          
  }
  WHERE
  {
    {
      {
        SELECT * WHERE {
          {
            SELECT ?sub (SUM(?fakeScore) as ?luScore) WHERE {
              BIND (1 as ?fakeScore)
              ?sub (${rdfs.labelPrefixed} | ${rdfs.commentPrefixed}) ?l .
               ?text ql:contains-entity ?l ;
               ql:contains-word "${searchTerm.split(' ')[0]}*" .
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
${flux.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX ql: <http://qlever.cs.uni-freiburg.de/builtin-functions/>

CONSTRUCT
{
    ${flux.queryPrefixed} a ${flux.UiSearchResultPrefixed} ;
      ${flux.totalPrefixed} ?count .
}
WHERE
{
  {
    {
      SELECT (count(DISTINCT ?sub) as ?count) WHERE {
        {
          SELECT ?sub (SUM(?fakeScore) as ?luScore) WHERE {
            BIND (1 as ?fakeScore)
            ?sub ${rdfs.labelPrefixed}|${rdfs.commentPrefixed} ?l .
            ?text ql:contains-entity ?l ;
               ql:contains-word "${searchTerm.split(' ')[0]}*" .
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
${flux.sparqlPrefix()}
${rdfs.sparqlPrefix()}
${shacl.sparqlPrefix()}
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>

CONSTRUCT
{
  ${flux.queryPrefixed} a ${flux.UiSearchResultPrefixed} ;
  ${flux.totalPrefixed} ?count .
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
${flux.sparqlPrefix()}
${rdfs.sparqlPrefix()}
PREFIX ql: <http://qlever.cs.uni-freiburg.de/builtin-functions/>

CONSTRUCT {
?fluxIri a ${flux.UiClassCountPrefixed} ; 
   ${flux.countPrefixed} ?count .
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




function fullTextSearchQuery(searchTerm: string): string {
  if (!searchTerm || searchTerm.length === 0) {
    return '';
  }

  return `
      ?s (${rdfs.labelPrefixed} | ${rdfs.commentPrefixed}) ?l .
        ?sub (${rdfs.labelPrefixed} | ${rdfs.commentPrefixed}) ?l .
               ?text ql:contains-entity ?l ;
               ql:contains-word "${searchTerm.split(' ')[0]}*" .
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

