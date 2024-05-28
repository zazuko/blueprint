import { GraphPointer } from 'clownface';

import { Term } from '@rdfjs/types';

import rdfEnvironment from '@zazuko/env';
import { rdf, rdfs, shacl } from '@blueprint/ontology';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';


const dash = rdfEnvironment.namespace('http://datashapes.org/dash#');

export class FluxDetailMetadata extends ClownfaceObject {
  constructor(node: GraphPointer) {
    super(node);
  }

  get label(): string {
    return this._node.out(rdfs.labelNamedNode)?.value ?? null;
  }

  get type(): string {
    return this._node.out(rdf.typeNamedNode)?.value ?? null;
  }

  get viewer(): Term {
    return this._node.out(dash['viewer'])?.term ?? null;
  }

  get group(): string {
    return this._node.out(shacl.groupNamedNode)?.value ?? null;
  }

  get order(): number {
    return Number(this._node.out(shacl.orderNamedNode)?.value) ?? 99;
  }

  get shClass(): string {
    return this._node.out(shacl.classNamedNode)?.value ?? null;
  }

  get node(): GraphPointer {
    return this._node;
  }

  prettyPrint(): string {
    return `
    {
      iri: ${this.iri}
      type: ${this.type}
      dash.viewer: ${this.node.out(dash['viewer'])?.value}
      label: "${this.label}"
      sh.class: ${this.shClass}
      sh.group: ${this.group}
      sh.order: ${this.order}
    }
`;
  }
}