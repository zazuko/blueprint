import {UiClassMetadata} from "@blueprint/model/ui-class-metadata/ui-class-metadata";
import {FullTextSearch} from "../../util/abstract-search.class";
import {CONSTRUCT, SELECT, sparql, SparqlTemplateResult} from "@tpluscode/sparql-builder";
import {blueprint} from "@blueprint/ontology";
import {classQueries, classSparqlBlock} from "../search-functions";
import env from "@zazuko/env";
import {UNION} from "@tpluscode/sparql-builder/expressions";

const rdfs = env.ns.rdfs

export class RegexSearch extends FullTextSearch {
    override searchQueryWithSearchTerm(metadata: UiClassMetadata[], pageNumber: number, pageSize: number): string {
        const subQueries = classQueries(metadata)
        const searchTerm = this._searchContext.searchTerm.toString()

        const query = CONSTRUCT`
            ${blueprint.namespace.query} a ${blueprint.namespace.UiSearchResult} ;
                ${blueprint.namespace.result} ?sub ;
                ${blueprint.namespace.pageSize} ${pageSize};
                ${blueprint.namespace.pageNumber} ${pageNumber};
             .

              ?sub a ?fluxIri ;
           a ${blueprint.namespace.UiSearchResult} ;
              ${blueprint.namespace.score} 1 ;
              ${rdfs.label} ?label ;
              ${rdfs.comment} ?comment ;
          .
        `.WHERE`
            ${SELECT.ALL.WHERE`
                ${SELECT`?sub`.WHERE`
                    ${this.fullTextSearchQuery(searchTerm)}
                `}

                ${subQueries}

            `.OFFSET(pageNumber * pageSize).LIMIT(pageSize)}
        `

        return query.build()
    }

    override classCountQueryWithSearchTerm(metadata: UiClassMetadata[]): string {
        const searchTerm = this._searchContext.searchTerm.toString()

        const fluxIri = env.variable('fluxIri')
        const subQueries = metadata.map((meta) =>
            classSparqlBlock(fluxIri, meta.targetNode, this.fullTextSearchQuery(searchTerm)));

        const construct = CONSTRUCT`
            ${fluxIri} a ${blueprint.namespace.UiClassCount} ;
            ${blueprint.namespace.count} ?count .
        `.WHERE`
            ${UNION(...subQueries)}
        `

        return construct.build()
    }

    override totalCountQueryWithSearchTerm(metadata: UiClassMetadata[]): string {
        let construct = CONSTRUCT`
            ${blueprint.namespace.query} a ${blueprint.namespace.UiSearchResult} ;
            ${blueprint.namespace.total} ?count .
        `

        const subQueries = classQueries(metadata)

        const searchTerm = this._searchContext.searchTerm.toString()
        if (!searchTerm?.length) {
            construct = construct.WHERE`
                SELECT (count( DISTINCT ?sub) as ?count) WHERE {
                  ${subQueries}
                  BIND ((${env.ns.xsd.float}(?searchPriority)) AS ?score)
                }
            `
        } else {
            const countSelect = SELECT`(count(DISTINCT ?sub) as ?count)`
                .WHERE`
                    ${this.fullTextSearchQuery(searchTerm)}
                `.GROUP().BY('sub')

            construct = construct.WHERE`
            {
                { ${countSelect} }

                ${subQueries}
              }
            `
        }

        return construct.build()
    }

    protected fullTextSearchQuery(input: string): SparqlTemplateResult | '' {
        if (!input || input.length === 0) {
            return '';
        }

        return sparql`
            ?sub ?p ?text .
            {
              ?p rdfs:subPropertyOf* ${rdfs.label} .
            }
            UNION
            {
              ?p rdfs:subPropertyOf* ${rdfs.comment} .
            }
            FILTER regex(?text, "${input}", "i") .
        `
    }
}
