import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _httpClient = inject(HttpClient);
  protected static instance = 0;
  private _appConfiguration: FluxConfig = null;

  constructor() {
    ConfigService.instance++;
  }

  fetchConfig(): Observable<FluxConfig> {
    return this._httpClient.get<FluxConfig>('/config.json').pipe(tap(config => {
      this._appConfiguration = config;


      if (environment.production) {
        environment.endpointUrl = config.endpointUrl ?? environment.endpointUrl;
      }

      environment.sparqlConsoleUrl = config?.sparqlConsoleUrl ?? null;
      environment.graphExplorerUrl = config?.graphExplorerUrl ?? null;

      environment.fullTextSearchDialect = config?.fullTextSearchDialect ?? 'stardog';
      environment.configurationIri = config?.configurationIri ?? null;
    }))
  }

  get config(): FluxConfig {
    return this._appConfiguration;
  }


}

export type FluxConfig = {
  readonly configurationIri: string,
  readonly endpointUrl: string,
  readonly sparqlConsoleUrl: string,
  readonly graphExplorerUrl: string,
  readonly fullTextSearchDialect: 'fuseki' | 'stardog'
}
