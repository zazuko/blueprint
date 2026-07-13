import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { LoadingIndicatorComponent } from '../core/component/loading-indicator/loading-indicator.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { MessageChannelService } from '@blueprint/service/message-channel/message-channel.service';

/**
 * This is the main component of the application. Providing the theme selector and the router outlet.
 * It is the entry point of the application. Everything is loaded inside this component.
 *
 */
@Component({
  selector: 'bp-blueprint',
  templateUrl: './blueprint.component.html',
  styleUrl: './blueprint.component.scss',
  imports: [
    RouterOutlet,
    NavigationComponent,
    LoadingIndicatorComponent,
    MatSnackBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class BlueprintComponent {
  readonly #snackBar = inject(MatSnackBar);
  readonly #messageChannelService = inject(MessageChannelService);
  constructor() {
    this.#messageChannelService.error$.subscribe((message) => {
      const detail =
        message.message +
        ' ' +
        (message.details ? JSON.stringify(message.details, null, 2) : '') +
        ' What todo' +
        (message.suggestion ? ' - ' + message.suggestion : '');
      this.#snackBar.open(detail, 'Dismiss', {
        duration: 10000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    });
  }
}
