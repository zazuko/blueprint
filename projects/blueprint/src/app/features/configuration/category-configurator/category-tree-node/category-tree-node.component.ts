import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkosConcept } from '../model/skos.model';

@Component({
  selector: 'bp-category-tree-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-tree-node.component.html',
  styleUrl: './category-tree-node.component.scss'
})
export class CategoryTreeNodeComponent {
  @Input({ required: true }) concept: SkosConcept;
}
