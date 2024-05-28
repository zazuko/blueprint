# Blueprint - Enterprise Knowledge Graph Browser

## Introduction

This is the Blueprint Enterprise Knowledge Graph Browser WebApp. Currently it runs fully in browser and is a single page application.


## Configuration

The configuration file is located in  `./src/config.json`.

```json
{
    "endpointUrl": "http://localhost:4200/query",
    "sparqlConsoleUrl": "https://ld.example.org/sparql/#query'",
    "graphExplorerUrl": "https://ld.example.org/graph-explorer/?resource",
    "fullTextSearchDialect": "stardog"
}
```

After the build `config.json` is located in the App root directory. You can replace it if needed.

**sparqlConsoleUrl** - you can provide a link to a SPARQL console. It's used in the flux detail panel context menu to jump to something like a YasGUI. Set it to `null` to remove the option from the context menu.

**graphExplorerUrl** - you can provide a link to an instance of Graph Explorer . It's used in the flux detail panel context menu to jump to graph explorer. Set it to `null` to remove the option from the context menu.

**endpointUrl** - the SPARQL endpoint URL. This is the URL where the SPARQL queries are sent to. It's used to fetch data from the triple store. The SPARQL endpoint must support CORS or you need to use a proxy for development. See below for more information.

**fullTextSearchDialect** - the full text search dialect. Currently only `stardog` and `fuseki` is supported. This is used to fetch full text search results.

## Development

### Configuration

Before the Blueprint Angular App starts it fetches the `/config.json`. It will then overwrite the values in `src/environments/environment.development.ts` or `src/environments/environment.ts`. At build time `src/environments/environment.development.ts` will be replaced with the `src/environments/environment.ts` version.

You can still add configuration parameters to the environment files as usual. Internally the Blueprint app is only using `src/environments/environment.ts`.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Proxy for SPARQL - CORS Terror

Blueprint is using SPARQL to fetch data from a triple store. For development the configuration parameter `endpointUrl` is `http://localhost:4200/query`. `ng serve` provides a proxy for SPARQL request to the triple store.
This way CORS is not an issue and it's convenient to develop locally and the SPARQL endpoint can be configured quickly.

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

Note: This proxy is using HTTP/1.1 and therefore a bit slower.


## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


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
