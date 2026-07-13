import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NodeElement } from '../../../model/node-element/node-element.class';
import { TreeNode, TreeNodeSelectEvent } from '@blueprint/model/tree-node.model';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AvatarComponent } from 'projects/blueprint/src/app/shared/component/ui/avatar/avatar.component';

@Component({
  selector: 'bp-tree-view',
  imports: [NgTemplateOutlet, MatButtonModule, AvatarComponent],
  templateUrl: './tree-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tree-view.component.scss',
})
export class TreeViewComponent {
  data = input.required<TreeNode<NodeElement>[]>();
  label = input<string>('');

  nodeSelected = output<string>();

  emitNodeSelected(event: TreeNodeSelectEvent) {
    this.nodeSelected.emit(event.node.data.iri);
  }
}
