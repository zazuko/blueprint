import { DOCUMENT } from '@angular/common';
import { Component, effect, ElementRef, inject, input, OnDestroy, viewChild } from '@angular/core';

import Graph from "graphology";
import { Sigma } from "sigma";
import { Subscription } from 'rxjs';
import { ThemeManager } from '../../../blueprint/layout/service/theme-manager/theme-manager.service';

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
  #themeManager = inject(ThemeManager);
  #document = inject(DOCUMENT);
  #themeSubscription: Subscription | undefined;

  constructor() {
    effect(() => {
      if (this.sigmaElement()?.nativeElement) {
        this.#sigma = new Sigma(this.graph(), this.sigmaElement()?.nativeElement, {
          renderLabels: true,
          labelColor: { color: this.#getLabelColor() },
          labelSize: 12,
          labelWeight: 'normal',
        });

        // Listen to theme changes and update label color
        this.#themeSubscription = this.#themeManager.themeChanged$.subscribe(() => {
          if (this.#sigma) {
            this.#sigma.setSetting('labelColor', { color: this.#getLabelColor() });
            this.#sigma.refresh();
          }
        });
      }
    });
  }

  #getLabelColor(): string {
    const isDarkMode = this.#document.documentElement.classList.contains('bp-dark-mode');
    return isDarkMode ? '#ffffff' : '#000000';
  }

  ngOnDestroy(): void {
    this.#themeSubscription?.unsubscribe();
    if (this.#sigma) {
      this.#sigma.kill();
    }
  }
}
