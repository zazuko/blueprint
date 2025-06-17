import { Component, computed, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { IUiLink } from '@blueprint/component/graph/model/graph.model';
import { rdfEnvironment } from '../../../core/rdf/rdf-environment';
import { LinkListItemComponent } from "./link-list-item/link-list-item.component";

@Component({
  selector: 'bp-link-panel',
  imports: [LinkListItemComponent, CardModule],
  templateUrl: './link-panel.component.html',
  styleUrl: './link-panel.component.scss'
})
export class LinkPanelComponent {
  link = input.required<IUiLink>();
  /*
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
  
      return []
    });
    */
}




interface PropertyPathSegment {
  predicateIri: string;
  predicateString: string;
  inverse: boolean;
  ngForIndex: string;
}