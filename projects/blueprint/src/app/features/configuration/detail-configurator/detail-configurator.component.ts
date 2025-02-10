import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InputTextModule } from 'primeng/inputtext';

import { BreadcrumbPageComponent } from '../../../core/page/breadcrumb-page/breadcrumb-page.component';
import { Breadcrumb } from '../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';

import { ConfigurationCardComponent } from '../../../core/component/configuration-card/configuration-card.component';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { labelAlphaSort } from '@blueprint/utils';

@Component({
    selector: 'bp-detail-configurator',
    imports: [RouterLink, BreadcrumbPageComponent, ConfigurationCardComponent, FormsModule, InputTextModule],
    templateUrl: './detail-configurator.component.html',
    styleUrl: './detail-configurator.component.scss'
})
export class DetailConfiguratorComponent {

  private readonly classMetadata = inject(UiClassMetadataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);

  public readonly uiClassMetadataSignal = signal<UiClassMetadata[]>([]);
  public readonly filterTermSignal = signal<string>('');


  public readonly filteredUiClassMetadataSignal = computed<UiClassMetadata[]>(() => {
    const filterTerm = this.filterTermSignal().trim();
    const uiClassMetadata = this.uiClassMetadataSignal();
    if (filterTerm !== '') {
      return uiClassMetadata.filter(uiClass => uiClass.label.toLowerCase().includes(filterTerm.toLowerCase()));
    }
    return uiClassMetadata;
  });

  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '..',
      disabled: false
    },
    {
      label: 'Details',
      route: '.',
      disabled: false
    }
  ];

  constructor() {
    this.classMetadata.getClassMetadata().pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.loadingIndicatorService.loading())
    ).subscribe(
      {
        next: (classMetadata: UiClassMetadata[]) => {
          this.uiClassMetadataSignal.set(classMetadata.sort(labelAlphaSort));
          this.loadingIndicatorService.done();
        },
        error: err => {
          this.loadingIndicatorService.done();
          console.error(err)
        },
        complete: () => {
          this.loadingIndicatorService.done();
        }

      }
    );
  }

}
