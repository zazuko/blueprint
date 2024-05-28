import { Component, Input } from '@angular/core';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../model/breadcrumb.model';
@Component({
  selector: 'bp-breadcrumb-navigation',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './breadcrumb-navigation.component.html',
  styleUrl: './breadcrumb-navigation.component.scss'
})
export class BreadcrumbNavigationComponent {
  @Input({ required: true }) breadcrumbs: Breadcrumb[] = [];
  @Input() home: string | null = '';
}
