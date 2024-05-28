import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, forkJoin, map, tap } from 'rxjs';

import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';

import { GraphComponent } from "../../../core/component/graph/graph/graph.component";
import { BreadcrumbPageComponent } from "../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { Breadcrumb } from '../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { Graph } from '@blueprint/component/graph/model/graph.model';
import { GraphNode } from '@blueprint/component/graph/model/graph-node.model';
import { GraphLink } from '@blueprint/component/graph/model/graph-link.model';
import { combineLinkWithSameSourceAndTarget } from '../../explore/service/graph/graph.service';


@Component({
  selector: 'bp-concept-relations',
  standalone: true,
  templateUrl: './concept-relations.component.html',
  styleUrl: './concept-relations.component.scss',
  imports: [CommonModule, GraphComponent, BreadcrumbPageComponent]
})
export class ConceptRelationsComponent implements OnInit {
  private readonly classMetadataService = inject(UiClassMetadataService);
  private readonly linkMetadataService = inject(UiLinkMetadataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadingIndicatorService = inject(LoadingIndicatorService);

  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Inventory',
      route: '..',
      disabled: false
    }, {
      label: 'Concepts',
      route: '.',
      disabled: false
    }
  ];

  graph$: Observable<Graph>;

  ngOnInit(): void {

    this.graph$ = forkJoin(
      {
        nodes: this.classMetadataService.getClassMetadata().pipe(tap(() => this.loadingIndicatorService.loading())),
        links: this.linkMetadataService.getLinkMetadata()
      }
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(metadata => {
        const nodeMap = new Map<string, GraphNode>();

        const nodes = metadata.nodes.map(nodeMetadata => {
          const node = {} as GraphNode;
          node.id = nodeMetadata.targetNode.value;
          node.label = nodeMetadata.label;
          node.icon = nodeMetadata.icon;
          node.colorIndex = nodeMetadata.colorIndex.toString();
          node.type = '';
          node.linksLimitedTo = 100;
          nodeMap.set(node.id, node);
          return node;
        });
        const links: GraphLink[] = [];
        metadata.links.forEach(linkMetadata => {
          const link = {} as GraphLink;
          link.id = linkMetadata.iri;
          link.label = linkMetadata.label;
          link.source = nodeMap.get(linkMetadata.source);
          link.target = nodeMap.get(linkMetadata.destination);
          if (link.source && link.target) {
            links.push(link);
          }
        });
        this.loadingIndicatorService.done();
        return {
          nodes,
          links: combineLinkWithSameSourceAndTarget(links)
        } as Graph;
      })
    );
  }
}
