import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { IUiGraphNode } from '@blueprint/component/graph/model/graph.model';
import { HierarchyCardComponent } from "../../../../features/inventory/inventory/hierarchy-card/hierarchy-card.component";
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';

const SHOW_FILTER_IF_MORE_THAN = 10;

@Component({
  selector: 'bp-neighbor-nodes-list',
  imports: [HierarchyCardComponent, InputIcon, IconField, InputTextModule, FormsModule],
  templateUrl: './neighbor-nodes-list.component.html',
  styleUrl: './neighbor-nodes-list.component.scss'
})
export class NeighborNodesListComponent {
  nodeList = input.required<NeighborNodeList>();
  nodeSelected = output<IUiGraphNode>();

  filterTerm = signal<string>('');

  showFilter = computed(() => {
    const nodes = this.nodeList().nodes;
    return nodes.length > SHOW_FILTER_IF_MORE_THAN;
  });

  filteredNodes = computed(() => {
    const nodes = this.nodeList().nodes;
    const showFilter = this.showFilter();
    if (!showFilter) {
      return nodes;
    }

    const filterTerm = this.filterTerm();
    if (filterTerm.length > 0) {
      return nodes.filter((node) => {
        const label = node.label;
        if (label) {
          try {
            const regex = new RegExp(filterTerm, 'i');
            return regex.test(label);
          } catch {
            // If invalid regex, fallback to simple substring match
            return label.toLowerCase().includes(filterTerm.toLowerCase());
          }
        }
        return false;
      });
    }

    return nodes;
  });

  setFilterTerm(inputEvet: Event): void {
    const value = (inputEvet.target as HTMLInputElement).value;
    console.log('setFilterTerm', value);
    this.filterTerm.set(value);
  }
  public emitNodeSelected(node: IUiGraphNode): void {
    this.nodeSelected.emit(node);
  }
}


export interface NeighborNodeList {
  link: UiLinkDefinition;
  nodes: IUiGraphNode[];
  isOutgoing: boolean;


}