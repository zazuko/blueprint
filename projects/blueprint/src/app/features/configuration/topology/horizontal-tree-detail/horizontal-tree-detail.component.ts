import { Component, Input, OnChanges, SimpleChanges, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbPageComponent } from "../../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { Breadcrumb } from 'projects/blueprint/src/app/core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { HierarchyService } from '../service/hierarchy.service';
import { HierarchyNode } from '../service/model/hierarchy-node.model';
import { LoadingIndicatorService } from '../../../../core/component/loading-indicator/service/loading-indicator.service';
import { HierarchyDefinition } from '../service/model/hierarchy-definition.model';

@Component({
    templateUrl: './horizontal-tree-detail.component.html',
    styleUrl: './horizontal-tree-detail.component.scss',
    imports: [CommonModule, BreadcrumbPageComponent, OrganizationChartModule, TreeModule]
})
export class HorizontalTreeDetailComponent implements OnChanges {
  @Input({ required: true }) id: string = '';

  private readonly hierarchyService = inject(HierarchyService);
  private readonly loadingIndicator = inject(LoadingIndicatorService);

  public hierarchyDefinition = signal<HierarchyDefinition | null | undefined>(undefined);

  hierarchy = computed<TreeNode[]>(() => {
    if (this.hierarchyDefinition() === null || this.hierarchyDefinition() === undefined) {
      return [];
    }
    const rootNode = this.hierarchyDefinition()!.rootNode;
    if (rootNode === null || rootNode === undefined) {
      return [];
    }
    const uiTreeNode = {
      label: rootNode.label,
      expanded: true,
      data: rootNode,
      children: []
    };

    rootNode.children.forEach(child => {
      this.createChildUiNodeFromTopologyTreeNode(child, uiTreeNode);
    });

    return [uiTreeNode];
  });

  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '../../..',
      disabled: false
    },
    {
      label: 'Topology',
      route: '../..',
      disabled: false
    },
    {
      label: 'Detail',
      route: '.',
      disabled: false
    }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    const id = changes['id']?.currentValue;
    if (id) {
      this.loadingIndicator.loading();
      this.hierarchyService.getHierarchyByIri(id).subscribe((hierarchyDefinition) => {
        this.hierarchyDefinition.set(hierarchyDefinition);
        this.loadingIndicator.done();
      }
      );
    }
  }

  private createChildUiNodeFromTopologyTreeNode(childNode: HierarchyNode, parentUiNode: TreeNode<HierarchyNode>): TreeNode<HierarchyNode> {

    const childUiNode = {
      label: childNode.label,
      expanded: true,
      data: childNode,
      children: []
    };
    if (parentUiNode.children === undefined) {
      parentUiNode.children = [];
    }
    parentUiNode.children.push(childUiNode);
    childNode.children.forEach(child => {
      this.createChildUiNodeFromTopologyTreeNode(child, childUiNode);
    });
    return childUiNode;
  }

}
