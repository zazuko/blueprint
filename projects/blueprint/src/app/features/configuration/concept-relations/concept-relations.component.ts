import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { UiLinkMetadataService } from '@blueprint/service/ui-link-metadata/ui-link-metadata.service';
import { UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';


import { GraphComponent } from "../../../core/component/graph/graph/graph.component";
import { LoadingIndicatorService } from '../../../core/component/loading-indicator/service/loading-indicator.service';
import { Breadcrumb } from '../../../shared/component/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from '../../../shared/component/page/breadcrumb-page/breadcrumb-page.component';
import { Graph, IUiGraphNode, IUConsolidatedLink } from '@blueprint/component/graph/model/graph.model';
import { Avatar } from '../../../shared/component/ui/avatar/avatar.component';
import { flux } from '@blueprint/ontology';


@Component({
  selector: 'bp-concept-relations',
  templateUrl: './concept-relations.component.html',
  styleUrl: './concept-relations.component.scss',
  imports: [CommonModule, GraphComponent, BreadcrumbPageComponent]
})
export class ConceptRelationsComponent {
  readonly #classMetadataService = inject(UiClassMetadataService);
  readonly #linkMetadataService = inject(UiLinkMetadataService);
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

  readonly nodeDefinitions = toSignal<UiClassMetadata[] | undefined>(this.#classMetadataService.getClassMetadata(), { initialValue: undefined });
  readonly linkDefinitions = toSignal<UiLinkDefinition[] | undefined>(this.#linkMetadataService.getLinkMetadata(), { initialValue: undefined });




  /**
   * Turn node and links definitions into a graph object containing UiGraphNode[] and UiLink[]
   */
  graph = computed<Graph>(() => {
    const nodeDefinitions = this.nodeDefinitions();
    const linkDefinitions = this.linkDefinitions();

    if (!nodeDefinitions || !linkDefinitions) {
      return { nodes: [], links: [] };
    }
    const nodeMap = new Map<string, IUiGraphNode>();

    nodeDefinitions.forEach(nodeMetadata => {
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
        description: '',
        isBlankNode: false,
      };
      nodeMap.set(node.iri, node);
    });

    const uiLinks: IUConsolidatedLink[] = [];

    linkDefinitions.forEach(linkDefinition => {

      const link: IUConsolidatedLink = {
        id: linkDefinition.iri,
        iri: linkDefinition.iri,
        rdfType: flux.ConsolidatedLinkNamedNode.value,
        source: nodeMap.get(linkDefinition.arrowSource),
        target: nodeMap.get(linkDefinition.arrowTarget),
        outgoingChildLinks: [],
        incomingChildLinks: [],
        isBidirectional: false
      };

      if (link.source && link.target) {
        uiLinks.push(link);
      }
    });

    const graph: Graph = {
      nodes: [...nodeMap.values()],
      links: uiLinks
    };
    return graph

  });

  constructor() {



  }

}
