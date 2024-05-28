export const environment = {
    production: true,
    endpointUrl: 'https://ld.flux.zazuko.com/query', // this will be overwritten by /src/config.json
    sparqlConsoleUrl: null, // e.g. yasgui -> will be overwritten by /src/config.json
    graphExplorerUrl: null, // this will be overwritten by /src/config.json
    fullTextSearchDialect: 'neptune', // this will be overwritten by /src/config.json
    neptune: {
        ftsEndpoint: "https://vpc-opensearch-zazuko-blueprint-glbaecqrcqwr5om3z5jj2duuiq.eu-central-1.es.amazonaws.com"
    } // this will be overwritten by /src/config.json
};
