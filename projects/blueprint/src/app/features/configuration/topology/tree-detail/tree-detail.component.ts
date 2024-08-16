import { Component, Input, OnChanges, SimpleChanges, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbPageComponent } from "../../../../core/page/breadcrumb-page/breadcrumb-page.component";
import { Breadcrumb } from '../../../../core/layout/breadcrumb-navigation/model/breadcrumb.model';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import { HierarchyService } from '../service/hierarchy.service';
import { HierarchyNode } from '../service/model/hierarchy-node.model';
import { LoadingIndicatorService } from '../../../../core/component/loading-indicator/service/loading-indicator.service';
import { HierarchyDefinition } from '../service/model/hierarchy-definition.model';

@Component({
  standalone: true,
  templateUrl: './tree-detail.component.html',
  styleUrl: './tree-detail.component.scss',
  imports: [CommonModule, BreadcrumbPageComponent, OrganizationChartModule]
})
export class TreeDetailComponent implements OnChanges {
  @Input({ required: true }) id: string = '';

  readonly #hierarchyService = inject(HierarchyService);
  readonly #loadingIndicator = inject(LoadingIndicatorService);

  hierarchyDefinition = signal<HierarchyDefinition | null | undefined>(undefined);

  hierarchy = computed<TreeNode[]>(() => {
    const hierarchyDefinition = this.hierarchyDefinition();
    if (!hierarchyDefinition) {
      return [];
    }
    const rootNode = hierarchyDefinition.rootNode;
    if (!rootNode) {
      return [];
    }

    const uiTreeNode = {
      label: rootNode.label,
      expanded: true,
      data: rootNode,
      children: []
    };

    rootNode.children.forEach(child => {
      this.createChildUiNodeFromTopologyTreeNode(child, uiTreeNode, [rootNode.iri]);
    });

    console.log(uiTreeNode);

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
      this.#loadingIndicator.loading();
      this.#hierarchyService.getHierarchyDefinitionByIri(id).subscribe((hierarchyDefinition) => {
        this.hierarchyDefinition.set(hierarchyDefinition);
        this.#loadingIndicator.done();
      }
      );
    }
  }

  private createChildUiNodeFromTopologyTreeNode(childNode: HierarchyNode, parentUiNode: TreeNode<HierarchyNode>, nodeShapeIris: string[]): TreeNode<HierarchyNode> {

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
    if (nodeShapeIris.includes(childNode.iri)) {
      childUiNode.label = `${childUiNode.label} (circular reference)`;
      return childUiNode;
    }
    nodeShapeIris.push(childNode.iri);
    childNode.children.forEach(child => {
      this.createChildUiNodeFromTopologyTreeNode(child, childUiNode, nodeShapeIris);
    });
    return childUiNode;
  }

}
