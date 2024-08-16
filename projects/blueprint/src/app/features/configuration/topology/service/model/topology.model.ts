import * as RDF from '@rdfjs/types';
import { TopologyNode } from './topology-node.model';

export interface Topology {
    id: string;
    label: string;
    comment: string;
}
export class TopologyIpl implements Topology {
    private _node: RDF.NamedNode;
    private _label: string = '';
    private _comment: string = '';
    private _rootNode: TopologyNode;

    protected constructor(node: RDF.NamedNode, label: string, comment: string, root: TopologyNode) {
        this._node = node;
        this._label = label;
        this._comment = comment;
        this._rootNode = root;
    }

    get node(): RDF.NamedNode {
        return this._node;
    }

    get id(): string {
        return this._node.value;
    }

    get label(): string {
        return this._label;
    }

    get comment(): string {
        return this._comment;
    }

    get rootNode(): TopologyNode {
        return this._rootNode;
    }
}