import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, forkJoin, map, tap } from 'rxjs';

import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';

import { GraphComponent } from "../../../core/component/graph/graph/graph.component";
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { Graph, IUiGraphNode, IUiLink } from '@blueprint/component/graph/model/graph.model';
import { Avatar } from 'projects/blueprint/src/app/shared/component/avatar/avatar.component';
import { Breadcrumb } from '../../../shared/component/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from '../../../shared/component/page/breadcrumb-page/breadcrumb-page.component';

@Component({
  selector: 'bp-concept-relations',
  templateUrl: './concept-relations.component.html',
  styleUrl: './concept-relations.component.scss',
  imports: [CommonModule, GraphComponent, BreadcrumbPageComponent]
})
export class ConceptRelationsComponent implements OnInit {
  readonly #classMetadataService = inject(UiClassMetadataService);
  readonly #linkMetadataService = inject(UiLinkMetadataService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #loadingIndicatorService = inject(LoadingIndicatorService);

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
        nodes: this.#classMetadataService.getClassMetadata().pipe(tap(() => this.#loadingIndicatorService.loading())),
        links: this.#linkMetadataService.getLinkMetadata()
      }
    ).pipe(
      takeUntilDestroyed(this.#destroyRef),
      map(metadata => {
        const nodeMap = new Map<string, IUiGraphNode>();

        metadata.nodes.forEach(nodeMetadata => {
          if (nodeMap.has(nodeMetadata.targetNode.value)) {
            return;
          }

          const avatar: Avatar = {
            label: nodeMetadata.label,
            color: nodeMetadata.color,
            icon: nodeMetadata.icon,
          };


          const node: IUiGraphNode = {
            iri: nodeMetadata.targetNode.value,
            id: nodeMetadata.targetNode.value,
            label: nodeMetadata.label,
            avatars: [avatar],
            index: -1,
            x: 0,
            y: 0,
            isPinned: false,
            showPin: false,
            fixed: 0,
            expanded: false,
            showMenu: false,
            classLabel: ['Concept'],
            color: nodeMetadata.color,
            description: ''
          };
          nodeMap.set(node.iri, node);
        });




        const links: IUiLink[] = [];
        metadata.links.forEach(linkMetadata => {

          const link: IUiLink = {
            id: linkMetadata.iri,
            iri: linkMetadata.iri,
            label: linkMetadata.label,
            source: nodeMap.get(linkMetadata.source),
            target: nodeMap.get(linkMetadata.destination)
          };

          if (link.source && link.target) {
            links.push(link);
          }
        });
        this.#loadingIndicatorService.done();

        const graph: Graph = {
          nodes: [...nodeMap.values()],
          links
        };
        return graph
      })
    );
  }
}
