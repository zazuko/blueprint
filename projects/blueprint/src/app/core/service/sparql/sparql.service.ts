import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { LibraryConfigurationService } from '../library-configuration/library-configuration.service';

import { SparqlResult, SparqlResultTerm, transformToRecords } from './model/sparql-result-json';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';

@Injectable({
  providedIn: 'root',
})
export class SparqlService {
  readonly #http = inject(HttpClient);
  readonly #libraryConfigurationService = inject(LibraryConfigurationService);

  public fullTextSearchDialect: FullTextSearchDialect;

  constructor() {
    this.fullTextSearchDialect = this.#libraryConfigurationService.fullTextSearchDialect;

  }

  /**
   * Execute a SPARQL SELECT query
   *
   * @param query The SPARQL SELECT query
   * @returns an observable of the resulting bindings
   */
  select(query: string): Observable<Record<string, SparqlResultTerm>[]> {
    const endpoint = this.#libraryConfigurationService.endpointUrl;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    });

    const body = new URLSearchParams();
    body.set('query', query);

    const options = {
      headers
    };

    return this.#http.post<SparqlResult>(endpoint, body.toString(), options)
      .pipe(
        map(response => {
          const results = transformToRecords(response);
          return results;
        })
      );
  }

  /**
   * Execute a SPARQL CONSTRUCT query
   *
   * @param query The SPARQL CONSTRUCT query
   * @returns an observable of the resulting dataset
   */
  construct(query: string): Observable<RdfTypes.Dataset> {
    const endpoint = this.#libraryConfigurationService.endpointUrl;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/turtle'
    });

    const options = {
      headers,
      observe: 'response' as const,
      responseType: 'text' as const
    };

    const body = new URLSearchParams();
    body.set('query', query);
    return this.#http.post(endpoint, body.toString(), options)
      .pipe(
        map(response => {
          const dataset = rdfEnvironment.parseTurtle(response.body);
          return dataset
        })
      );
  }
}


export enum FullTextSearchDialect {
  FUSEKI = 'fuseki',
  STARDOG = 'stardog',
  NEPTUNE = 'neptune',
  GRAPHDB = 'graphdb',
  QLEVER = 'qlever'
}
