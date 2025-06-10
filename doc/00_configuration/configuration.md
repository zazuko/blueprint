## Basic Configuration

Blueprint provides a basic configuration file that can be used to set up the application.


Here are the configuration options available in the `blueprint-config.json` file:

** requred **
* endpointUrl: The URL of the SPARQL endpoint to connect to.
* fullTextSearchDialect: The dialect to use for full-text search. 

** optional **
* sparqlConsoleUrl: The URL of the SPARQL console to use for executing queries. It will be used to open the SPARQL console in the menu.
* graphExplorerUrl: The URL of the graph explorer to use for exploring the graph. It will be used to open the graph explorer in the menu.
* skipAuthentication: If set to true, the application will skip authentication. It defaults to `true`.

** requried for Neptune **
* neptune.ftsEndpoint: The URL of the OpenSearch endpoint for full-text search.


** ui **
* linkConfiguration: Defaults to "both". 
  * "app": Use blending link configuration only
  * "rdf": Use RDF link configuration only. Which means that the links will be generated using the RDF data.
  * "both": Use both link configurations. This is the default setting and will use the blending link configuration if available, otherwise it will use the RDF link configuration.


```json
{
    "$schema": "../../../blueprint-config-schema.json",
    "endpointUrl": "http://localhost:4200/query",
    "fullTextSearchDialect": "qlever",
    "sparqlConsoleUrl": "https://ld.flux.zazuko.com/sparql/#query",

    "neptune": {
        "ftsEndpoint": " https://vpc-opensearch-zazuko-blueprint-glbaecqrcqwr5om3z5jj2duuiq.eu-central-1.es.amazonaws.com"
    },
    "skipAuthentication": true,
    "ui": {
        "linkConfiguration": "both"
    }

}
```

## Docker Entrypoint Script

The config.json file will be generated using the `entrypoint.sh` script. You have to configure the environment variables to set the configuration options. 