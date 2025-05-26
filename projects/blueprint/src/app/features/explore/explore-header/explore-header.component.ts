import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Clipboard } from '@angular/cdk/clipboard';

import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';

import { Avatar, AvatarComponent } from '../../../shared/component/avatar/avatar.component';
import { fadeIn } from '@blueprint/animation/fade-in-out/fade-in-out';
import { ConfigService } from '@blueprint/service/config/config.service';


@Component({
  selector: 'bp-explore-header',
  templateUrl: './explore-header.component.html',
  styleUrls: ['./explore-header.component.scss'],
  imports: [CommonModule, MenuModule, ButtonModule, ToastModule, AvatarComponent, SkeletonModule, RippleModule],
  animations: [fadeIn],
  providers: [MessageService]
})
export class ExploreHeaderComponent {
  readonly iri = input.required<string>();
  readonly subjectLabel = input.required<string>();
  readonly subjectClassLabel = input.required<string>();
  readonly avatars = input.required<Avatar[]>();
  readonly isLoading = input<boolean>(true);

  readonly messageService = inject(MessageService);
  readonly #clipboard = inject(Clipboard);
  readonly #appConfig = inject(ConfigService);



  items = computed<MenuItem[]>(() => {
    const appConfiguration = this.#appConfig.configuration();
    const iri = this.iri();
    return [
      {
        label: 'Copy IRI',
        icon: 'pi pi-copy',
        command: () => {
          this.copyIriToClipboard();
        },
        tabindex: '-1',
      },
      {
        label: 'Dereference',
        icon: 'pi pi-link',
        url: iri,
        target: '_blank',
        tabindex: '-1',
      },
      {
        label: 'SPARQL',
        icon: 'pi pi-share-alt',
        url: this.sparqlConsoleUrl(),
        target: '_blank',
        visible: appConfiguration.sparqlConsoleUrl !== null,
        tabindex: '-1',
      },
      {
        label: 'Graph Explorer',
        icon: 'pi pi-compass',
        url: this.graphExplorerUrl(),
        visible: this.graphExplorerUrl() !== null,
        target: '_blank',
        tabindex: '-1',
      }
    ]
  });



  sparqlConsoleUrl = computed<string>(() => {
    const appConfiguration = this.#appConfig.configuration();


    const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT * WHERE {
      <${this.iri()}> ?p ?o .
    }
    `;

    const params = new URLSearchParams({
      contentTypeConstruct: 'text/turtle',
      contentTypeSelect: 'application/sparql-results+json',
      endpoint: appConfiguration.endpointUrl,
      outputFormat: 'table',
      requestMethod: 'POST',
      query
    });

    const url = new URL(appConfiguration.sparqlConsoleUrl);
    url.hash = '#' + params.toString();

    return url.toString()
  })

  graphExplorerUrl = computed<string | null>(() => {
    const appConfiguration = this.#appConfig.configuration();
    if (!appConfiguration.graphExplorerUrl) {
      return null;
    }
    const url = new URL(appConfiguration.graphExplorerUrl);
    url.searchParams.set('resource', this.iri());
    return url.toString()
  });


  /**
   * Copy the IRI to the clipboard.
   * 
   * @returns {void}
   */
  public copyIriToClipboard(): void {

    this.#clipboard.copy(this.iri());
    this.messageService.add({
      severity: 'success',
      summary: 'Copied IRI',
      detail: this.iri(),
      life: 2000
    });
  }

}

