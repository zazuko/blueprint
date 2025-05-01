import { Component, OnChanges, Signal, SimpleChanges, computed, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOut } from '@blueprint/animation/fade-in-out/fade-in-out';
import { Graph, IUiGraphNode, RdfUiGraphNode } from '../graph/model/graph.model';
import { ColorUtil } from '../../utils/color-util';
import { HierarchyCardComponent } from '../../../features/inventory/inventory/hierarchy-card/hierarchy-card.component';



@Component({
  selector: 'bp-neighbor-nodes',
  imports: [
    CommonModule,
    HierarchyCardComponent
  ],
  templateUrl: './neighbor-nodes.component.html',
  styleUrl: './neighbor-nodes.component.scss',
  animations: [
    fadeInOut
  ]
})
export class NeighborNodesComponent {
  readonly graph = input.required<Graph>();
  readonly subject = input.required<string>();

  nodeSelected = output<IUiGraphNode>();


  public colorUtil = ColorUtil;
  public Number = Number;

  currentNode: Signal<IUiGraphNode | null> = computed(() => {
    return this.graph().nodes.find(node => node.iri === this.subject()) ?? null;
  });

  nodeMap: Signal<Map<string, IUiGraphNode[]>> = computed(() => {
    const graph = this.graph();
    const subject = this.subject();
    if (graph === null) {
      return new Map<string, IUiGraphNode[]>();
    }

    return this.#buildNodeMap(subject, graph);
  });



  keys: Signal<string[]> = computed(() => {
    const keys = Array.from(this.nodeMap().keys());
    return keys;
  });


  #buildNodeMap(subject: string, graph: Graph): Map<string, IUiGraphNode[]> {

    const subjectIsSourceLinks = graph.links.filter(link => link.source.iri === subject);
    const subjectIsTargetLinks = graph.links.filter(link => link.target.iri === subject);

    const nodeMap = new Map<string, IUiGraphNode[]>();

    subjectIsSourceLinks.forEach(link => {
      const nodes = nodeMap.get(link.target.classLabel[0]) || [];
      // if node already exists in the array, do not push it again
      if (nodes.find(node => node.iri === link.target.iri)) {
        return;
      }
      const graphNode = link.target;

      nodes.push(graphNode);
      nodeMap.set(link.target.classLabel[0], nodes);
    }
    );

    subjectIsTargetLinks.forEach(link => {
      const nodes = nodeMap.get(link.source.classLabel[0]) || [];
      // if node already exists in the array, do not push it again
      if (nodes.find(node => node.iri === link.source.iri)) {
        return;
      }
      const graphNode = link.source;

      nodes.push(graphNode);
      nodeMap.set(link.source.classLabel[0], nodes);
    });

    console.log('nodeMap', nodeMap);
    return nodeMap;
  }

  public emitNodeSelected(node: IUiGraphNode): void {
    this.nodeSelected.emit(node);
  }
}
