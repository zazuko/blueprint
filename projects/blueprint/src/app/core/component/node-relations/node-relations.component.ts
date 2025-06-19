import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Graph, IUiGraphNode, IUConsolidatedLink, RdfConsolidatedLink } from '../graph/model/graph.model';
import { ExploredResource } from '../../../features/explore/model/explored-resource.class';
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { httpResource } from '@angular/common/http';
import { ConfigService } from '@blueprint/service/config/config.service';
import { getNodeRelationsQuery } from './query/node-relations.query';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { GraphPointer } from 'clownface';
import { flux, rdf, rdfs } from '@blueprint/ontology';

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

  showShortTBox = signal(true);

  sparqlQuery = computed(() => {
    const iri = this.exploredResource().iri;
    return getNodeRelationsQuery(iri);
  });

  querySearchParam = computed(() => {
    const body = new URLSearchParams();
    body.set('query', this.sparqlQuery());
    return body.toString();
  });

  nodeRelations = httpResource.text<INodeRelation[]>(() => ({
    url: `${this.#config.getConfiguration().endpointUrl}`,
    method: "POST",
    body: this.querySearchParam(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/turtle'
    }
  }), {
    defaultValue: [],
    parse: (response: string) => {
      const ds = rdfEnvironment.parseTurtle(response);
      const graph = rdfEnvironment.clownface(ds);
      //   return graph.node(flux.namespace['Predicate']).in(rdf.typeNamedNode).map(node => new RdfNodeRelation(node)).sort((a, b) => a.label.localeCompare(b.label));
      return []
    }
  });

}

interface INodeRelation {
  iri: string;
  domain: string[],
  range: string[],
  link: IUConsolidatedLink[],
  domainIncludes: string[],
  rangeIncludes: string[],
  linkLabel: string,
  linkPath: string,
  direction: 'forward' | 'backward' | 'both'
  inversePredicate: string | undefined;
  linkDefinition: UiLinkDefinition;
}