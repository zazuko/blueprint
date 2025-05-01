import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { SparqlResult, SparqlResultTerm, transformToRecords } from './model/sparql-result-json';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root',
})
export class SparqlService {
  readonly #http = inject(HttpClient);
  readonly #appConfig = inject(ConfigService).getConfiguration();


  /**
   * Execute a SPARQL SELECT query
   *
   * @param query The SPARQL SELECT query
   * @returns an observable of the resulting bindings
   */
  select(query: string): Observable<Record<string, SparqlResultTerm>[]> {
    const endpoint = this.#appConfig.endpointUrl;
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
    const endpoint = this.#appConfig.endpointUrl;

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
