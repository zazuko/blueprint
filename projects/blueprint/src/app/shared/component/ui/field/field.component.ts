import { Component, input } from '@angular/core';

@Component({
  selector: 'bp-field',
  imports: [],
  templateUrl: './field.component.html',
  styleUrl: './field.component.scss'
})
export class FieldComponent {
  label = input.required<string>();
}
