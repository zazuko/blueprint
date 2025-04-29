import { Component, OnChanges, Signal, SimpleChanges, computed, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOut } from '@blueprint/animation/fade-in-out/fade-in-out';
import { Graph } from '../graph/model/graph.model';
import { GraphNode } from '../../../features/explore/service';
import { ColorUtil } from '../../utils/color-util';
import { HierarchyCardComponent } from '../../../features/inventory/inventory/hierarchy-card/hierarchy-card.component';
import { INodeElement, NodeElement } from '@blueprint/model/node-element/node-element.class';



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

  nodeSelected = output<INodeElement>();


  public colorUtil = ColorUtil;
  public Number = Number;

  // subjectSignal = signal<string>('');
  //  graphSignal = signal<Graph>(null);

  currentNode: Signal<GraphNode | null> = computed(() => {
    return this.graph().nodes.find(node => node.id === this.subject()) ?? null;
  });

  nodeMap: Signal<Map<string, INodeElement[]>> = computed(() => {
    const graph = this.graph();
    const subject = this.subject();
    if (graph === null) {
      return new Map<string, NodeElement[]>();
    }

    return this.#buildNodeMap(subject, graph);
  });



  keys: Signal<string[]> = computed(() => {
    const keys = Array.from(this.nodeMap().keys());
    return keys;
  });


  #buildNodeMap(subject: string, graph: Graph): Map<string, INodeElement[]> {

    const subjectIsSourceLinks = graph.links.filter(link => link.source.id === subject);
    const subjectIsTargetLinks = graph.links.filter(link => link.target.id === subject);

    const nodeMap = new Map<string, INodeElement[]>();

    subjectIsSourceLinks.forEach(link => {
      const nodes = nodeMap.get(link.target.type) || [];
      // if node already exists in the array, do not push it again
      if (nodes.find(node => node.iri === link.target.id)) {
        return;
      }
      const graphNode = link.target;
      const node: INodeElement = {
        label: graphNode.label,
        iri: graphNode.id,
        classLabel: [graphNode.type],
        color: graphNode.colorIndex,
        avatars: [{ icon: graphNode.icon, label: graphNode.label, color: ColorUtil.getColorForIndexString(graphNode.colorIndex) }],
        description: '',
      };
      nodes.push(node);
      nodeMap.set(link.target.type, nodes);
    }
    );

    subjectIsTargetLinks.forEach(link => {
      const nodes = nodeMap.get(link.source.type) || [];
      // if node already exists in the array, do not push it again
      if (nodes.find(node => node.iri === link.source.id)) {
        return;
      }
      const graphNode = link.source;
      const node: INodeElement = {
        label: graphNode.label,
        iri: graphNode.id,
        classLabel: [graphNode.type],
        color: graphNode.colorIndex,
        avatars: [{ icon: graphNode.icon, label: graphNode.label, color: ColorUtil.getColorForIndexString(graphNode.colorIndex) }],
        description: '',
      };
      nodes.push(node);
      nodeMap.set(link.source.type, nodes);
    });

    console.log('nodeMap', nodeMap);
    return nodeMap;
  }

  public emitNodeSelected(node: INodeElement): void {
    this.nodeSelected.emit(node);
  }
}
