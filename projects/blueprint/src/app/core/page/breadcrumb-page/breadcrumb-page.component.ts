import { Component, Input } from '@angular/core';
import { Breadcrumb } from '../../layout/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbNavigationComponent } from "../../layout/breadcrumb-navigation/breadcrumb-navigation/breadcrumb-navigation.component";

@Component({
    selector: 'bp-breadcrumb-page',
    templateUrl: './breadcrumb-page.component.html',
    styleUrl: './breadcrumb-page.component.scss',
    imports: [BreadcrumbNavigationComponent]
})
export class BreadcrumbPageComponent {
  @Input({ required: true }) breadcrumbs: Breadcrumb[] = [];
}
