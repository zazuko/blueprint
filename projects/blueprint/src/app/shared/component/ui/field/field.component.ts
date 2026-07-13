import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'bp-field',
  imports: [],
  templateUrl: './field.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './field.component.scss',
})
export class FieldComponent {
  label = input.required<string>();

  labelClicked = output<void>();

  emitLabelClicked(): void {
    this.labelClicked.emit();
  }
}
