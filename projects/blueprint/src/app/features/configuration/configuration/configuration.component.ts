import { Component, inject } from '@angular/core';
import { Breadcrumb } from '../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { Router, RouterLink } from '@angular/router';
import { BreadcrumbPageComponent } from "../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { ConfigurationCardComponent } from '../../../core/component/configuration-card/configuration-card.component';
import { MindMapComponent } from "../../../core/component/mermaid/mind-map/mind-map.component";
import { FlowchartComponent } from "../../../core/component/mermaid/flowchart/flowchart.component";

@Component({
  selector: 'bp-configuration',
  standalone: true,
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
  imports: [
    RouterLink,
    BreadcrumbPageComponent,
    ConfigurationCardComponent,
    MindMapComponent,
    FlowchartComponent
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
