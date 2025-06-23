import { Component, computed, effect, inject, input, output } from '@angular/core';
import { BidiractionalRelation, IncomingRelation, OutgoingRelation, RdfNodeRelation } from '../model/node-relation';
import { ExploredResource } from 'projects/blueprint/src/app/features/explore/model/explored-resource.class';
import { getBidirectionalQuery } from './query/get-bidirectional.query';
import { getIncomingQuery } from './query/get-incoming.query';
import { getOutgoingQuery } from './query/get-outgoing.qery';
import { httpResource } from '@angular/common/http';
import { rdfEnvironment, RdfTypes } from '../../../rdf/rdf-environment';
import { ConfigService } from '@blueprint/service/config/config.service';
import { NodeElement } from '@blueprint/model/node-element/node-element.class';
import { NodeElementTableComponent } from "../../node-element-table/node-element-table.component";
import { UiClassMetadataService } from '@blueprint/service/ui-class-metadata/ui-class-metadata.service';
import { sparqlUtils } from '../../../utils/sparql-utils';

@Component({
  selector: 'bp-relation-detail',
  imports: [NodeElementTableComponent],
  templateUrl: './relation-detail.component.html',
  styleUrl: './relation-detail.component.scss'
})
export class RelationDetailComponent {
  relation = input.required<RdfNodeRelation>();
  exploredResource = input.required<ExploredResource>();

  nodeSelected = output<NodeElement>();
  // Services
  readonly #config = inject(ConfigService);
  readonly #classMetadat = inject(UiClassMetadataService);

  sparqlQuery = computed(() => {
    const subjectIri = this.exploredResource().iri;
    const relation = this.relation();

    if (relation.relationType === 'Bidirectional') {
      return sparqlUtils.mergeConstruct([getBidirectionalQuery(subjectIri, (relation as BidiractionalRelation).outgoingPredicate, (relation as BidiractionalRelation).incomingPredicate), this.#classMetadat.getClassMetadataSparqlQuery()])
    } else if (relation.relationType === 'Outgoing') {
      return sparqlUtils.mergeConstruct([getOutgoingQuery(subjectIri, (relation as OutgoingRelation).outgoingPredicate), this.#classMetadat.getClassMetadataSparqlQuery()]);
    } else
      return sparqlUtils.mergeConstruct([getIncomingQuery(subjectIri, (relation as IncomingRelation).incomingPredicate), this.#classMetadat.getClassMetadataSparqlQuery()]);

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

  nodeElements = computed<NodeElement[]>(() => {
    const dataset = this.nodeRelations.value();
    const graph = rdfEnvironment.clownface(dataset).namedNode(this.exploredResource().iri);
    const predicate = this.relation().relationType === 'Incoming' ?
      rdfEnvironment.namedNode((this.relation() as IncomingRelation).incomingPredicate) :
      rdfEnvironment.namedNode((this.relation() as OutgoingRelation).outgoingPredicate);


    if (this.relation().relationType === 'Incoming') {
      return graph.in(predicate).map((node) => new NodeElement(node));
    } else if (this.relation().relationType === 'Outgoing') {
      return graph.out(predicate).map((node) => new NodeElement(node));
    }

    return graph.out(predicate).map((node) => new NodeElement(node));
  });

  emitNodeSelected(node: NodeElement) {
    this.nodeSelected.emit(node);
  }


}
