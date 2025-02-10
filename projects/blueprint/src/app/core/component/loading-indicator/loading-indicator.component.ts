import { Component, inject } from '@angular/core';

import { ProgressBarModule } from 'primeng/progressbar';

import { LoadingIndicatorService } from './service/loading-indicator.service';


@Component({
    selector: 'bp-loading-indicator',
    imports: [ProgressBarModule],
    templateUrl: './loading-indicator.component.html',
    styleUrl: './loading-indicator.component.scss'
})
export class LoadingIndicatorComponent {
  public readonly loadingIndicatorService = inject(LoadingIndicatorService);
}
