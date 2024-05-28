import { Component, DestroyRef, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { MermaidService } from '../service/mermaid/mermaid.service';

@Component({
  selector: 'bp-flowchart',
  standalone: true,
  imports: [],
  templateUrl: './flowchart.component.html',
  styleUrl: './flowchart.component.scss'
})
export class FlowchartComponent {
  private readonly mermaidElementRefSignal = viewChild<ElementRef>(`mermaid`);

  private readonly clickableElements = signal<NodeListOf<Element> | null>(null);

  private readonly _destroyRef = inject(DestroyRef);
  private readonly _mermaidService = inject(MermaidService);

  constructor() {

    effect(() => {
      const nodeElements = this.clickableElements();
      if (!nodeElements) {
        return;
      }
      const clickableElements = Array.from(nodeElements).filter((element) => element.getAttribute('data-id').startsWith('http://'));
      for (let i = 0; i < clickableElements.length; ++i) {
        clickableElements[i].addEventListener('click', (e) => {
          console.log('click', e);
        });
      }
    });

    effect(() => {
      const element = this.mermaidElementRefSignal().nativeElement;
      if (!element) {
        return;
      }

      const graphDefinition = `flowchart TD
      http://someir/a[Christmas] -->|Get money| http://someir/b(Go shopping)
      http://someir/b --> C{Let me think}
      C -->|One| D[Laptop]
      C -->|Two| E[iPhone]
      C -->|Three| F[fa:fa-car Car]
           `;
      //       click A call mermaidFunction("http://someir/abc", "${this.mermaidComponentId}")

      this._mermaidService.render(1, graphDefinition, element, '.node', this.clickableElements);



    });
  }

}