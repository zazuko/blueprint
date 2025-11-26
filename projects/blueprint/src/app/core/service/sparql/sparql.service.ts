import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, catchError, map, of } from 'rxjs';

import { SparqlResult, SparqlResultTerm, transformToRecords } from './model/sparql-result-json';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { ConfigService } from '../config/config.service';
import { MessageChannelService } from '../message-channel/message-channel.service';

@Injectable({
  providedIn: 'root',
})
export class SparqlService {
  readonly #http = inject(HttpClient);
  readonly #appConfig = inject(ConfigService).getConfiguration();
  readonly messanger = inject(MessageChannelService);

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
          const dataset = rdfEnvironment.dataset();
          try {
            dataset.addAll(rdfEnvironment.parseTurtle(response.body));

          } catch (error) {
            console.error('Error parsing Turtle response:', error);
            console.error('Response body:', response.body);
            console.error('Response query:', query);
            throw error;
          }
          return dataset
        }),
        catchError(err  =>{
          const error = err as HttpErrorResponse;
          console.error('SPARQL Error:', error.status, error.statusText);
          this.messanger.error('SPARQL HTTP Error', error, 'Check your configuration or the endpoint is not reachable.');
           return of(rdfEnvironment.dataset())
        }  )
         
      )
  }
}
