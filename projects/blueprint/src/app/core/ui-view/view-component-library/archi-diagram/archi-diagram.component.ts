import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';

import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ArchimateApplication,
  ArchimateDataFlow,
} from './model/archimate-data-flow';

@Component({
  selector: 'bp-archi-diagram',
  imports: [MatTooltipModule],
  templateUrl: './archi-diagram.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './archi-diagram.component.scss',
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
