import { FullTextSearchDialect } from "../sparql/sparql.service";

export interface LibraryConfiguration {
    production: boolean,
    endpointUrl: string,
    sparqlConsoleUrl: null | string,
    graphExplorerUrl: null | string,
    fullTextSearchDialect: FullTextSearchDialect
}