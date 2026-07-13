import {
  Component,
  computed,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Clipboard } from '@angular/cdk/clipboard';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  Avatar,
  AvatarComponent,
} from '../../../shared/component/ui/avatar/avatar.component';
import { fadeIn } from '@blueprint/animation/fade-in-out/fade-in-out';
import { ConfigService } from '@blueprint/service/config/config.service';

@Component({
  selector: 'bp-explore-header',
  templateUrl: './explore-header.component.html',
  styleUrls: ['./explore-header.component.scss'],
  imports: [
    MatMenuModule,
    MatButtonModule,
    MatSnackBarModule,
    AvatarComponent,
  ],
  animations: [fadeIn],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ExploreHeaderComponent {
  readonly iri = input.required<string>();
  readonly subjectLabel = input.required<string>();
  readonly subjectClassLabel = input.required<string>();
  readonly avatars = input.required<Avatar[]>();
  readonly isLoading = input<boolean>(true);

  readonly #snackBar = inject(MatSnackBar);
  readonly #clipboard = inject(Clipboard);
  readonly #appConfig = inject(ConfigService);

  items = computed<any[]>(() => {
    const appConfiguration = this.#appConfig.configuration();
    const iri = this.iri();
    return [
      {
        label: 'Copy IRI',
        icon: 'fas fa-copy',
        command: () => {
          this.copyIriToClipboard();
        },
      },
      {
        label: 'Dereference',
        icon: 'fas fa-link',
        url: iri,
      },
      {
        label: 'SPARQL',
        icon: 'fas fa-share-alt',
        url: this.sparqlConsoleUrl(),
        visible: appConfiguration.sparqlConsoleUrl !== null,
      },
      {
        label: 'Graph Explorer',
        icon: 'fas fa-compass',
        url: this.graphExplorerUrl(),
        visible: this.graphExplorerUrl() !== null,
      },
    ].filter(item => item.visible !== false);
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
      query,
    });

    const url = new URL(appConfiguration.sparqlConsoleUrl);
    url.hash = '#' + params.toString();

    return url.toString();
  });

  graphExplorerUrl = computed<string | null>(() => {
    const appConfiguration = this.#appConfig.configuration();
    if (!appConfiguration.graphExplorerUrl) {
      return null;
    }
    const url = new URL(appConfiguration.graphExplorerUrl);
    url.searchParams.set('resource', this.iri());
    return url.toString();
  });

  /**
   * Copy the IRI to the clipboard.
   *
   * @returns {void}
   */
  public copyIriToClipboard(): void {
    this.#clipboard.copy(this.iri());

    this.#snackBar.open('Copied IRI: ' + this.iri(), 'Dismiss', {
      duration: 2000,
    });
  }
}
