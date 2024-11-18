import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { LibraryConfigurationService } from '@blueprint/service/library-configuration/library-configuration.service';

import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FullTextSearchDialect } from "@blueprint/service/sparql/sparql.service";
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _libraryConfigurationService = inject(LibraryConfigurationService);
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

      environment.fullTextSearchDialect = config?.fullTextSearchDialect;
      console.log('ConfigService', config?.fullTextSearchDialect);

      this._libraryConfigurationService.endpointUrl = environment.endpointUrl;
      this._libraryConfigurationService.sparqlConsoleUrl = environment.sparqlConsoleUrl;
      this._libraryConfigurationService.graphExplorerUrl = environment.graphExplorerUrl;
      this._libraryConfigurationService.production = environment.production;
      this._libraryConfigurationService.fullTextSearchDialect = environment.fullTextSearchDialect;

    }))
  }

  get config(): FluxConfig {
    return this._appConfiguration;
  }
}

export type FluxConfig = {
  readonly endpointUrl: string,
  readonly sparqlConsoleUrl: string,
  readonly graphExplorerUrl: string,
  readonly fullTextSearchDialect: FullTextSearchDialect
}
