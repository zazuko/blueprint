import { NgClass, NgStyle } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'bp-filter-item',
  imports: [NgStyle, NgClass],
  templateUrl: './filter-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './filter-item.component.scss',
})
export class FilterItemComponent {
  color = input.required<string>();
  icon = input.required<string>();
  label = input.required<string>();
  count = input.required<number>();

  changeDetectorRef = inject(ChangeDetectorRef);

  conditionalColor = computed<string>(() => {
    if (this.count() === 0) {
      return 'var(--quinary-contrast)';
    }
    return this.color();
  });
}
