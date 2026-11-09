import {
  Component,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { MatTooltipModule } from '@angular/material/tooltip';

import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';
import {
  rdfEnvironment,
  RdfTypes,
} from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { FieldComponent } from 'projects/blueprint/src/app/shared/component/ui/field/field.component';

@Component({
  selector: 'bp-link-list-item',
  imports: [FieldComponent, MatTooltipModule],
  templateUrl: './link-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './link-list-item.component.scss',
})
export class LinkListItemComponent {
  label = input.required<UiLinkDefinition>();

  path = computed<PathElement[]>(() => {
    const path = this.label().propertyPathFragments.map(
      (fragment, index) => {
        const isInverse = fragment.startsWith('^');
        const pathToken = isInverse ? fragment.slice(1) : fragment;
        const predicateIri = pathToken.startsWith('<') && pathToken.endsWith('>')
          ? pathToken.slice(1, -1)
          : pathToken;
        const shrinkedPredicate = `${rdfEnvironment.shrink(predicateIri)}`;
        const ngForIndex = `${predicateIri}-${index}`;
        const displayString = isInverse
          ? `^${shrinkedPredicate}`
          : shrinkedPredicate;
        return {
          displayString,
          predicateIri,
          shrinkedPredicate,
          isInverse,
          ngForIndex,
        };
      }
    );
    return path;
  });

  pathLiterals = computed<RdfTypes.Literal[]>(() => {
    const path = this.path();

    return path.map((e) => rdfEnvironment.literal(e.displayString));
  });

  labelLiterals = computed<RdfTypes.Literal[]>(() => {
    const label = this.label().label;
    const labelLiteral = rdfEnvironment.literal(label);
    return [labelLiteral];
  });
}

interface PathElement {
  predicateIri: string;
  shrinkedPredicate: string;
  displayString: string;
  isInverse: boolean;
  ngForIndex: string;
}
