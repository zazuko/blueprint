import { Component, inject } from '@angular/core';
import { Breadcrumb } from '../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { Router, RouterLink } from '@angular/router';
import { BreadcrumbPageComponent } from "../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { ConfigurationCardComponent } from '../../../core/component/configuration-card/configuration-card.component';

@Component({
  selector: 'bp-configuration',
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
  imports: [
    RouterLink,
    BreadcrumbPageComponent,
    ConfigurationCardComponent,
  ]
})
export class ConfigurationComponent {
  readonly #router = inject(Router);
  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '.',
      disabled: false
    }
  ]
}
