import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, OnDestroy, output, viewChild } from '@angular/core';

import Graph from "graphology";
import { Sigma } from "sigma";
import { Subscription } from 'rxjs';
import { ThemeManager } from '../../../blueprint/layout/service/theme-manager/theme-manager.service';
import { IUConsolidatedLink, IUiGraphNode, Graph as BlueprintGraph } from '@blueprint/component/graph/model/graph.model';
import FA2LayoutSupervisor from "graphology-layout-forceatlas2/worker";

@Component({
  selector: 'bp-sigma-graph',
  imports: [],
  templateUrl: './sigma-graph.component.html',
  styleUrl: './sigma-graph.component.scss'
})
export class SigmaGraphComponent implements OnDestroy {
  readonly graph = input.required<BlueprintGraph>();
  readonly nodeSelected = output<IUiGraphNode>();

  readonly sigmaElement = viewChild<ElementRef>("container");
  #sigma: Sigma | undefined = undefined;
  #themeManager = inject(ThemeManager);
  #document = inject(DOCUMENT);
  #themeSubscription: Subscription | undefined;

  #expandNode: IUiGraphNode | undefined = undefined;

  #layoutSupervisor: FA2LayoutSupervisor | undefined;

  #nodeSet = new Set<string>();
  #linkSet = new Set<string>();

  #graph = new Graph();

  constructor() {
    console.log('sigma graph constructor');
    effect(() => {
      console.log('graph changed');
      const nodes = this.graph().nodes;
      const links = this.graph().links;

      let hasNewNodes = false;

      nodes.forEach(node => {
        if (!this.#nodeSet.has(node.id)) {
          this.#graph.addNode(node.id, {
            label: node.label,
            color: node.color,
            x: this.#expandNode?.x ?? Math.random() * 100,
            y: this.#expandNode?.y ?? Math.random() * 100,
            size: 10  // Increased from 10 for better visibility
          });
          this.#nodeSet.add(node.id);
          hasNewNodes = true;
        }
      });

      links.forEach(link => {
        if (!this.#linkSet.has(link.id)) {
          this.#graph.addEdge(link.source.id, link.target.id);
          this.#linkSet.add(link.id);
        }
      });

      // Start layout worker when new nodes are added
      if (hasNewNodes && this.#graph.order > 0) {
        // Kill existing supervisor if running
        if (this.#layoutSupervisor) {
          this.#layoutSupervisor.kill();
        }

        // Create new supervisor with settings
        this.#layoutSupervisor = new FA2LayoutSupervisor(this.#graph, {
          settings: {
            barnesHutOptimize: true,
            gravity: 1,
            scalingRatio: 10,
            slowDown: 5
          }
        });

        // Start the layout
        this.#layoutSupervisor.start();

        // Auto-stop after 2 seconds
        setTimeout(() => {
          if (this.#layoutSupervisor) {
            this.#layoutSupervisor.stop();
          }
        }, 2000);
      }

      this.#sigma?.refresh();

    });

    effect(() => {
      console.log('sigma init');
      if (this.sigmaElement()?.nativeElement) {
        if (this.#sigma === undefined) {
          console.log('%csigma new --- not goood', 'color: red');
          this.#sigma = new Sigma(this.#graph, this.sigmaElement()?.nativeElement, {
            renderLabels: true,
            labelColor: { color: this.#getLabelColor() },
            labelSize: 12,
            labelWeight: 'normal',
            defaultEdgeType: 'arrow',
            renderEdgeLabels: true,
          });
          this.#sigma.on('clickNode', ({ node }) => {
            const clickedNode = this.graph().nodes.find(n => n.id === node);
            if (clickedNode) {
              this.#expandNode = clickedNode;
              this.nodeSelected.emit(clickedNode);
            }
          });
        }

        this.#sigma.setSetting('labelColor', { color: this.#getLabelColor() });


        // Listen to theme changes and update label color
        /*
        this.#themeSubscription = this.#themeManager.themeChanged$.subscribe(() => {
          if (this.#sigma) {
            this.#sigma.setSetting('labelColor', { color: this.#getLabelColor() });
            this.#sigma.refresh();
          }
        });
        */
      }
    });
  }

  #getLabelColor(): string {
    const isDarkMode = this.#document.documentElement.classList.contains('bp-dark-mode');
    return isDarkMode ? '#ffffff' : '#000000';
  }

  ngOnDestroy(): void {
    this.#themeSubscription?.unsubscribe();
    if (this.#layoutSupervisor) {
      this.#layoutSupervisor.kill();
    }
    if (this.#sigma) {
      this.#sigma.kill();
    }
  }
}
