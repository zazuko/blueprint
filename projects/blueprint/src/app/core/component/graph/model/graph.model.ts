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
   * this is the same as .iri but it is needed to support the cola.js interface
   */
  id: string;
}


export class RdfUiGraphNode extends NodeElement implements cola.Node, IUiGraphNode {


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

  get isPinned(): boolean {
    const isPinnedString = this._node.out(blueprint.namespace`isPinned`).value;
    return isPinnedString === 'true' || isPinnedString === '1';
  }

  set isPinned(isPinned: boolean) {
    const hasIsPinned = this._node.out(blueprint.namespace`isPinned`).value !== undefined;
    if (hasIsPinned) {
      this._node.deleteOut(blueprint.namespace`isPinned`);
    }
    this._node.addOut(blueprint.namespace`isPinned`, rdfEnvironment.literal(`${isPinned}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
  }

  get fixed(): number {
    const fixed = this._node.out(blueprint.namespace`fixed`).value;
    if (fixed === undefined) {
      return 0;
    }
    return Number(fixed);
  }

  set fixed(fixed: number) {
    const hasFixed = this._node.out(blueprint.namespace`fixed`).value !== undefined;
    if (hasFixed) {
      this._node.deleteOut(blueprint.namespace`fixed`);
    }
    this._node.addOut(blueprint.namespace`fixed`, rdfEnvironment.literal(`${fixed}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }

  get showPin(): boolean {
    const showPinString = this._node.out(blueprint.namespace`showPin`).value;
    return showPinString === 'true' || showPinString === '1';
  }

  set showPin(showPin: boolean) {
    const hasShowPin = this._node.out(blueprint.namespace`showPin`).value !== undefined;
    if (hasShowPin) {
      this._node.deleteOut(blueprint.namespace`showPin`);
    }
    this._node.addOut(blueprint.namespace`showPin`, rdfEnvironment.literal(`${showPin}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
  }

  get expanded(): boolean {
    const expandedString = this._node.out(blueprint.namespace`expanded`).value;
    return expandedString === 'true' || expandedString === '1';
  }

  set expanded(expanded: boolean) {
    const hasExpanded = this._node.out(blueprint.namespace`expanded`).value !== undefined;
    if (hasExpanded) {
      this._node.deleteOut(blueprint.namespace`expanded`);
    }
    this._node.addOut(blueprint.namespace`expanded`, rdfEnvironment.literal(`${expanded}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
  }

  get showMenu(): boolean {
    const showMenuString = this._node.out(blueprint.namespace`showMenu`).value;
    return showMenuString === 'true' || showMenuString === '1';
  }

  set showMenu(showMenu: boolean) {
    const hasShowMenu = this._node.out(blueprint.namespace`showMenu`).value !== undefined;
    if (hasShowMenu) {
      this._node.deleteOut(blueprint.namespace`showMenu`);
    }
    this._node.addOut(blueprint.namespace`showMenu`, rdfEnvironment.literal(`${showMenu}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
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


