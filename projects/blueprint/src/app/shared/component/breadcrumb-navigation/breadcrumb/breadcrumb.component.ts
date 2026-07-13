import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { Breadcrumb } from '../model/breadcrumb.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bp-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  readonly breadcrumb = input.required<Breadcrumb>();
}
