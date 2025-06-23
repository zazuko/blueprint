import { Component, computed, DestroyRef, inject, input, model, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';


import { IUiGraphNode } from '../graph/model/graph.model';
import { ExploredResource } from '../../../features/explore/model/explored-resource.class';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { httpResource } from '@angular/common/http';
import { ConfigService } from '@blueprint/service/config/config.service';

import { flux, rdf, } from '@blueprint/ontology';
import { BidiractionalRelation, OutgoingRelation, IncomingRelation, RdfNodeRelation } from './model/node-relation';
import { getPredicatesWithCount } from './query/bidirecational-predicates.query';
import { RelationComponent } from "./relation/relation.component";
import { SelectButtonModule } from 'primeng/selectbutton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';

@Component({
  selector: 'bp-node-relations',
  templateUrl: './node-relations.component.html',
  styleUrl: './node-relations.component.scss',
  imports: [RelationComponent, SelectButtonModule, ReactiveFormsModule]
})
export class NodeRelationsComponent {
  readonly exploredResource = input.required<ExploredResource>();

  readonly nodeSelected = output<NodeElement>();

  // Services
  readonly #config = inject(ConfigService);
  readonly #destroyRef = inject(DestroyRef);

  formGroup = new FormGroup({
    value: new FormControl('label')
  });

  predicateOptions: { label: string; value: string }[] = [
    { label: 'RDF', value: 'rdf' },
    { label: 'Label', value: 'label' }
  ];

  showAsRdf = signal<boolean>(false);


  sparqlQuery = computed(() => {
    const iri = this.exploredResource().iri;

    return getPredicatesWithCount(iri);

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

  bidirectionalRelations = computed<BidiractionalRelation[]>(() => {
    const bidiNodes = rdfEnvironment.clownface(this.nodeRelations.value()).node(flux.BidirectionalRelationNamedNode).in(rdf.typeNamedNode);
    return bidiNodes.map(node => new BidiractionalRelation(node));
  });

  outgoingRelations = computed<OutgoingRelation[]>(() => {
    const outNodes = rdfEnvironment.clownface(this.nodeRelations.value()).node(flux.OutgoingRelationNamedNode).in(rdf.typeNamedNode);
    return outNodes.map(node => new OutgoingRelation(node));
  });

  incomingRelations = computed<IncomingRelation[]>(() => {
    const inNodes = rdfEnvironment.clownface(this.nodeRelations.value()).node(flux.IncomingRelationNamedNode).in(rdf.typeNamedNode);
    return inNodes.map(node => new IncomingRelation(node));
  });

  relations = computed<RdfNodeRelation[]>(() => {
    return [...this.bidirectionalRelations(), ...this.outgoingRelations(), ...this.incomingRelations()];
  });

  constructor() {
    this.formGroup.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(value => {
      if (value.value === 'rdf') {
        this.showAsRdf.set(true);
      } else if (value.value === 'label') {
        this.showAsRdf.set(false);
      }
    });
  }

  emitNodeSelected(node: NodeElement): void {
    this.nodeSelected.emit(node);
  }
}
