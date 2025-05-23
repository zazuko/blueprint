import { Injectable, signal } from '@angular/core';

/**
 * Service to manage the selection of nodes in the graph.
 */
@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  #internalSelectedNode = signal<string | undefined>(undefined);

  /**
   * A signal containing the currently selected node IRI or undefined if no node is selected.
   */
  readonly selectedNodeIriSignal = this.#internalSelectedNode.asReadonly();

  /**
   * Select a node by its IRI.
   * @param iri The IRI of the node to select.
   */
  setSelectedNode(iri: string) {
    this.#internalSelectedNode.set(iri);
  }

  /**
   * Clear the current selected node
   * @returns An observable that emits the currently selected node IRI.
   */
  clearSelection() {
    this.#internalSelectedNode.set(undefined);
  }
}
