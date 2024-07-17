// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    configurationIri: 'http://ld.zazuko.com/BluprintConfigurationInstance1', // this will be overwritten by /src/config.json
    endpointUrl: 'http://localhost:4200/query',  // this will be overwritten by /src/config.json
    sparqlConsoleUrl: null, // e.g. yasgui -> will be overwritten by /src/config.json
    graphExplorerUrl: null, // this will be overwritten by /src/config.json
    fullTextSearchDialect: 'neptune', // this will be overwritten by /src/config.json
    neptune: {
        ftsEndpoint: "https://vpc-opensearch-zazuko-blueprint-glbaecqrcqwr5om3z5jj2duuiq.eu-central-1.es.amazonaws.com"
    } // this will be overwritten by /src/config.json// this will be overwritten by /src/config.json
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
