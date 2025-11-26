import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  protected readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '.',
      disabled: false
    }
  ]
}
