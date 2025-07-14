import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IUConsolidatedLink } from '../../model/graph.model';

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
  readonly x1 = input.required<number>();
  readonly x2 = input.required<number>();
  readonly y1 = input.required<number>();
  readonly y2 = input.required<number>();
  readonly link = input.required<IUConsolidatedLink>();
  readonly isSelected = input<boolean>(false);

  linkSelected = output<IUConsolidatedLink>();

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


  emitLinkSelected(event: Event): void {
    event.stopPropagation();
    const link = this.link();
    this.linkSelected.emit(link);
  }

}
