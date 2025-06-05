import { Component, computed, input } from '@angular/core';
import { LabelWithLinkDefinition } from '@blueprint/component/graph/model/graph.model';
import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { FieldComponent } from 'projects/blueprint/src/app/shared/component/ui/field/field.component';

@Component({
  selector: 'bp-link-list-item',
  imports: [FieldComponent],
  templateUrl: './link-list-item.component.html',
  styleUrl: './link-list-item.component.scss'
})
export class LinkListItemComponent {
  label = input.required<LabelWithLinkDefinition>();

  path = computed<PathElement[]>(() => {
    const path = this.label().linkDefinition.propertyPathFragments.map((fragment, index) => {
      console.log(fragment);
      const isInverse = fragment.startsWith('^');
      const predicateIri = isInverse ? fragment.slice(1) : fragment;
      const shrinkedPredicate = `${rdfEnvironment.shrink(predicateIri)}`;
      const ngForIndex = `${predicateIri}-${index}`;
      const displayString = isInverse ? `^${shrinkedPredicate}` : shrinkedPredicate;
      return { displayString, predicateIri, shrinkedPredicate, isInverse, ngForIndex };
    });
    return path;
  }
  );


  pathLiterals = computed<RdfTypes.Literal[]>(() => {
    const path = this.path();

    return path.map(e => rdfEnvironment.literal(e.displayString));
  });

  labelLiterals = computed<RdfTypes.Literal[]>(() => {
    const label = this.label().label;
    const labelLiteral = rdfEnvironment.literal(label);
    return [labelLiteral]
  });
}


interface PathElement {
  predicateIri: string;
  shrinkedPredicate: string;
  displayString: string;
  isInverse: boolean;
  ngForIndex: string;
}
