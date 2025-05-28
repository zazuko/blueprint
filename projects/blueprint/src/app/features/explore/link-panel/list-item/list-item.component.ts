import { Component, computed, input } from '@angular/core';
import { LabelWithLinkDefinition } from '@blueprint/component/graph/model/graph.model';
import { rdf } from '@blueprint/ontology';
import { rdfEnvironment, RdfTypes } from 'projects/blueprint/src/app/core/rdf/rdf-environment';
import { StringLiteralComponent } from 'projects/blueprint/src/app/core/ui-view/ui-detail-view/component/string-literal/string-literal.component';

@Component({
  selector: 'bp-list-item',
  imports: [StringLiteralComponent],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss'
})
export class ListItemComponent {
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
