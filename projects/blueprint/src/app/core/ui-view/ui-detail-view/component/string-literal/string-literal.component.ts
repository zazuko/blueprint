import { Component, input } from '@angular/core';
import { RdfTypes } from '../../../../rdf/rdf-environment';

@Component({
  selector: 'bp-string-literal',
  imports: [],
  templateUrl: './string-literal.component.html',
  styleUrls: ['../../shared-literal-style.scss', './string-literal.component.scss']
})
export class StringLiteralComponent {
  label = input.required<string>();
  value = input.required<RdfTypes.Literal[]>();

  isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

}
