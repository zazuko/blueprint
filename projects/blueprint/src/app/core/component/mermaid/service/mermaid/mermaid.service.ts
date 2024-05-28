import { Injectable, WritableSignal } from '@angular/core';

import mermaid from 'mermaid';
import { MermaidConfig } from 'mermaid';
import { from } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MermaidService {
  private mermaidConfig: MermaidConfig = {
    theme: 'default',
    startOnLoad: true,
    flowchart: {
      useMaxWidth: true
    },
    securityLevel: 'loose',
  };



  constructor() {
    mermaid.initialize(this.mermaidConfig);
  }

  render(mermaidComponentId: number, mermaidCode: string, element: HTMLElement, selector: string, clickableElementsSignal: WritableSignal<NodeListOf<Element>>) {
    // `mermaidComponent${mermaidComponentId}`
    from(mermaid.render("a" + mermaidComponentId, mermaidCode, element)).subscribe({
      next: (result) => {
        element.innerHTML = result.svg;
        if (result.bindFunctions) {
          result.bindFunctions(element);
        }
        const clickableElements = element.querySelectorAll(selector);

        clickableElementsSignal.set(clickableElements);
      },
      error: (error) => {
        console.error('mermaid render error', error);
      }
    });

  }

}
