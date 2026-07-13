import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../model/breadcrumb.model';
@Component({
  selector: 'bp-breadcrumb-navigation',
  imports: [BreadcrumbComponent],
  templateUrl: './breadcrumb-navigation.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './breadcrumb-navigation.component.scss',
})
export class BreadcrumbNavigationComponent {
  readonly breadcrumbs = input.required<Breadcrumb[]>();
  readonly home = input<string | null>('');
}
