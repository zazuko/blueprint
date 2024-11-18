import { Injectable } from '@angular/core';
import { LibraryConfiguration } from './library-configuration.model';
import {Dialects, FullTextSearchDialect} from '../sparql/sparql.service';

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
    }
  }

  get fullTextSearchDialect(): FullTextSearchDialect | undefined {
    return this.configuration.fullTextSearchDialect;
  }

  set fullTextSearchDialect(value: FullTextSearchDialect | undefined) {
    if(!value) {
      this.configuration.fullTextSearchDialect = undefined
    } else if(Dialects.includes(value)) {
      this.configuration.fullTextSearchDialect = value;
    } else {
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
