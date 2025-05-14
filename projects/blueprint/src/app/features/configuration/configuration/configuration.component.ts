import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigurationCardComponent } from '../../../core/component/configuration-card/configuration-card.component';
import { Breadcrumb } from '../../../shared/component/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from '../../../shared/component/page/breadcrumb-page/breadcrumb-page.component';

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
