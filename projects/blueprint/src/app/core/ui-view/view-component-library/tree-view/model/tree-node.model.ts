import { Avatar } from "@blueprint/component/avatar/avatar.component";
import { NodeElement } from "@blueprint/model/node-element/node-element.class";
import { blueprint } from "@blueprint/ontology";
import { GraphPointer } from "clownface";


export interface TreeNode {
    label: string;
    secondaryLabel: string;
    avatars: Avatar[];
    children: TreeNode[];
}


export class RdfTreeNode extends NodeElement implements TreeNode {
    #_children: TreeNode[] | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    get secondaryLabel(): string {
        return this.classLabel.join(', ');
    }

    get children(): TreeNode[] {
        if (this.#_children === null) {
            this.#_children = this._node.out(blueprint.ChildNamedNode).map(n => new RdfTreeNode(n)) as TreeNode[];
        }
        return this.#_children;
    }
}