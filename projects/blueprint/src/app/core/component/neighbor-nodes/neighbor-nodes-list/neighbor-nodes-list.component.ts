import {
  Component,
  computed,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IUiGraphNode } from '@blueprint/component/graph/model/graph.model';
import { HierarchyCardComponent } from '../../../../features/inventory/inventory/hierarchy-card/hierarchy-card.component';
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import { ExploredResource } from 'projects/blueprint/src/app/features/explore/model/explored-resource.class';
import {
  AvatarComponent,
  Avatar,
} from '../../../../shared/component/ui/avatar/avatar.component';
import { PredicateTBox } from '../../../rdf/semantics/predicate-t-box';
import { RdfPrefixPipe } from '../../../rdf/prefix/rdf-prefix.pipe';

const SHOW_FILTER_IF_MORE_THAN = 10;

@Component({
  selector: 'bp-neighbor-nodes-list',
  imports: [
    HierarchyCardComponent,
    FormsModule,
    MatTooltipModule,
    AvatarComponent,
    MatButtonModule,
    RdfPrefixPipe,
  ],
  templateUrl: './neighbor-nodes-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './neighbor-nodes-list.component.scss',
})
export class NeighborNodesListComponent {
  nodeList = input.required<NeighborNodeList>();
  exploredResource = input.required<ExploredResource>();
  showPreviewButton = input<boolean>(false);

  nodeSelected = output<IUiGraphNode>();
  moreInformation = output<IUiGraphNode>();

  tBox = computed<PredicateTBox | undefined>(() => {
    return this.nodeList().link.predicateTbox;
  });

  showTbox = signal<boolean>(false);

  filterTerm = signal<string>('');

  showFilter = computed(() => {
    const nodes = this.nodeList().nodes;
    return nodes.length > SHOW_FILTER_IF_MORE_THAN;
  });

  targetAvatars = computed(() => {
    const avatarSet = new Set<Avatar>(
      this.nodeList().nodes.flatMap((node) => node.avatars)
    );
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

  toggleShowTBox(): void {
    this.showTbox.update((current) => !current);
  }
}

export interface NeighborNodeList {
  link: UiLinkDefinition;
  nodes: IUiGraphNode[];
  isOutgoing: boolean;
  id: string;
}
