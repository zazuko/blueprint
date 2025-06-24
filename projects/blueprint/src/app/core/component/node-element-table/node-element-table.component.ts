import { Component, computed, inject, input, OnDestroy, output } from '@angular/core';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';

import { ButtonModule } from 'primeng/button';


import { HierarchyCardComponent } from '../../../features/inventory/inventory/hierarchy-card/hierarchy-card.component';
import { NodeHighligherService } from './service/node-highligher.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'bp-node-element-table',
  imports: [HierarchyCardComponent, NgClass, ButtonModule],
  templateUrl: './node-element-table.component.html',
  styleUrl: './node-element-table.component.scss'
})
export class NodeElementTableComponent {

  nodeElements = input.required<NodeElement[]>();

  nodeSelect = output<NodeElement>();
  #highlighterService = inject(NodeHighligherService);
  highlightedIri = this.#highlighterService.highlightedNodeIri
  forcedHighlightIri = this.#highlighterService.forcedHighlightIri;

  tableColumns = computed<TableColumn[]>(() => {
    if (this.nodeElements().length === 0) {
    }
    return [];

  });

  emitNodeSelected(node: NodeElement): void {
    this.nodeSelect.emit(node);
  }

  setHoveredIri(iri?: string | undefined): void {
    this.#highlighterService.setHoveredIri(iri);
  }

  forceHighlight(iri?: string | undefined): void {
    console.log('force highlight', iri);
    if (this.forcedHighlightIri() === iri) {
      this.#highlighterService.forceHighlight(undefined);
      return;
    }
    this.#highlighterService.forceHighlight(iri);
  }

}

interface TableColumn {
  field: string;
  header: string;
}