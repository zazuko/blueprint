import { Component, computed, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOut } from '@blueprint/animation/fade-in-out/fade-in-out';
import { Graph, IUiGraphNode, RdfConsolidatedLink } from '../graph/model/graph.model';
import { NeighborNodeList, NeighborNodesListComponent } from './neighbor-nodes-list/neighbor-nodes-list.component';
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import { labelAlphaSort } from '../../utils/sort-functions';
import { ExploredResource } from '../../../features/explore/model/explored-resource.class';

@Component({
  selector: 'bp-neighbor-nodes',
  imports: [
    CommonModule,
    //  NeighborNodesListComponent,
  ],
  templateUrl: './neighbor-nodes.component.html',
  styleUrl: './neighbor-nodes.component.scss',
  animations: [
    fadeInOut
  ]
})
export class NeighborNodesComponent {
  readonly graph = input.required<Graph>();
  readonly exploredResource = input.required<ExploredResource>();

  nodeSelected = output<IUiGraphNode>();

  /**
  nodeList = computed<NeighborNodeList[]>(() => {
    const graph = this.graph();
    const nodes = graph.nodes;
    const links = graph.links;
    const currentIri = this.exploredResource().iri;

    const nodeMap = new Map<string, IUiGraphNode>();
    for (const node of nodes) {
      const iri = node.iri;
      if (!nodeMap.has(iri)) {
        nodeMap.set(iri, node);
      }
    }

    const linkMap = new Map<string, UiLinkDefinition>();
    for (const link of links) {
      if (link.linkDefinition === undefined) {
        console.warn('link.linkDefinition is undefined', link);
        (link as RdfUiLink).logTable();
        continue;
      }
      const linkDefinitionIri = link.linkDefinition.iri;
      linkMap.set(linkDefinitionIri, link.linkDefinition);
    }


    const outLinkMap = new Map<string, IUiGraphNode[]>();
    const inLinkMap = new Map<string, IUiGraphNode[]>();


    for (const link of links) {
      const sourceIri = link.source.iri;
      const targetIri = link.target.iri;

      if (link.source.iri === currentIri) {
        const targetNode = nodeMap.get(targetIri);
        if (targetNode) {
          const nodes = outLinkMap.get(link.linkDefinition.iri) || [];
          nodes.push(targetNode);
          outLinkMap.set(link.linkDefinition.iri, nodes);
        }
      } else if (link.target.iri === currentIri) {
        const sourceNode = nodeMap.get(sourceIri);
        if (sourceNode) {
          const nodes = inLinkMap.get(link.linkDefinition.iri) || [];
          nodes.push(sourceNode);
          inLinkMap.set(link.linkDefinition.iri, nodes);
        }
      }
    }


    const list: NeighborNodeList[] = [];
    for (const key of outLinkMap.keys()) {
      const link = linkMap.get(key);
      const nodes = outLinkMap.get(key);
      if (link && nodes) {
        list.push({
          id: key + 'out',
          link: link,
          nodes: nodes.sort(labelAlphaSort),
          isOutgoing: true
        });
      }
    }
    for (const key of inLinkMap.keys()) {
      const link = linkMap.get(key);
      const nodes = inLinkMap.get(key);
      if (link && nodes) {
        list.push({
          id: key + 'in',
          link: link,
          nodes: nodes.sort(labelAlphaSort),
          isOutgoing: false
        });
      }
    }
    return list;

  });
   */

  /**
   * Returns a list of outgoing nodes, sorted by link label.
   * If a link has no label, it is sorted to the end of the list.
   */

  /**
  outgoingNodeList = computed<NeighborNodeList[]>(() => {
    return this.nodeList()
      .filter(nodeList => nodeList.isOutgoing)
      .sort((a, b) => {
        const aLabel = a.link.label || '';
        const bLabel = b.link.label || '';
        if (!aLabel && bLabel) {
          return 1
        };
        if (aLabel && !bLabel) {
          return -1
        };
        return aLabel.localeCompare(bLabel);
      });
  });
 */
  /**
   * Returns a list of incoming nodes, sorted by link label.
   * If a link has no label, it is sorted to the end of the list.
   */

  /**  incomingNodeList = computed<NeighborNodeList[]>(() => {
    return this.nodeList().filter(nodeList => !nodeList.isOutgoing).sort((a, b) => {
      const aLabel = a.link.label || '';
      const bLabel = b.link.label || '';
      if (!aLabel && bLabel) {
        return 1
      };
      if (aLabel && !bLabel) {
        return -1
      };
      return aLabel.localeCompare(bLabel);
    });
  });
 */

  public emitNodeSelected(node: IUiGraphNode): void {
    this.nodeSelected.emit(node);
  }

}
