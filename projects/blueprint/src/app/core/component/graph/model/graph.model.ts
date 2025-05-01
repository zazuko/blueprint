import { INodeElement, NodeElement } from '@blueprint/model/node-element/node-element.class';
import { GraphPointer } from 'clownface';
import { blueprint } from '@blueprint/ontology';
import { rdfEnvironment } from '../../../rdf/rdf-environment';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import * as cola from 'webcola';


export interface Graph {
  nodes: IUiGraphNode[];
  links: IUiLink[];
}

export interface IUiGraphNode extends INodeElement {
  index: number;
  x: number;
  y: number;
  isPinned: boolean;
  showPin: boolean;
  fixed: number;
  expanded: boolean;
  showMenu: boolean;
  /**
   * this is the same as .iri
   * 
   * @deprecated
   */
  id: string;
}


export class RdfUiGraphNode extends NodeElement implements cola.Node, IUiGraphNode {
  isPinned = false;
  showPin = false;
  fixed = 0;
  expanded = false;
  showMenu = false;
  constructor(node: GraphPointer) {
    super(node);

  }


  get index(): number {
    const index = this._node.out(blueprint.indexNamedNode).value;
    if (index === undefined) {
      return -1;
    }
    return Number(index);
  }

  /**
   * this is the same as .iri
   * 
   * @deprecated
   */
  get id(): string {
    return this._node.value;
  }

  set index(index: number) {
    const hasIndex = this._node.out(blueprint.indexNamedNode).value !== undefined;
    if (hasIndex) {
      this._node.deleteOut(blueprint.indexNamedNode);
    }
    this._node.addOut(blueprint.indexNamedNode, rdfEnvironment.literal(`${index}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }

  set x(x: number) {
    const hasX = this._node.out(blueprint.xNamedNode).value !== undefined;
    if (hasX) {
      this._node.deleteOut(blueprint.xNamedNode);
    }
    this._node.addOut(blueprint.xNamedNode, rdfEnvironment.literal(`${x}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }
  set y(y: number) {
    const hasY = this._node.out(blueprint.yNamedNode).value !== undefined;
    if (hasY) {
      this._node.deleteOut(blueprint.yNamedNode);
    }
    this._node.addOut(blueprint.yNamedNode, rdfEnvironment.literal(`${y}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }
  get x(): number | undefined {
    const x = this._node.out(blueprint.xNamedNode).value;
    if (x === undefined) {
      return undefined;
    }
    return Number(x);
  }
  get y(): number | undefined {
    const y = this._node.out(blueprint.yNamedNode).value;
    if (y === undefined) {
      return undefined;
    }
    return Number(y);
  }




}


export interface IUiLink extends cola.Link<IUiGraphNode> {
  iri: string;
  source: IUiGraphNode;
  target: IUiGraphNode;
  id: string;
  label: string;
}


export class RdfUiLink extends ClownfaceObject implements IUiLink {
  constructor(node: GraphPointer) {
    super(node);
  }

  get source(): RdfUiGraphNode {
    const sourceNode = this._node.in(blueprint.hasUiLinkNamedNode).map(x => new RdfUiGraphNode(x));
    return sourceNode[0];
  }

  get target(): RdfUiGraphNode {
    const targetNode = this._node.out(blueprint.hasUiLinkNamedNode).map(x => new RdfUiGraphNode(x));
    return targetNode[0];
  }

  get label(): string {
    return this._node.out(blueprint.linkLabelNamedNode).values.join(' ,') ?? 'no label';
  }

  get id(): string {
    return this._node.value;
  }
}


