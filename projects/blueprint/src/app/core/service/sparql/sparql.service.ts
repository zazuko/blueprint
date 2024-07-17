import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import rdfEnvironment from '@zazuko/env';
import { Dataset } from '@rdfjs/types';

import { Parser } from 'n3';

import { SparqlResult, SparqlResultTerm, transformToRecords } from './model/sparql-result-json';
import { environment } from 'projects/blueprint/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SparqlService {
  private readonly http = inject(HttpClient);

  public fullTextSearchDialect = environment.fullTextSearchDialect as FullTextSearchDialect;


  /**
   * Execute a SPARQL SELECT query
   * 
   * @param query The SPARQL SELECT query
   * @returns an observable of the resulting bindings 
   */
  select(query: string): Observable<Record<string, SparqlResultTerm>[]> {
    const endpoint = environment.endpointUrl;
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
    const endpoint = environment.endpointUrl;

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


export enum FullTextSearchDialect {
  FUSEKI = 'fuseki',
  STARDOG = 'stardog',
  NEPTUNE = 'neptune',
  GRAPHDB = 'graphdb'
}