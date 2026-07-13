import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LoadingIndicatorService } from './service/loading-indicator.service';

@Component({
  selector: 'bp-loading-indicator',
  imports: [MatProgressBarModule],
  templateUrl: './loading-indicator.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading-indicator.component.scss',
})
export class LoadingIndicatorComponent {
  public readonly loadingIndicatorService = inject(LoadingIndicatorService);
}
