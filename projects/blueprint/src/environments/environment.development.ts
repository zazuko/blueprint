// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { FullTextSearchDialect } from "@blueprint/service/sparql/sparql.service";

export const environment = {
    production: false,
    endpointUrl: 'http://127.0.0.1:7001',  // this will be overwritten by /src/config.json
    sparqlConsoleUrl: null, // e.g. yasgui -> will be overwritten by /src/config.json
    graphExplorerUrl: null, // this will be overwritten by /src/config.json
    fullTextSearchDialect: 'neptune' as FullTextSearchDialect, // this will be overwritten by /src/config.json
    neptune: {
        ftsEndpoint: "https://vpc-opensearch-zazuko-blueprint-glbaecqrcqwr5om3z5jj2duuiq.eu-central-1.es.amazonaws.com"
    }, // this will be overwritten by /src/config.json// this will be overwritten by /src/config.json
    skipAuthentication: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
