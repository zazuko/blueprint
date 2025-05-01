import { Component, Input, output, input } from '@angular/core';
import { NgClass } from '@angular/common';

import { IUiGraphNode } from '../../model/graph.model';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[bp-node]',
  templateUrl: './node.component.svg',
  styleUrls: ['./node.component.scss'],
  imports: [NgClass]
})
export class NodeComponent {
  // inputs
  readonly node = input.required<IUiGraphNode>();
  readonly isSelected = input.required<boolean>();
  readonly color = input.required<string>();
  readonly disableMenu = input<boolean>(true);

  // outputs
  nodeSelected = output<IUiGraphNode>();
  nodeExpanded = output<IUiGraphNode>();
  nodeFocused = output<IUiGraphNode>();


  // constants
  readonly nodeRadius = 50;
  readonly menuCircleRadius = 15;


  emitNodeSelected(event: Event) {
    event.stopPropagation();
    this.nodeSelected.emit(this.node());
  }

  emitNodeExpanded(event: Event): void {
    event.stopPropagation();
    this.nodeExpanded.emit(this.node());
  }

  emitNodeFocused(event: Event): void {
    event.stopPropagation();
    this.nodeFocused.emit(this.node());
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
