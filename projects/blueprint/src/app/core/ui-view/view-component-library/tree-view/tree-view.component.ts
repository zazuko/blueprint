import { Component, input, output } from '@angular/core';
import { NodeElement } from '../../../model/node-element/node-element.class';
import { TreeNode } from 'primeng/api';
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree';
import { AvatarComponent } from '@blueprint/component/avatar/avatar.component';

@Component({
    selector: 'bp-tree-view',
    imports: [TreeModule, AvatarComponent],
    templateUrl: './tree-view.component.html',
    styleUrl: './tree-view.component.scss'
})
export class TreeViewComponent {
  data = input.required<TreeNode<NodeElement>[]>();
  label = input<string>('');

  nodeSelected = output<string>();


  emitNodeSelected(event: TreeNodeSelectEvent) {
    this.nodeSelected.emit(event.node.data.iri);
  }
}
