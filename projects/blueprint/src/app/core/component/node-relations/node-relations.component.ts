import { Component, computed, effect, inject, input, output } from '@angular/core';
import { Graph, IUiGraphNode, IUiLink, RdfUiLink } from '../graph/model/graph.model';
import { ExploredResource } from '../../../features/explore/model/explored-resource.class';
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { httpResource } from '@angular/common/http';
import { ConfigService } from '@blueprint/service/config/config.service';
import { getNodeRelationsQuery } from './query/node-relations.query';

@Component({
  selector: 'bp-node-relations',
  // imports: [],
  templateUrl: './node-relations.component.html',
  styleUrl: './node-relations.component.scss'
})
export class NodeRelationsComponent {
  readonly graph = input.required<Graph>();
  readonly exploredResource = input.required<ExploredResource>();

  readonly nodeSelected = output<IUiGraphNode>();

  // Services
  readonly #config = inject(ConfigService);


  sparqlQuery = computed(() => {
    const iri = this.exploredResource().iri;
    return getNodeRelationsQuery(iri);
  });

  querySearchParam = computed(() => {
    const body = new URLSearchParams();
    body.set('query', this.sparqlQuery());
    return body.toString();
  });

  nodeRelations = httpResource.text<RdfTypes.Dataset>(() => ({
    url: `${this.#config.getConfiguration().endpointUrl}`,
    method: "POST",
    body: this.querySearchParam(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/turtle'
    }
  }), {
    defaultValue: rdfEnvironment.dataset(),
    parse: (response: string) => {
      return rdfEnvironment.parseTurtle(response);
    }
  });


  constructor() {

    effect(() => {
      const dataset = this.nodeRelations.value();
      console.log(rdfEnvironment.serialize(dataset));
    })


    effect(() => {
      console.log(this.nodeRelations.error());
    });
  }

}

interface IUiLinkWithDirection extends RdfUiLink {
  direction: 'forward' | 'backward' | 'both';
}

interface NodeRelation {
  domain: string[],
  range: string[],
  link: IUiLink[],
  domainIncludes: string[],
  rangeIncludes: string[],
  linkLabel: string,
  linkPath: string,
  direction: 'forward' | 'backward' | 'both'
  inversePredicate: string | undefined;
  linkDefinition: UiLinkDefinition;
}