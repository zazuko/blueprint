import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'projects/blueprint/src/environments/environment';

import { Observable, tap } from 'rxjs';

/**
 * This is a special service that is used to fetch the app configuration from the config.json file.
 * This service is used in the app initializer to fetch the configuration before the app is loaded.
 * Inside the app you can use it normally like any other service.
 * 
 * The configuration is stored in a signal, or you can use the method {@link getConfiguration} to get the configuration.
 */
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
      const uiConfig = config.ui;

      // if there is no ui configuration, default link configuration is set to both
      if (!uiConfig) {
        config.ui = {
          linkConfiguration: LinkConfiguration.BOTH
        } as UiConfiguration;
      }
      this.#appConfig.set(config);

      if (!environment.production) {
        console.log('%c--- Blueprint Configuration -----', 'color:orange');
        console.log(`config.json`);
        console.log(JSON.stringify(config, null, 2));
        console.log('%c----------------------------------', 'color:orange');
      }
    }))
  }


  updateUiLinkConfiguration(linkConfiguration: LinkConfiguration): void {
    const currentConfig = this.#appConfig();
    const updatedConfig: AppConfiguration = {
      ...currentConfig,
      ui: {
        ...currentConfig.ui,
        linkConfiguration: linkConfiguration
      }
    };
    this.#appConfig.set(updatedConfig);
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
  ui: UiConfiguration,
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

export interface UiConfiguration {
  linkConfiguration: LinkConfiguration;

}


export enum LinkConfiguration {
  APP = 'app',
  RDF = 'rdf',
  BOTH = 'both'
}