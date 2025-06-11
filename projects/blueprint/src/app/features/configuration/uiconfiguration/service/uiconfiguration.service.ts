import { computed, inject, Injectable, linkedSignal, Signal } from '@angular/core';
import { ConfigService, LinkConfiguration } from '@blueprint/service/config/config.service';

@Injectable()
export class UIConfigurationService {
  readonly #configurationService = inject(ConfigService);

  #uiConfigurationFromServer = computed(() => {
    return this.#configurationService.configuration().ui;
  });

  #_uiLinkConfiguration = linkedSignal<LinkConfiguration>(() => {
    return this.#uiConfigurationFromServer().linkConfiguration;
  })

  uiLinkConfiguration = this.#_uiLinkConfiguration.asReadonly();


  setLinkConfiguration(linkConfiguration: LinkConfiguration) {
    this.#_uiLinkConfiguration.set(linkConfiguration);
    this.#configurationService.updateUiLinkConfiguration(linkConfiguration);
  }


}
