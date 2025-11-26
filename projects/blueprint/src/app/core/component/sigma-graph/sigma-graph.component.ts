import { Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';

import Graph from "graphology";
import { Sigma } from "sigma";

@Component({
  selector: 'bp-sigma-graph',
  imports: [],
  templateUrl: './sigma-graph.component.html',
  styleUrl: './sigma-graph.component.scss'
})
export class SigmaGraphComponent implements OnDestroy {
  readonly graph = input(new Graph());

  readonly sigmaElement = viewChild<ElementRef>("container");
  #sigma: Sigma | undefined = undefined;

  constructor() {
    effect(() => {
      if (this.sigmaElement()?.nativeElement)
        this.#sigma = new Sigma(this.graph(), this.sigmaElement()?.nativeElement);
    });
  }

  ngOnDestroy(): void {
    if (this.#sigma) {
      this.#sigma.kill();
    }
  }
}
