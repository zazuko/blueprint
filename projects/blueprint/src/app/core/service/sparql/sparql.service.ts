import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import rdfEnvironment from '@zazuko/env';
import { Dataset } from '@rdfjs/types';

import { Parser } from 'n3';


import { LibraryConfigurationService } from '../library-configuration/library-configuration.service';

import { SparqlResult, SparqlResultTerm, transformToRecords } from './model/sparql-result-json';

@Injectable({
  providedIn: 'root',
})
export class SparqlService {
  private readonly http = inject(HttpClient);
  private readonly libraryConfigurationService = inject(LibraryConfigurationService);

  public fullTextSearchDialect: FullTextSearchDialect | undefined;

  constructor() {
    this.fullTextSearchDialect = this.libraryConfigurationService.fullTextSearchDialect;

  }

  /**
   * Execute a SPARQL SELECT query
   *
   * @param query The SPARQL SELECT query
   * @returns an observable of the resulting bindings
   */
  select(query: string): Observable<Record<string, SparqlResultTerm>[]> {
    const endpoint = this.libraryConfigurationService.endpointUrl;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    });

    const body = new URLSearchParams();
    body.set('query', query);

    const options = {
      headers
    };

    return this.http.post<SparqlResult>(endpoint, body.toString(), options)
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
  construct(query: string): Observable<Dataset> {
    const endpoint = this.libraryConfigurationService.endpointUrl;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/n-triples'
    });

    const options = {
      headers,
      observe: 'response' as const,
      responseType: 'text' as const
    };

    const body = new URLSearchParams();
    body.set('query', query);
    return this.http.post(endpoint, body.toString(), options)
      .pipe(
        map(response => {
          const parser = new Parser();
          const quads = parser.parse(response.body);
          const dataset = rdfEnvironment.dataset(quads);
          return dataset as unknown as Dataset;
        })
      );
  }
}

export const Dialects = ['fuseki', 'stardog' ,'neptune' , 'graphdb'] as const;
export type FullTextSearchDialect = typeof Dialects[number];
