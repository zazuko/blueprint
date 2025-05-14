import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ConfigurationCardComponent } from "../../../core/component/configuration-card/configuration-card.component";
import { HierarchyService } from './service/hierarchy.service';
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageChannelService } from '../../../core/service/message-channel/message-channel.service';
import { HierarchyDefinition } from './service/model/hierarchy-definition.model';
import { Breadcrumb } from '../../../shared/component/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from '../../../shared/component/page/breadcrumb-page/breadcrumb-page.component';


@Component({
  selector: 'bp-topology',
  templateUrl: './topology.component.html',
  styleUrl: './topology.component.scss',
  imports: [RouterLink, BreadcrumbPageComponent, ConfigurationCardComponent]
})
export class TopologyComponent implements OnInit {
  private readonly messageChannel = inject(MessageChannelService);

  private readonly hierarchyService = inject(HierarchyService);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);
  private readonly destroyRef = inject(DestroyRef);

  public hierarchiesSignal = signal<HierarchyDefinition[]>([]);
  public graphSignal = signal<GraphDefinition[]>([{ iri: 'https://ld.flux.zazuko.com/blueprint/app/K8SNamespaceTree', label: 'Graph', comment: 'Graph' }]);

  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '..',
      disabled: false
    },
    {
      label: 'Topology',
      route: '.',
      disabled: false
    }
  ];

  ngOnInit(): void {
    this.loadingIndicatorService.loading();
    this.hierarchyService.getAllHierarchies().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      {
        next: (result) => {
          this.hierarchiesSignal.set(result);
          this.loadingIndicatorService.done();
          this.messageChannel.debug('Hierarchies loaded. Update UI');
        },
        error: (error) => {
          this.loadingIndicatorService.done();
          this.messageChannel.error('Hierarchies load failed', error, 'Check your hierarchy configuration');

        },
        complete: () => {
          this.loadingIndicatorService.done();
          this.messageChannel.debug('Hierarchies load completed');
        }
      });
  }
}


export interface GraphDefinition {
  iri: string;
  label: string;
  comment: string;
}