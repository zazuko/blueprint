import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'projects/blueprint/src/environments/environment';

import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  readonly #httpClient = inject(HttpClient);
  #appConfig = signal<AppConfiguration>({} as AppConfiguration);

  /**
   * This signal returns the app configuration.
   * There is a method version if you need it.
   * 
   * @see {@link getConfiguration}
   */
  configuration = this.#appConfig.asReadonly();

  /** 
   * Fetches the app configuration from the config.json file.
   * This method is called when the app is initialized. You shohuld never call this method directly.
   */
  fetchConfig(): Observable<AppConfiguration> {
    return this.#httpClient.get<AppConfiguration>('/config.json').pipe(tap(config => {

      if (!environment.production) {
        console.log('%c--- Blueprint Configuration -----', 'color:orange');
        console.log(`config.json`);
        console.log(JSON.stringify(config, null, 2));
        console.log('%c----------------------------------', 'color:orange');
        this.#appConfig.set(config);
      }
    }))
  }

  /**
   * This method returns the app configuration. 
   * There is a signal version if you need it.
   * 
   * @see {@link configuration}
   * @returns {AppConfiguration} The app configuration.
   */
  getConfiguration(): AppConfiguration {
    return this.configuration();
  }

}

export type AppConfiguration = {
  readonly endpointUrl: string,
  readonly sparqlConsoleUrl: string,
  readonly graphExplorerUrl: string,
  readonly fullTextSearchDialect: FullTextSearchDialect,
  readonly skipAuthentication?: boolean,
  readonly neptune?: NeptuneConfig,
}

type NeptuneConfig = {
  ftsEndpoint: string
}



export enum FullTextSearchDialect {
  FUSEKI = 'fuseki',
  STARDOG = 'stardog',
  NEPTUNE = 'neptune',
  GRAPHDB = 'graphdb',
  QLEVER = 'qlever'
}
