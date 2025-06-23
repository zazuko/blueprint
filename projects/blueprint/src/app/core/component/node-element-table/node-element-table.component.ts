import { Component, computed, effect, input, output } from '@angular/core';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';
import { AvatarComponent } from "../../../shared/component/ui/avatar/avatar.component";
import { ConfigurationCardComponent } from '../configuration-card/configuration-card.component';
import { HierarchyCardComponent } from '../../../features/inventory/inventory/hierarchy-card/hierarchy-card.component';

@Component({
  selector: 'bp-node-element-table',
  imports: [HierarchyCardComponent],
  templateUrl: './node-element-table.component.html',
  styleUrl: './node-element-table.component.scss'
})
export class NodeElementTableComponent {
  nodeElements = input.required<NodeElement[]>();

  nodeSelect = output<NodeElement>();

  tableColumns = computed<TableColumn[]>(() => {
    if (this.nodeElements().length === 0) {
    }
    return [];

  });


  emitNodeSelected(node: NodeElement): void {
    this.nodeSelect.emit(node);
  }
}

interface TableColumn {
  field: string;
  header: string;
}