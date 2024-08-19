import * as RDF from '@rdfjs/types';

import { TopologyPath, TopologyPathElement } from './topology-path.model';

export class TopologyNode {
    #_label: string;
    #_comment: string;
    #_children: TopologyNode[] = [];

    protected _rootNode: TopologyNode | null = null;
    protected _pathToRoot: TopologyPathElement[] = [];

    constructor(private rdfClass: RDF.NamedNode, label: string = '', comment: string = '') {
        this._pathToRoot = [];
        this.#_label = label;
        this.#_comment = comment;
    }

    get rdfClassId(): string {
        return this.rdfClass.value;
    }

    get rdfClassNode(): RDF.NamedNode {
        return this.rdfClass;
    }

    get label(): string {
        return this.#_label;
    }

    get comment(): string {
        return this.#_comment;
    }

    get rootPath(): TopologyPathElement[] {
        return this._pathToRoot;
    }

    addChild(node: TopologyNode, path: TopologyPathElement[]) {
        const childNode = new TopologyNode(node.rdfClass, node.label, node.comment);
        childNode._pathToRoot = path;
        childNode._rootNode = this;
        childNode.#_children = node.children;
        this.#_children.push(childNode);
    }

    hasNode(classIri: RDF.NamedNode, visited = new Set<string>()): boolean {
        if (this.rdfClassId === classIri.value) {
            return true;
        }

        visited.add(this.rdfClassId);

        for (const child of this.#_children) {
            if (!visited.has(child.rdfClassId) && child.hasNode(classIri, visited)) {
                return true;
            }
        }

        return false;
    }

    findNode(classIri: RDF.NamedNode, visited = new Set<string>()): TopologyNode | null {
        if (this.rdfClassId === classIri.value) {
            return this;
        }

        visited.add(this.rdfClassId);

        for (const child of this.#_children) {
            if (!visited.has(child.rdfClassId)) {
                const node = child.findNode(classIri, visited);
                if (node) {
                    return node;
                }
            }
        }

        return null;
    }

    getFullPathToRoot(): TopologyPath[] {
        if (this._rootNode === null) {
            return [];
        }

        const pathElement = this._pathToRoot;
        const pathToRoot: TopologyPath = {
            path: pathElement,
            toClass: this._rootNode.rdfClass
        };

        return [pathToRoot, ...this._rootNode.getFullPathToRoot()];
    }

    get children(): TopologyNode[] {
        return this.#_children;
    }


    protected set children(nodes: TopologyNode[]) {
        this.#_children = nodes;
    }
}
