import { Component, Input } from '@angular/core';
import { Breadcrumb } from 'projects/blueprint/src/app/core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from "../../../../core/page/breadcrumb-page/breadcrumb-page.component";

@Component({
  selector: 'bp-graph-detail',
  standalone: true,
  templateUrl: './graph-detail.component.html',
  styleUrl: './graph-detail.component.scss',
  imports: [BreadcrumbPageComponent]
})
export class GraphDetailComponent {
  @Input({ required: true }) id: string;

  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '../../..',
      disabled: false
    },
    {
      label: 'Topology',
      route: '../..',
      disabled: false
    },
    {
      label: 'Detail',
      route: '.',
      disabled: false
    }
  ];
}
