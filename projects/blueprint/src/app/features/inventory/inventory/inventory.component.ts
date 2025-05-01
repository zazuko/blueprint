import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TooltipModule } from 'primeng/tooltip';

import { Breadcrumb } from '../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from "../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { HierarchyService } from '../../configuration/topology/service/hierarchy.service';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { HierarchyCardComponent } from './hierarchy-card/hierarchy-card.component';
import { HierarchyDefinition } from '../../configuration/topology/service/model/hierarchy-definition.model';
import { fadeInOut } from '../../../core/animation/fade-in-out/fade-in-out';

@Component({
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  imports: [
    RouterLink,
    BreadcrumbPageComponent,
    HierarchyCardComponent,
    TooltipModule
  ],
  animations: [fadeInOut]
})
export class InventoryComponent {
  readonly #hierarchyService = inject(HierarchyService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #loadingIndicatorService = inject(LoadingIndicatorService);

  public readonly hierarchySignal = signal<HierarchyDefinition[]>([]);
  public readonly showContentSignal = signal<boolean>(false);

  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Inventory',
      route: '/inventory',
      disabled: false
    }
  ];

  constructor() {
    this.#loadingIndicatorService.loading();
    this.#hierarchyService.getAllHierarchies().pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(
      {
        next: hierarchies => {
          this.hierarchySignal.set(hierarchies);
          this.#loadingIndicatorService.done();
          this.showContentSignal.set(true);
        },
        error: error => {
          console.error(error);
          this.#loadingIndicatorService.done();
          this.showContentSignal.set(true);
        },
        complete: () => {
          this.#loadingIndicatorService.done();
          this.showContentSignal.set(true);
        }
      }
    );
  }


}
