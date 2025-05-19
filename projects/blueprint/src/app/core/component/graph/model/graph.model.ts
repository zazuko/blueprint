import { INodeElement, NodeElement } from '@blueprint/model/node-element/node-element.class';
import { GraphPointer } from 'clownface';
import { flux } from '@blueprint/ontology';
import { rdfEnvironment } from '../../../rdf/rdf-environment';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import * as cola from 'webcola';
import { UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';


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
    const index = this._node.out(flux.indexNamedNode).value;
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
    const hasIndex = this._node.out(flux.indexNamedNode).value !== undefined;
    if (hasIndex) {
      this._node.deleteOut(flux.indexNamedNode);
    }
    this._node.addOut(flux.indexNamedNode, rdfEnvironment.literal(`${index}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }

  set x(x: number) {
    const hasX = this._node.out(flux.xNamedNode).value !== undefined;
    if (hasX) {
      this._node.deleteOut(flux.xNamedNode);
    }
    this._node.addOut(flux.xNamedNode, rdfEnvironment.literal(`${x}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }

  set y(y: number) {
    const hasY = this._node.out(flux.yNamedNode).value !== undefined;
    if (hasY) {
      this._node.deleteOut(flux.yNamedNode);
    }
    this._node.addOut(flux.yNamedNode, rdfEnvironment.literal(`${y}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }

  get x(): number | undefined {
    const x = this._node.out(flux.xNamedNode).value;
    if (x === undefined) {
      return undefined;
    }
    return Number(x);
  }

  get y(): number | undefined {
    const y = this._node.out(flux.yNamedNode).value;
    if (y === undefined) {
      return undefined;
    }
    return Number(y);
  }

  get isPinned(): boolean {
    const isPinnedString = this._node.out(flux.namespace`isPinned`).value;
    return isPinnedString === 'true' || isPinnedString === '1';
  }

  set isPinned(isPinned: boolean) {
    const hasIsPinned = this._node.out(flux.namespace`isPinned`).value !== undefined;
    if (hasIsPinned) {
      this._node.deleteOut(flux.namespace`isPinned`);
    }
    this._node.addOut(flux.namespace`isPinned`, rdfEnvironment.literal(`${isPinned}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
  }

  get fixed(): number {
    const fixed = this._node.out(flux.namespace`fixed`).value;
    if (fixed === undefined) {
      return 0;
    }
    return Number(fixed);
  }

  set fixed(fixed: number) {
    const hasFixed = this._node.out(flux.namespace`fixed`).value !== undefined;
    if (hasFixed) {
      this._node.deleteOut(flux.namespace`fixed`);
    }
    this._node.addOut(flux.namespace`fixed`, rdfEnvironment.literal(`${fixed}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#integer')));
  }

  get showPin(): boolean {
    const showPinString = this._node.out(flux.namespace`showPin`).value;
    return showPinString === 'true' || showPinString === '1';
  }

  set showPin(showPin: boolean) {
    const hasShowPin = this._node.out(flux.namespace`showPin`).value !== undefined;
    if (hasShowPin) {
      this._node.deleteOut(flux.namespace`showPin`);
    }
    this._node.addOut(flux.namespace`showPin`, rdfEnvironment.literal(`${showPin}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
  }

  get expanded(): boolean {
    const expandedString = this._node.out(flux.namespace`expanded`).value;
    return expandedString === 'true' || expandedString === '1';
  }

  set expanded(expanded: boolean) {
    const hasExpanded = this._node.out(flux.namespace`expanded`).value !== undefined;
    if (hasExpanded) {
      this._node.deleteOut(flux.namespace`expanded`);
    }
    this._node.addOut(flux.namespace`expanded`, rdfEnvironment.literal(`${expanded}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
  }

  get showMenu(): boolean {
    const showMenuString = this._node.out(flux.namespace`showMenu`).value;
    return showMenuString === 'true' || showMenuString === '1';
  }

  set showMenu(showMenu: boolean) {
    const hasShowMenu = this._node.out(flux.namespace`showMenu`).value !== undefined;
    if (hasShowMenu) {
      this._node.deleteOut(flux.namespace`showMenu`);
    }
    this._node.addOut(flux.namespace`showMenu`, rdfEnvironment.literal(`${showMenu}`, rdfEnvironment.namedNode('http://www.w3.org/2001/XMLSchema#boolean')));
  }

}


export interface IUiLink extends cola.Link<IUiGraphNode> {
  iri: string;
  source: IUiGraphNode;
  target: IUiGraphNode;
  id: string;
  label: string;
  linkDefinition: UiLinkDefinition | null;
}


export class RdfUiLink extends ClownfaceObject implements IUiLink {
  constructor(node: GraphPointer, public linkDefinition: UiLinkDefinition) {
    super(node);
  }

  get source(): RdfUiGraphNode {
    const sourceNode = this._node.in(flux.hasUiLinkNamedNode).map(x => new RdfUiGraphNode(x));
    return sourceNode[0];
  }

  get target(): RdfUiGraphNode {
    const targetNode = this._node.out(flux.hasUiLinkNamedNode).map(x => new RdfUiGraphNode(x));
    return targetNode[0];
  }

  get label(): string {
    return this._node.out(flux.linkLabelNamedNode).values.join(' ,') ?? 'no label';
  }

  get id(): string {
    return this._node.value;
  }
}


