import { Component, input, output } from '@angular/core';

@Component({
  selector: 'bp-field',
  imports: [],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss'
})
export class FieldComponent {
  label = input.required<string>();

  labelClicked = output<void>();


  emitLabelClicked(): void {
    this.labelClicked.emit();
  }
}
