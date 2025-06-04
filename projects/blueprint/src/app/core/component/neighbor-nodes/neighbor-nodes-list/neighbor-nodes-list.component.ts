import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { IUiGraphNode } from '@blueprint/component/graph/model/graph.model';
import { HierarchyCardComponent } from "../../../../features/inventory/inventory/hierarchy-card/hierarchy-card.component";
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import { Tooltip } from 'primeng/tooltip';
import { ExploredResource } from 'projects/blueprint/src/app/features/explore/model/explored-resource.class';
import { AvatarComponent, Avatar } from "../../../../shared/component/avatar/avatar.component";

const SHOW_FILTER_IF_MORE_THAN = 10;

@Component({
  selector: 'bp-neighbor-nodes-list',
  imports: [
    HierarchyCardComponent,
    InputIcon,
    IconField,
    InputTextModule,
    FormsModule,
    Tooltip,
    AvatarComponent,
    ButtonModule
  ],
  templateUrl: './neighbor-nodes-list.component.html',
  styleUrl: './neighbor-nodes-list.component.scss'
})
export class NeighborNodesListComponent {
  nodeList = input.required<NeighborNodeList>();
  exploredResource = input.required<ExploredResource>();
  showPreviewButton = input<boolean>(false);

  nodeSelected = output<IUiGraphNode>();
  moreInformation = output<IUiGraphNode>();




  filterTerm = signal<string>('');

  showFilter = computed(() => {
    const nodes = this.nodeList().nodes;
    return nodes.length > SHOW_FILTER_IF_MORE_THAN;
  });

  targetAvatars = computed(() => {
    const avatarSet = new Set<Avatar>(this.nodeList().nodes.flatMap(node => node.avatars));
    return Array.from(avatarSet);
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
  id: string;

}