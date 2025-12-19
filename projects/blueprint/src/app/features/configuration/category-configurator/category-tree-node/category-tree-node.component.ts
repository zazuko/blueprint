import { Component, input } from '@angular/core';

import { SkosConcept } from '../model/skos.model';

@Component({
    selector: 'bp-category-tree-node',
    imports: [],
    templateUrl: './category-tree-node.component.html',
    styleUrl: './category-tree-node.component.scss'
})
export class CategoryTreeNodeComponent {
  readonly concept = input.required<SkosConcept>();
}
