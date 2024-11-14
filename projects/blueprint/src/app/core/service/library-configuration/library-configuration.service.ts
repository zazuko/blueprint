import { Injectable } from '@angular/core';
import { LibraryConfiguration } from './library-configuration.model';
import { FullTextSearchDialect } from '../sparql/sparql.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryConfigurationService {
  private configuration: LibraryConfiguration;

  constructor() {
    this.configuration = {
      production: false,
      sparqlConsoleUrl: null,
      graphExplorerUrl: null,
      endpointUrl: 'http://localhost:4200/query',
      fullTextSearchDialect: FullTextSearchDialect.STARDOG
    }
  }

  get fullTextSearchDialect(): FullTextSearchDialect {
    return this.configuration.fullTextSearchDialect;
  }

  set fullTextSearchDialect(value: FullTextSearchDialect) {
    switch (value) {
      case 'fuseki':
        this.configuration.fullTextSearchDialect = FullTextSearchDialect.FUSEKI;
        break;
      case 'stardog':
        this.configuration.fullTextSearchDialect = FullTextSearchDialect.STARDOG;
        break;
      case 'neptune':
        this.configuration.fullTextSearchDialect = FullTextSearchDialect.NEPTUNE;
        break;
      case 'graphdb':
          this.configuration.fullTextSearchDialect = FullTextSearchDialect.GRAPHDB;
          break;
      default:
        throw new Error('Invalid fullTextSearchDialect');
    }
  }

  get endpointUrl(): string {
    return this.configuration.endpointUrl;
  }

  set endpointUrl(value: string) {
    this.configuration.endpointUrl = value;
  }

  get sparqlConsoleUrl(): string {
    return this.configuration.sparqlConsoleUrl;
  }

  set sparqlConsoleUrl(value: string) {
    this.configuration.sparqlConsoleUrl = value;
  }

  get graphExplorerUrl(): string {
    return this.configuration.graphExplorerUrl;
  }

  set graphExplorerUrl(value: string) {
    this.configuration.graphExplorerUrl = value;
  }

  set production(value: boolean) {
    this.configuration.production = value;
  }

  get production(): boolean {
    return this.configuration.production;
  }

}
