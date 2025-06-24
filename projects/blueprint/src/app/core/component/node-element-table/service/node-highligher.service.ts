import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NodeHighligherService {

  #_forcesHighlight = signal<string | undefined>(undefined);

  #hoveredIri = signal<string | undefined>(undefined);

  forcedHighlightIri = this.#_forcesHighlight.asReadonly();

  highlightedNodeIri = computed(() => {
    return this.#_forcesHighlight() ?? this.#hoveredIri();
  });

  setHoveredIri(nodeIiri: string | undefined): void {
    this.#hoveredIri.set(nodeIiri);
  }

  forceHighlight(nodeIri: string | undefined): void {
    this.#_forcesHighlight.set(nodeIri);
  }
}
