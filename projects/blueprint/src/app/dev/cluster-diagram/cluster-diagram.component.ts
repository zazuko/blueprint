import {
  Component,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  output,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TreeNode } from '../../core/model/tree-node.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NodeElement } from '../../core/model/node-element/node-element.class';
import { NgStyle } from '@angular/common';
import { AvatarComponent } from 'projects/blueprint/src/app/shared/component/ui/avatar/avatar.component';

@Component({
  selector: 'bp-cluster-diagram',
  imports: [AvatarComponent, MatExpansionModule, MatTooltipModule],
  templateUrl: './cluster-diagram.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cluster-diagram.component.scss',
})
export class ClusterDiagramComponent implements OnChanges {
  readonly data = input.required<TreeNode<NodeElement> | null>();
  readonly collapsed = input(true);
  nodeSelected = output<string>();

  treeNodeSignal = signal<TreeNode<NodeElement> | null>(null);
  isCollapsedSignal = signal<boolean>(false);
  isExpanded = computed(() => {
    return !this.isCollapsedSignal();
  });

  leaveSignal = computed(() => {
    if (this.treeNodeSignal() === null) {
      return [];
    }
    const leaves =
      this.treeNodeSignal().children?.filter(
        (node) => !node.children || node.children.length === 0
      ) ?? [];
    return leaves;
  });

  nodeSignal = computed(() => {
    if (this.treeNodeSignal() === null) {
      return [];
    }
    const nodes =
      this.treeNodeSignal().children?.filter(
        (node) => node.children && node.children.length > 0
      ) ?? [];
    return nodes;
  });

  public emitNodeSelected(iri: string): void {
    this.nodeSelected.emit(iri);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const data = changes['data']?.currentValue;
    if (data) {
      this.treeNodeSignal.set(data);
    }
  }

  onCollapsedChange(isCollapsed: boolean) {
    this.treeNodeSignal().expanded = !isCollapsed;
    this.isCollapsedSignal.set(isCollapsed);
  }
}
