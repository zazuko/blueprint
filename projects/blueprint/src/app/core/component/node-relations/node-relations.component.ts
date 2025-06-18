import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Graph, IUiGraphNode, IUiLink, RdfUiLink } from '../graph/model/graph.model';
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
      return graph.node(flux.namespace['Predicate']).in(rdf.typeNamedNode).map(node => new RdfNodeRelation(node)).sort((a, b) => a.label.localeCompare(b.label));
    }
  });

}

interface IUiLinkWithDirection extends RdfUiLink {
  direction: 'forward' | 'backward' | 'both';
}

interface INodeRelation {
  iri: string;
  domain: string[],
  range: string[],
  predicate: string;
  label: string;
  from: string[],
  to: string[],
}

class RdfNodeRelation extends ClownfaceObject implements INodeRelation {
  #domain: string[] | undefined = undefined;
  #range: string[] | undefined = undefined;
  #predicate: string | undefined = undefined;
  #label: string | undefined = undefined;
  #from: string[] | undefined = undefined;
  #to: string[] | undefined = undefined;
  constructor(node: GraphPointer) {
    super(node);
  }

  get domain(): string[] {
    if (this.#domain === undefined) {
      this.#domain = this._node.out(rdfs.domainNamedNode).values
    }
    return this.#domain;
  }

  get range(): string[] {
    if (this.#range === undefined) {
      this.#range = this._node.out(rdfs.rangeNamedNode).values;
    }
    return this.#range;
  }

  get predicate(): string {
    if (this.#predicate === undefined) {
      this.#predicate = rdfEnvironment.shrink(this._node.value);
    }
    return this.#predicate;
  }

  get label(): string {
    if (this.#label === undefined) {
      this.#label = ClownfaceObject.getLabelForNode(this._node);
    }
    return this.#label;
  }

  get from(): string[] {
    if (this.#from === undefined) {
      this.#from = this._node.out(flux.namespace['comesFrom']).values.map(v => rdfEnvironment.shrink(v));
    }
    return this.#from;
  }

  get to(): string[] {
    if (this.#to === undefined) {
      this.#to = this._node.out(flux.namespace['goesTo']).values.map(v => rdfEnvironment.shrink(v));
    }
    return this.#to;
  }
}