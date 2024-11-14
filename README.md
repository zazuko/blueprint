# Blueprint - Enterprise Knowledge Graph Frontend and Browser

## Introduction

> Zazuko Blueprint is an enterprise knowledge graph frontend and browser, designed to make RDF Knowledge Graphs accessible and customizable for domain users.

Zazuko Blueprint is the culmination of a decade of experience at Zazuko working with RDF Knowledge Graphs. We understand that for Knowledge Graphs to be truly accessible to domain users, they must align with the context, experience, and expectations of those users. Generic "bubble"-oriented graph browsers often fall short in this regard. Zazuko Blueprint simplifies the creation of customized configurations or hypergraphs on top of your RDF Knowledge Graph, allowing you to focus on the most relevant elements from a high-level domain specialist perspective. You can also tailor generic vocabularies, such as schema.org, to reflect the specific terminology used within your organization or domain.

![blueprint-sam](https://github.com/zazuko/blueprint/assets/583021/81b89afa-e321-46a5-b773-4fe7d6e1c1da)

Recognizing the challenges web developers face when building applications on top of RDF, Zazuko Blueprint minimizes their exposure to RDF, enabling them to create specialized views of domain-specific knowledge with ease. Developers can provide a web component, and we leverage the declarative power of RDF to map the data schema to a highly specific visualization schema without extensive coding.

Zazuko Blueprint has been in development for several years for our customers, and we are now making the code base publicly available. While we currently anticipate our audience to have some knowledge of RDF Knowledge Graphs, Zazuko also offers retainers for assistance with using and working with Zazuko Blueprint. [Contact us](mailto:info@zazuko.com?subject=Blueprint%20Support) to learn more.

Zazuko Blueprint is an Angular web application that runs entirely in the browser.

## Customization and Configuration of Zazuko Blueprint

We plan to provide a configuration frontend in the future. For now, you need to add the configuration directly to the knowledge graph. This configuration is purely written in RDF and resides with your data in the knowledge graph. Blueprint will read this configuration when you interact with the application.

The configuration allows you to define various aspects such as what should be visible and what should be hidden, how different entities relate to each other, and many other customizable elements. Please note that the configuration language and style may change before we release version 1.0 of Zazuko Blueprint. Examples and detailed documentation will be added soon to help guide you through the process.

## Demo stack

If you want to quickly try out Zazuko Blueprint, you can take a look at the Docker Compose stack in the [stack](./stack) directory.
It contains a simple demo dataset with Kubernetes and OCI data, and all the instructions to run it are in the [README](./stack/README.md).
You will also find instructions on how to generate the triples for the Kubernetes and OCI data for your own Kubernetes cluster.

## Deployment

### Standalone

The configuration file of the Angular app itself is located in [config.json](projects/blueprint/src/config.json).

```json
{
  "endpointUrl": "http://localhost:4200/query",
  "sparqlConsoleUrl": "https://ld.example.org/sparql/#query'",
  "graphExplorerUrl": "https://ld.example.org/graph-explorer/?resource",
  "fullTextSearchDialect": "stardog"
}
```

After the build `config.json` is located in the App root directory.
You can replace it if needed.

**sparqlConsoleUrl** - you can provide a link to a SPARQL console. It's used in the flux detail panel context menu to jump to something like a YasGUI. Set it to `null` to remove the option from the context menu.

**graphExplorerUrl** - you can provide a link to an instance of Graph Explorer . It's used in the flux detail panel context menu to jump to graph explorer. Set it to `null` to remove the option from the context menu.

**endpointUrl** - the SPARQL endpoint URL. This is the URL where the SPARQL queries are sent to. It's used to fetch data from the triple store. The SPARQL endpoint must support CORS or you need to use a proxy for development. See below for more information.

**fullTextSearchDialect** - the full text search dialect. Currently only `stardog`, `fuseki` and `neptune` are supported. This is used to fetch full text search results.

In case you are using the `neptune` dialect you need to provide the OpenSearch endpoint to use in an additional configuration parameter `neptune.ftsEndpoint`:

```json
{
  // ...
  "neptune": {
    "ftsEndpoint": " https://YOUR-OPENSEARCH-ENDPOINT.es.amazonaws.com"
  }
}
```

### Using Docker

You can use our Docker image to run Blueprint.

```sh
docker pull ghcr.io/zazuko/blueprint:latest
```

It will listen on port 80.

The following environment variables can be set:

- `ENDPOINT_URL`: the SPARQL endpoint URL (required)
- `SPARQL_CONSOLE_URL`: the SPARQL console URL (default placeholder value: `http://example.com/sparql/#query`)
- `GRAPH_EXPLORER_URL`: the Graph Explorer URL (default placeholder value: `http://example.com/graph-explorer/?resource`)
- `FULL_TEXT_SEARCH_DIALECT`: the full text search dialect (default value: `fuseki`)
- `NEPTUNE_FTS_ENDPOINT`: the OpenSearch endpoint for the Neptune dialect (in case you are using `neptune` dialect)

If any of the required environment variables are not set, the container will be started using the development configuration.

You can also mount a custom configuration file to `/app/config.json`.

You should make sure that `ENDPOINT_URL`, `SPARQL_CONSOLE_URL` and `GRAPH_EXPLORER_URL` are reachable from the browser.
Make sure that `ENDPOINT_URL` is configured to allow CORS requests.

You can use [Trifid](https://github.com/zazuko/trifid) to proxy any SPARQL endpoint and to expose a SPARQL console and Graph Explorer.
You can also use it to dereference URIs.

## Development

### Configuration

Before the Blueprint Angular App starts, it fetches the `/config.json`. It will then overwrite the values in [environments/environment.development.ts](projects/blueprint/src/environments/environment.development.ts) or [environments/environment.ts](projects/blueprint/src/environments/environment.ts). At build time, `environments/environment.development.ts` will be replaced with the `environments/environment.ts` version.

You can still add configuration parameters to the environment files as usual. Internally, the Blueprint app only uses `src/environments/environment.ts`.

### Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Proxy for SPARQL - CORS Issues

Blueprint uses SPARQL to fetch data from a triple store. For development, the configuration parameter `endpointUrl` is set to `http://localhost:4200/query`. `ng serve` provides a proxy for SPARQL requests to the triple store. This way, CORS is not an issue, and it’s convenient to develop locally with a quickly configurable SPARQL endpoint.

The proxy is configured in `./proxy.conf.json`.

```json
{
  "/query": {
    "target": "https://ld.example.org/query",
    "headers": {
      "Connection": "keep-alive"
    },
    "secure": true,
    "changeOrigin": true
  }
}
```

Note: This proxy uses HTTP/1.1 and is therefore a bit slower.

## Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further Help

To get more help on the Angular CLI, use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## License

All source files in this project are licensed under the Apache License Version 2.0, unless otherwise noted in the file itself. For the full license text, see the [LICENSE](./LICENSE) file included in this repository.

Copyright 2024 Zazuko GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
