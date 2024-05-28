import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Clipboard } from '@angular/cdk/clipboard';

import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';


import { Avatar, AvatarComponent } from '../../../core/component/avatar/avatar.component';
import { fadeIn } from '@blueprint/animation/fade-in-out/fade-in-out';
import { LibraryConfigurationService } from '@blueprint/service/library-configuration/library-configuration.service';


@Component({
  selector: 'bp-explore-header',
  standalone: true,
  templateUrl: './explore-header.component.html',
  styleUrls: ['./explore-header.component.scss'],
  imports: [CommonModule, MenuModule, ButtonModule, ToastModule, AvatarComponent, SkeletonModule],
  animations: [fadeIn],
  providers: [MessageService]
})
export class ExploreHeaderComponent {
  iri = input<string>('');
  subjectLabel = input.required<string>();
  subjectClassLabel = input.required<string>();
  avatars = input.required<Avatar[]>();
  isLoading = input<boolean>(true);

  public readonly messageService = inject(MessageService);
  public readonly config = inject(LibraryConfigurationService);
  public readonly clipboard = inject(Clipboard);

  items: MenuItem[] = [
    {
      label: 'Copy IRI',
      icon: 'pi pi-copy',
      command: () => {
        this.copyIri();
      }
    },
    {
      label: 'Dereference',
      icon: 'pi pi-link',
      command: () => {
        this.openDereference();
      }
    },
    {
      label: 'SPARQL',
      icon: 'pi pi-share-alt',
      command: () => {
        this.openSparqlConsole();
      }
    },
    {
      label: 'Graph Explorer',
      icon: 'pi pi-compass',
      command: () => {
        this.openGraphExplorer();
      }
    }
  ];

  public copyIri(): void {
    this.clipboard.copy(this.iri());
  }

  public openSparqlConsole(): void {
    const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
    SELECT * WHERE {
      <${this.iri()}> ?p ?o .
    } 
    `;

    const url = `${this.config.sparqlConsoleUrl}=${encodeURIComponent(
      query
    )}&contentTypeConstruct=text%2Fturtle&contentTypeSelect=application%2Fsparql-results%2Bjson&endpoint=https%3A%2F%2Fld.flux.zazuko.com%2Fquery&requestMethod=POST&tabTitle=Query+2&headers=%7B%7D&outputFormat=table`;
    window.open(url, '_blank');
  }

  public openGraphExplorer(): void {
    const url = `${this.config.graphExplorerUrl}=${encodeURIComponent(this.iri())}`;
    window.open(url, '_blank');
  }

  public openDereference(): void {
    window.open(this.iri(), '_blank');
  }
}

