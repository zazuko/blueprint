import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  output,
  input,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MultiLinkLabels } from '../model/multi-link-labels.model';
import { IUiLink } from '../../model/graph.model';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[bp-arrow]',
  templateUrl: './arrow.component.svg',
  styleUrls: ['./arrow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ArrowComponent implements OnChanges {

  x1 = input.required<number>();
  x2 = input.required<number>();
  y1 = input.required<number>();
  y2 = input.required<number>();

  @Input() link: IUiLink;

  multiLinkSelected = output<MultiLinkLabels>();

  forwardLabels: string[] = [];
  backwardLabels: string[] = [];
  multiLinkTarget: ElementRef;

  calculateLinkLabelTransform = computed<string>(() => {
    const x1 = this.x1();
    const x2 = this.x2();
    const y1 = this.y1();
    const y2 = this.y2();

    const rotation = x1 >= x2 ? 180 + (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
      : (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    return `translate(${0.5 * (x2 + x1)},${0.5 * (y2 + y1)}) rotate(${rotation})`;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['link']?.currentValue) {
      if (
        changes['link'].currentValue.label.startsWith('f_') ||
        changes['link'].currentValue.label.startsWith('b_')
      ) {
        this.forwardLabels = changes['link'].currentValue.label
          .split('\n')
          .filter((label: string) => label.startsWith('f_'))
          .map((label) => label.replace('f_', ''));
        this.backwardLabels = changes['link'].currentValue.label
          .split('\n')
          .filter((label: string) => label.startsWith('b_'))
          .map((label) => label.replace('b_', ''));
      } else {
        this.forwardLabels = changes['link'].currentValue.label.split('\n');
      }
    }
  }

  calculateLoopLinkLabelTransform = computed<string>(() => {
    const x1 = this.x1();
    const y1 = this.y1();
    const rotation = -45;
    //(Math.atan2(0, 0) * 180) / Math.PI; // 180 + (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) * 180) / Math.PI;
    //  : (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) * 180) / Math.PI;
    return `translate(${x1},${y1}) rotate(${rotation})`;
  });

  onMultiLinkSelected(event) {
    event.stopPropagation();
    this.multiLinkSelected.emit({
      backward: this.backwardLabels,
      forward: this.forwardLabels,
      source: this.link.source,
      target: this.link.target,
    });
  }
}
