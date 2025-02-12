import { Component, input, output } from '@angular/core';

import { TooltipModule } from 'primeng/tooltip';

import { ArchimateApplication, ArchimateDataFlow } from './model/archimate-data-flow';


@Component({
    selector: 'bp-archi-diagram',
    imports: [TooltipModule],
    templateUrl: './archi-diagram.component.html',
    styleUrl: './archi-diagram.component.scss'
})
export class ArchiDiagramComponent {
  incomingFlows = input.required<ArchimateDataFlow[]>();
  center = input.required<ArchimateApplication[]>();
  outgoingFlows = input.required<ArchimateDataFlow[]>();

  nodeSelected = output<string>();

  emitNodeSelected(iri: string) {
    this.nodeSelected.emit(iri);
  }
}

