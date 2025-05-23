import { Component, WritableSignal, inject, signal } from '@angular/core';
import { SkosConcept } from './model/skos.model';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { CategoryService } from './service/category.service';
import { CategoryTreeNodeComponent } from './category-tree-node/category-tree-node.component';
import { Breadcrumb } from '../../../shared/component/breadcrumb-navigation/model/breadcrumb.model';
import { BreadcrumbPageComponent } from '../../../shared/component/page/breadcrumb-page/breadcrumb-page.component';

@Component({
  selector: 'bp-category-configurator',
  imports: [BreadcrumbPageComponent, TreeModule, CategoryTreeNodeComponent],
  templateUrl: './category-configurator.component.html',
  styleUrl: './category-configurator.component.scss'
})
export class CategoryConfiguratorComponent {
  private readonly _categoryService = inject(CategoryService);
  public readonly breadcrumbs: Breadcrumb[] = [
    {
      label: 'Settings',
      route: '..',
      disabled: false
    },
    {
      label: 'Category',
      route: '.',
      disabled: false
    }
  ];


  public readonly treeSignal: WritableSignal<TreeNode<SkosConcept>[]>;


  constructor() {
    const topConcept = this._categoryService.topConcepts.pop() || null;
    if (topConcept === null) {
      return;
    }

    console.log('top Concept prefLabel', topConcept.prefLabel);
    console.log('top Concept altLabel', topConcept.altLabel);
    console.log('top Concept definition', topConcept.definition);
    console.log('top Concept, concept scheme ', topConcept.topConceptOf.map((scheme) => scheme.prefLabel));





    const nodes = this._categoryService.getNodes();
    console.log('nodes', nodes);
    this.treeSignal = signal(nodes);
  }
}
