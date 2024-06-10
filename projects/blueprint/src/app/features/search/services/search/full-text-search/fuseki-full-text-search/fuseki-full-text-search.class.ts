import { SearchContext } from "../../model/search-context.class";
import { FullTextSearch } from "../../util/abstract-search.class";

import { UiClassMetadata } from "@blueprint/model/ui-class-metadata/ui-class-metadata";


export class FusekiFullTextSearch extends FullTextSearch {

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
    const classQuery = classCountQuery(this._searchContext.searchTerm.toString(), metadata);
    return classQuery;
  }

  public totalCountQueryWithSearchTerm(metadata: UiClassMetadata[]): string {
    const fluxClassQueries = metadata
      .map(metaShape => fluxClassSubQuery(metaShape))
      .join(' UNION');

    const totalQuery = countTotalQuery(this._searchContext.searchTerm.toString(), fluxClassQueries);
    return totalQuery;
  }
}


function fluxClassSubQuery(classMetadata: UiClassMetadata): string {
  return `
  {
    BIND( <${classMetadata.targetNode.value}> as ?fluxIri)
    BIND( ${classMetadata.searchPriority} as ?searchPriority) 

    ?sub a ?fluxIri .
    ?sub rdfs:label ?label .
    OPTIONAL {
      ?sub rdfs:comment ?comment .
    }
  }`;
}



function searchQueryWithSearchTerm(searchTerm: string, fluxClassQueries: string, pageNumber: number, pageSize: number): string {
  return `
  PREFIX  :     <https://flux.described.at/>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX schema: <https://schema.org/>
  PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX sh: <http://www.w3.org/ns/shacl#>
  
  CONSTRUCT
  {
      :query a :UiSearchResult ;
        :result ?sub ;
        :pageSize $pageSize;
        :pageNumber $pageNumber. 
      ?sub a ?fluxIri ;
           a :UiSearchResultItem;
          :score ?score ;
          rdfs:label ?label ;
          rdfs:comment ?comment .
          
  }
  WHERE
  {
    {
      {
        SELECT * WHERE {
          {
            SELECT ?sub (SUM(?luceneScore) as ?luScore) WHERE {
              {
                (?sub ?luceneScore) text:query (  rdfs:comment "*${searchTerm}*") .
              } UNION {
                (?sub ?luceneScore) text:query (  rdfs:label "*${searchTerm}*") .
              }
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
PREFIX :     <https://flux.described.at/>
PREFIX text: <http://jena.apache.org/text#>
PREFIX schema: <https://schema.org/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX flux: <https://flux.described.at/>

CONSTRUCT
{
    :query a :UiSearchResult ;
      :total ?count .
}
WHERE
{
  {
    {
      SELECT (count(DISTINCT ?sub) as ?count) WHERE {
        {
          SELECT ?sub (SUM(?luceneScore) as ?luScore) WHERE {
            {
              SELECT ?sub ?luceneScore WHERE {
                {
                  (?sub ?luceneScore) text:query (  rdfs:comment "*${searchTerm}*") .
                } UNION {
                  (?sub ?luceneScore) text:query (  rdfs:label "*${searchTerm}*") .
                } 
              }
            }            
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
PREFIX  :     <https://flux.described.at/>
PREFIX schema: <https://schema.org/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

CONSTRUCT
{
  :query a :UiSearchResult ;
  :total ?count
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

PREFIX flux: <https://flux.described.at/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX text: <http://jena.apache.org/text#>

CONSTRUCT {
?fluxIri a flux:UiClassCount ; 
   flux:count ?count .
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
  /*
    return `
        ?s rdfs:comment|rdfs:label ?l .
        SERVICE <tag:stardog:api:search:textMatch>  {
          [] <tag:stardog:api:search:result> ?l ;
             <tag:stardog:api:search:query> "${input} OR ${input}*" .
        }
    `;
   */
  return `
        {
          ?sub text:query (  rdfs:comment "*${input}*") .
        } UNION {
          ?sub text:query (  rdfs:label "*${input}*") .
        } 
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

