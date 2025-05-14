import { Component, input } from '@angular/core';
import { BreadcrumbNavigationComponent } from '../../breadcrumb-navigation/breadcrumb-navigation/breadcrumb-navigation.component';
import { Breadcrumb } from '../../breadcrumb-navigation/model/breadcrumb.model';

/**
 * This component is used to display a breadcrumb navigation on a page.
 * Almost all pages in the application should use this component to display a breadcrumb navigation.
 */
@Component({
  selector: 'bp-breadcrumb-page',
  templateUrl: './breadcrumb-page.component.html',
  styleUrl: './breadcrumb-page.component.scss',
  imports: [BreadcrumbNavigationComponent]
})
export class BreadcrumbPageComponent {
  readonly breadcrumbs = input.required<Breadcrumb[]>();
}
