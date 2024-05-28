import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MultiLinkLabels } from '../model/multi-link-labels.model';
import { GraphLink } from '../../model/graph-link.model';

@Component({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[bp-arrow]',
  templateUrl: './arrow.component.svg',
  styleUrls: ['./arrow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ArrowComponent implements OnChanges {
  @Input() x1: number;
  @Input() x2: number;
  @Input() y1: number;
  @Input() y2: number;
  @Input() link: GraphLink;

  multiLinkSelected = output<MultiLinkLabels>();

  forwardLabels: string[] = [];
  backwardLabels: string[] = [];
  multiLinkTarget: ElementRef;

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

  calculateLinkLabelTransform(): string {
    const rotation =
      this.x1 >= this.x2
        ? 180 +
        (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) * 180) / Math.PI
        : (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) * 180) / Math.PI;
    return `translate(${0.5 * (this.x2 + this.x1)},${0.5 * (this.y2 + this.y1)
      }) rotate(${rotation})`;
  }

  calculateLoopLinkLabelTransform(): string {
    const rotation = -45; //(Math.atan2(0, 0) * 180) / Math.PI; // 180 + (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) * 180) / Math.PI;
    //  : (Math.atan2(this.y2 - this.y1, this.x2 - this.x1) * 180) / Math.PI;
    return `translate(${this.x1},${this.y1}) rotate(${rotation})`;
  }

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
