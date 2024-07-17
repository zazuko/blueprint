import { GraphPointer } from 'clownface';


import { rdfs, rdf, shacl, blueprint } from "@blueprint/ontology";
import { ColorUtil } from '@blueprint/utils';
import { ClownfaceObject } from '../clownface-object/clownface-object';

import { DEFAULT_ICON } from '@blueprint/constant/icon';
import { Avatar } from '@blueprint/component/avatar/avatar.component';
import { DEFAULT_COLOR } from '@blueprint/constant/color';

/**
 * Interface for the NodeElement
 */
export interface INodeElement {
    iri: string;
    label: string;
    classLabel: string[];
    description: string;
    avatars: Avatar[];
    color: string;
}

/**
 * This class Represents a node in the UI. It provides access to the label, class label, description, avatars and color of the node.
 * It is a wrapper around the clownface GraphPointer and can be used to access the node in the RDF Dataset. 
 * It implements the INodeElement interface.
 */
export class NodeElement extends ClownfaceObject implements INodeElement {

    private _label: string | null = null;
    private _classLabel: string[] | null = null;
    private _description: string | null = null;
    private _avatars: Avatar[] | null = null;
    private _color: string | null = null;

    /**
     * Constructor for the NodeElement
     * 
     * @param node The clownface GraphPointer that represents the node in the RDF graph
     */
    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The label of the node
     * 
     * @readonly
     * @link rdfs:label
     */
    get label(): string {
        if (this._label === null) {
            const labels = this._node.out(rdfs.labelNamedNode).values;
            if (labels.length > 1) {
                console.warn(`Multiple labels for ${this.iri}: ${labels.join(', ')}. Joining them with a comma.`);
                this._label = labels.join(', ');
            }
            else if (labels.length === 0) {
                console.warn(`No label for ${this.iri}. Defaulting to ''`);
                this._label = '';
            } else {
                this._label = labels[0];
            }
        }
        return this._label;
    }

    /**
     * Get the label of the class of the node
     * 
     * @readonly
     * @link rdf:type/^sh:targetNode/rdfs:label
     * 
     */
    get classLabel(): string[] {
        if (this._classLabel === null) {
            const labels = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(rdfs.labelNamedNode).values;
            if (labels.length === 0) {
                console.warn(`No class label for ${this.iri}. Defaulting to ''`);
                this._classLabel = [''];
            }
            this._classLabel = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(rdfs.labelNamedNode).values;
        }
        return this._classLabel;
    }
    /**
     * The description of the element.
     * 
     * @readonly
     * @link rdfs:comment
     */
    get description(): string {
        if (this._description === null) {
            const comments = this._node.out(rdfs.commentNamedNode).values;
            if (comments.length === 0) {
                this._description = '';
            } if (comments.length > 1) {
                console.warn(`Multiple descriptions for ${this.iri}. Joining them with a comma. This should not happen.`);
                this._description = comments.join(', ');
            } else {
                this._description = comments[0];
            }
        }
        return this._description;
    }

    /**
     * The avatar of the element.
     * 
     * @readonly
     */
    get avatars(): Avatar[] {
        if (this._avatars === null) {
            if (this._node.out(blueprint.hasAvatarNamedNode).values.length > 1) {
                debugger;
            }
            this._avatars = this._node.out(blueprint.hasAvatarNamedNode).map(avatarNode => {
                const colorIndex = avatarNode.out(blueprint.colorIndexNamedNode).values[0];
                return {
                    icon: avatarNode.out(blueprint.iconNamedNode).values[0] ?? DEFAULT_ICON,
                    color: colorIndex ? ColorUtil.getColorForIndexString(colorIndex) : DEFAULT_COLOR
                }
            })
        }
        return this._avatars;
    }

    /**
     * The color of the element.
     * 
     * @readonly
     */
    get color(): string {
        if (this._color === null) {
            this._color = this.avatars[0].color;
        }
        return this._color;
    }


}