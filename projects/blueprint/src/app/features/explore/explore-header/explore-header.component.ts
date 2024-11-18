import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Clipboard } from '@angular/cdk/clipboard';

import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';


import { Avatar, AvatarComponent } from '../../../core/component/avatar/avatar.component';
import { fadeIn } from '@blueprint/animation/fade-in-out/fade-in-out';
import { LibraryConfigurationService } from '@blueprint/service/library-configuration/library-configuration.service';


@Component({
  selector: 'bp-explore-header',
  standalone: true,
  templateUrl: './explore-header.component.html',
  styleUrls: ['./explore-header.component.scss'],
  imports: [CommonModule, MenuModule, ButtonModule, ToastModule, AvatarComponent, SkeletonModule, RippleModule],
  animations: [fadeIn],
  providers: [MessageService]
})
export class ExploreHeaderComponent {
  iri = input.required<string>();
  subjectLabel = input.required<string>();
  subjectClassLabel = input.required<string>();
  avatars = input.required<Avatar[]>();
  isLoading = input<boolean>(true);

  public readonly messageService = inject(MessageService);
  public readonly config = inject(LibraryConfigurationService);
  public readonly clipboard = inject(Clipboard);


  items = computed<MenuItem[]>(() => {
    const iri = this.iri();
    return [
      {
        label: 'Copy IRI',
        icon: 'pi pi-copy',
        command: () => {
          this.copyIri();
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
        visible: this.config.sparqlConsoleUrl !== null,
        tabindex: '-1',
      },
      {
        label: 'Graph Explorer',
        icon: 'pi pi-compass',
        url: this.graphExplorerUrl(),
        target: '_blank',
        tabindex: '-1',
      }
    ]
  });


  public copyIri(): void {
    this.clipboard.copy(this.iri());
  }

  public sparqlConsoleUrl(): string {
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
      endpoint: this.config.endpointUrl,
      outputFormat: 'table',
      requestMethod: 'POST',
      query
    });
    const url = new URL(this.config.sparqlConsoleUrl);
    url.hash = '#' + params.toString();

    return url.toString()
  }

  public graphExplorerUrl(): string {
    const url = new URL(this.config.graphExplorerUrl);
    url.searchParams.set('resource', this.iri());
    return url.toString()
  }
}

