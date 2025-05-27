import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsolidatedLink } from '../../model/graph.model';
import { lab } from 'd3';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[bp-arrow]',
  templateUrl: './arrow.component.svg',
  styleUrls: ['./arrow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ArrowComponent {
  // inputs
  x1 = input.required<number>();
  x2 = input.required<number>();
  y1 = input.required<number>();
  y2 = input.required<number>();
  link = input.required<ConsolidatedLink>();

  linkSelected = output<ConsolidatedLink>();

  isSourceAndTargetSame = computed(() => {
    const link = this.link();
    return link.source.iri === link.target.iri;
  });

  calculateLinkLabelTransform = computed<string>(() => {
    const x1 = this.x1();
    const x2 = this.x2();
    const y1 = this.y1();
    const y2 = this.y2();

    const rotation = x1 >= x2 ? 180 + (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
      : (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    return `translate(${0.5 * (x2 + x1)},${0.5 * (y2 + y1)}) rotate(${rotation})`;
  });


  calculateLoopLinkLabelTransform = computed<string>(() => {
    const x1 = this.x1();
    const y1 = this.y1();
    const rotation = -45;
    return `translate(${x1},${y1}) rotate(${rotation})`;
  });

  incomingLabels = computed(() => {
    const link = this.link();
    const labels = link.incomingLabels;
    return labels;

  });
  outgoingLabels = computed(() => {
    const link = this.link();
    const labels = link.outgoingLabels;
    return labels;
  });

  emitLinkSelected(event: Event): void {
    event.stopPropagation();
    const link = this.link();
    this.linkSelected.emit(link);
  }
}
