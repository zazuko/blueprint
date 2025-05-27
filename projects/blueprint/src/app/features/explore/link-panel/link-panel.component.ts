import { Component, computed, input } from '@angular/core';
import { ConsolidatedLink } from '@blueprint/component/graph/model/graph.model';
import { RdfPrefixPipe } from "../../../core/rdf/prefix/rdf-prefix.pipe";
import { rdfEnvironment } from '../../../core/rdf/rdf-environment';

@Component({
  selector: 'bp-link-panel',
  imports: [RdfPrefixPipe],
  templateUrl: './link-panel.component.html',
  styleUrl: './link-panel.component.scss'
})
export class LinkPanelComponent {
  link = input.required<ConsolidatedLink>();

  outPathElements = computed<PropertyPathSegment[]>(() => {
    const path = this.link().outgoingLabels;

    return []
  });

  inPathElements = computed<PropertyPathSegment[]>(() => {
    const links = this.link().incomingLabels.map(l => l.linkDefinition);

    const frags = links.map(link => {
      const path = link.propertyPathFragments.map((fragment, index) => {
        const predicateIri = fragment;
        const predicateString = rdfEnvironment.shrink(fragment);
        const inverse = false; // Assuming no inverse for incoming paths
        const ngForIndex = index.toString();
      });
    });

    console.log(frags);
    return []
  });
}




interface PropertyPathSegment {
  predicateIri: string;
  predicateString: string;
  inverse: boolean;
  ngForIndex: string;
}