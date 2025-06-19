import { INodeElement, NodeElement } from '@blueprint/model/node-element/node-element.class';
import { GraphPointer } from 'clownface';
import { flux, rdf } from '@blueprint/ontology';
import { rdfEnvironment } from '../../../rdf/rdf-environment';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import * as cola from 'webcola';
import { RdfUiLinkDefinition, UiLinkDefinition } from '@blueprint/model/ui-link-definition/ui-link-definition';


export interface Graph {
  nodes: IUiGraphNode[];
  links: IUConsolidatedLink[];
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
  isBlankNode: boolean;
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

  /**
   * Returns true if the node is a blank node
   */
  get isBlankNode(): boolean {
    return this._node.term.termType === 'BlankNode' ? true : false;
  }
}


/**
 * This is a consolidated link
 */
export interface IUConsolidatedLink extends cola.Link<IUiGraphNode> {
  iri: string;
  rdfType: string;
  source: IUiGraphNode;
  target: IUiGraphNode;
  id: string;
  outgoingChildLinks: IChildLink[];
  incomingChildLinks: IChildLink[];
  isBidirectional: boolean;
}


export class RdfConsolidatedLink extends ClownfaceObject implements IUConsolidatedLink {
  #source: RdfUiGraphNode | undefined = undefined;
  #target: RdfUiGraphNode | undefined = undefined;
  #isBidirectional: boolean | undefined = undefined;
  #firstLinkNode: GraphPointer | undefined = undefined;
  #_childLinks: IChildLink[] | undefined = undefined;
  #incomingSubLinks: IChildLink[] | undefined = undefined;
  #outgoingSubLinks: IChildLink[] | undefined = undefined;

  constructor(node: GraphPointer) {
    super(node);
    // check type
    if (!node.out(rdf.typeNamedNode).has(flux.ConsolidatedLinkNamedNode)) {
      throw new Error('Node is not a consolidated link: ' + node.value);
    }
  }

  get rdfType(): string {
    return flux.ConsolidatedLinkNamedNode.value;
  }

  #getFirstLinkNode(): GraphPointer {
    if (this.#firstLinkNode === undefined) {
      this.#firstLinkNode = this._node.out(flux.hasChildLinkNamedNode).toArray().sort((a, b) => a.value.localeCompare(b.value))[0];
      if (this.#firstLinkNode === undefined) {
        throw new Error('No link node found for link: ' + this._node.value);
      }
    }
    console.log('first', this.#firstLinkNode.value);
    return this.#firstLinkNode;
  }

  get isBidirectional(): boolean {
    if (this.#isBidirectional === undefined) {
      this.#isBidirectional = this._node.out(flux.sourceNamedNode).values.length === 2
    }

    return this.#isBidirectional;
  };

  get source(): RdfUiGraphNode {
    if (this.#source === undefined) {
      if (!this.isBidirectional) {
        const sources = this._node.out(flux.sourceNamedNode).map(x => new RdfUiGraphNode(x));
        if (sources.length === 0) {
          throw new Error('No source node found for link: ' + this._node.value);
        }
        if (sources.length > 1) {
          throw new Error('Multiple source nodes found for link: ' + this._node.value);
        }
        this.#source = sources[0];
      } else {
        const sources = this.#getFirstLinkNode().out(flux.sourceNamedNode).map(x => new RdfUiGraphNode(x));
        if (sources.length === 0) {
          throw new Error('No source node found for link: ' + this._node.value);
        }
        if (sources.length > 1) {
          throw new Error('Multiple source nodes found for link: ' + this._node.value);
        }
        this.#source = sources[0];
      }
    }
    return this.#source;
  }

  get target(): RdfUiGraphNode {
    if (this.#target === undefined) {
      if (!this.isBidirectional) {
        const targets = this._node.out(flux.targetNamedNode).map(x => new RdfUiGraphNode(x));
        if (targets.length === 0) {
          throw new Error('No source node found for link: ' + this._node.value);
        }
        if (targets.length > 1) {
          throw new Error('Multiple source nodes found for link: ' + this._node.value);
        }
        this.#target = targets[0];
      } else {
        const targets = this.#getFirstLinkNode().out(flux.targetNamedNode).map(x => new RdfUiGraphNode(x));
        if (targets.length === 0) {
          throw new Error('No target node found for link: ' + this._node.value);
        }
        if (targets.length > 1) {
          throw new Error('Multiple target nodes found for link: ' + this._node.value);
        }
        this.#target = targets[0];
      }
    }
    return this.#target;
  }

  get incomingChildLinks(): IChildLink[] {
    if (this.#incomingSubLinks === undefined) {
      this.#incomingSubLinks = this.#childLinks.filter(childLink => childLink.target.iri === this.source.iri);
    }
    return this.#incomingSubLinks;
  }

  get outgoingChildLinks(): IChildLink[] {

    if (this.#outgoingSubLinks === undefined) {
      this.#outgoingSubLinks = this.#childLinks.filter(childLink => childLink.source.iri === this.source.iri);
    }
    return this.#outgoingSubLinks;
  }

  get id(): string {
    return this._node.value;
  }


  get #childLinks(): IChildLink[] {
    if (this.#_childLinks === undefined) {
      this.#_childLinks = this._node.out(flux.hasChildLinkNamedNode).map(child => new RdfChildLink(child));
      if (this.#_childLinks.length === 0) {
        throw new Error('No sub link found for link: ' + this._node.value);
      }
    }
    return this.#_childLinks;
  }


}


export interface IChildLink {
  iri: string;
  type: string;
  source: IUiGraphNode;
  target: IUiGraphNode;
  linkDefinition: RdfUiLinkDefinition;
}

export class RdfChildLink extends ClownfaceObject implements IChildLink {
  #source: RdfUiGraphNode | undefined = undefined;
  #target: RdfUiGraphNode | undefined = undefined;
  #linkDefinition: RdfUiLinkDefinition | undefined = undefined;

  constructor(node: GraphPointer) {
    super(node);
    // check type
    if (!node.out(rdf.typeNamedNode).has(flux.ChildLinkNamedNode)) {
      throw new Error('Node is not a child link: ' + node.value);
    }
  }

  get type(): string {
    return flux.ChildLinkNamedNode.value;
  }

  get source(): RdfUiGraphNode {
    if (this.#source === undefined) {
      const sources = this._node.out(flux.sourceNamedNode).map(x => new RdfUiGraphNode(x));
      if (sources.length === 0) {
        throw new Error('No source node found for link: ' + this._node.value);
      }
      if (sources.length > 1) {
        throw new Error('Multiple source nodes found for link: ' + this._node.value);
      }
      this.#source = sources[0];
    }
    return this.#source;
  }

  get target(): RdfUiGraphNode {
    if (this.#target === undefined) {
      const targets = this._node.out(flux.targetNamedNode).map(x => new RdfUiGraphNode(x));
      if (targets.length === 0) {
        throw new Error('No target node found for link: ' + this._node.value);
      }
      if (targets.length > 1) {
        throw new Error('Multiple target nodes found for link: ' + this._node.value);
      }
      this.#target = targets[0];
    }
    return this.#target;
  }


  get linkDefinition(): RdfUiLinkDefinition {
    if (this.#linkDefinition === undefined) {
      const linkDefs = this._node.out(flux.linkNamedNode).map(linkDef => new RdfUiLinkDefinition(linkDef));
      if (linkDefs.length === 0) {
        throw new Error('No link definition found for link: ' + this._node.value);
      }
      if (linkDefs.length > 1) {
        throw new Error('Multiple link definitions found for link: ' + this._node.value);
      }
      this.#linkDefinition = linkDefs[0];
    }
    return this.#linkDefinition;
  }

}
