import { Component, computed, input } from '@angular/core';
import { RdfTypes } from '../../../../rdf/rdf-environment';

import { sortLiteralsByBrowserLanguage } from '../../../../utils/language-prededence';
import { FieldComponent } from 'projects/blueprint/src/app/shared/component/ui/field/field.component';

@Component({
  selector: 'bp-string-literal',
  imports: [FieldComponent],
  templateUrl: './string-literal.component.html',
  styleUrls: ['../../shared-literal-style.scss', './string-literal.component.scss']
})
export class StringLiteralComponent {
  label = input.required<string>();
  value = input.required<RdfTypes.Literal[]>();

  literalsWithLanguagePrecedence = computed<RdfTypes.Literal[]>(() => {
    const literals = this.value();
    return sortLiteralsByBrowserLanguage(literals);
  }
  );
  valuesWithId = computed<LiteralWithId[]>(() => {
    const values = this.literalsWithLanguagePrecedence();
    return values.map(literal => {
      return {
        id: `${literal.value}-${literal.language || ''}-${literal.datatype.value || ''}`,
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