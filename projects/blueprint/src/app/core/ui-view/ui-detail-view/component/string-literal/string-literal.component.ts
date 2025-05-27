import { Component, computed, input } from '@angular/core';
import { RdfTypes } from '../../../../rdf/rdf-environment';
import { equal } from 'assert';

@Component({
  selector: 'bp-string-literal',
  imports: [],
  templateUrl: './string-literal.component.html',
  styleUrls: ['../../shared-literal-style.scss', './string-literal.component.scss']
})
export class StringLiteralComponent {
  label = input.required<string>();
  value = input.required<RdfTypes.Literal[]>();

  valuesWithId = computed<LiteralWithId[]>(() => {
    const values = this.value();
    return values.map(literal => {
      return {
        id: `${literal}-${literal.language || ''}-${literal.datatype || ''}`,
        termType: literal.termType,
        value: literal.value,
        language: literal.language,
        datatype: literal.datatype.value,
      };
    }
    );
  });

  isUrl(value: string): boolean {
    return /^https?:\/\/.+/i.test(value);
  }

}


interface LiteralWithId {
  id: string;
  language: string | undefined;
  datatype: string | undefined;
  value: string;
  termType: string;
}