import { Component, Input, output, input } from '@angular/core';

import { GraphNode } from '../../model/graph-node.model';
import { NgClass } from '@angular/common';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'g[bp-node]',
    templateUrl: './node.component.svg',
    styleUrls: ['./node.component.scss'],
    imports: [NgClass]
})
export class NodeComponent {
  @Input({ required: true }) node: GraphNode;
  @Input({ required: true }) isSelected: boolean;
  @Input({ required: true }) color: string;
  @Input() backgroundColor: string;
  disableMenu = input<boolean>(true);



  nodeSelected = output<GraphNode>();
  nodeExpanded = output<GraphNode>();
  nodeFocused = output<GraphNode>();

  readonly nodeRadius = 50;
  readonly menuCircleRadius = 15;

  emitNodeSelected(event: Event) {
    event.stopPropagation();
    this.nodeSelected.emit(this.node);
  }

  emitNodeExpanded(event: Event): void {
    event.stopPropagation();
    this.nodeExpanded.emit(this.node);
  }

  emitNodeFocused(event: Event): void {
    event.stopPropagation();
    this.nodeFocused.emit(this.node);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
