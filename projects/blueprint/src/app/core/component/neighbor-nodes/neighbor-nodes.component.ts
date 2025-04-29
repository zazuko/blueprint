import { Component, OnChanges, Signal, SimpleChanges, computed, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOut } from '@blueprint/animation/fade-in-out/fade-in-out';
import { Graph } from '../graph/model/graph.model';
import { GraphNode } from '../../../features/explore/service';
import { ColorUtil } from '../../utils/color-util';



@Component({
  selector: 'bp-neighbor-nodes',
  imports: [CommonModule],
  templateUrl: './neighbor-nodes.component.html',
  styleUrl: './neighbor-nodes.component.scss',
  animations: [
    fadeInOut
  ]
})
export class NeighborNodesComponent {

  readonly graph = input.required<Graph>();
  readonly subject = input.required<string>();

  nodeSelected = output<GraphNode>();


  public colorUtil = ColorUtil;
  public Number = Number;

  // subjectSignal = signal<string>('');
  //  graphSignal = signal<Graph>(null);

  currentNode: Signal<GraphNode | null> = computed(() => {
    return this.graph().nodes.find(node => node.id === this.subject()) ?? null;
  });

  nodeMap: Signal<Map<string, GraphNode[]>> = computed(() => {
    const graph = this.graph();
    const subject = this.subject();
    if (graph === null) {
      return new Map<string, GraphNode[]>();
    }

    return this.#buildNodeMap(subject, graph);
  });



  keys: Signal<string[]> = computed(() => {
    const keys = Array.from(this.nodeMap().keys());
    return keys;
  });


  #buildNodeMap(subject: string, graph: Graph): Map<string, GraphNode[]> {

    const subjectIsSourceLinks = graph.links.filter(link => link.source.id === subject);
    const subjectIsTargetLinks = graph.links.filter(link => link.target.id === subject);

    const nodeMap = new Map<string, GraphNode[]>();

    subjectIsSourceLinks.forEach(link => {
      const nodes = nodeMap.get(link.target.type) || [];
      // if node already exists in the array, do not push it again
      if (nodes.find(node => node.id === link.target.id)) {
        return;
      }
      nodes.push(link.target);
      nodeMap.set(link.target.type, nodes);
    }
    );

    subjectIsTargetLinks.forEach(link => {
      const nodes = nodeMap.get(link.source.type) || [];
      // if node already exists in the array, do not push it again
      if (nodes.find(node => node.id === link.source.id)) {
        return;
      }
      nodes.push(link.source);
      nodeMap.set(link.source.type, nodes);
    });

    console.log('nodeMap', nodeMap);
    return nodeMap;
  }

  public emitNodeSelected(node: GraphNode): void {
    this.nodeSelected.emit(node);
  }
}
