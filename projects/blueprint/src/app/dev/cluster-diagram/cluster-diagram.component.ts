import { Component, OnChanges, SimpleChanges, signal, computed, output, input } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';

import { NodeElement } from '../../core/model/node-element/node-element.class';
import { NgStyle } from '@angular/common';
import { AvatarComponent } from 'projects/blueprint/src/app/shared/component/ui/avatar/avatar.component';

@Component({
  selector: 'bp-cluster-diagram',
  imports: [AvatarComponent, PanelModule, TooltipModule],
  templateUrl: './cluster-diagram.component.html',
  styleUrl: './cluster-diagram.component.scss'
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
    const leaves = this.treeNodeSignal().children?.filter(node => !node.children || node.children.length === 0) ?? [];
    return leaves;
  });

  nodeSignal = computed(() => {
    if (this.treeNodeSignal() === null) {
      return [];
    }
    const nodes = this.treeNodeSignal().children?.filter(node => node.children && node.children.length > 0) ?? [];
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
