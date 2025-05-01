

import { blueprint, rdfs, shacl } from '@blueprint/ontology';

import { ClownfaceObject } from '../clownface-object/clownface-object';
import { GraphPointer } from 'clownface';
import { DEFAULT_COLOR } from '@blueprint/constant/color';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { ColorUtil } from '../../utils/color-util';

/**
 * UiClassMetadata Interface
 */
export interface UiClassMetadata {
    iri: string,
    targetNode: RdfTypes.NamedNode | RdfTypes.BlankNode | null;
    icon: string;
    colorIndex: number;
    searchPriority: number;
    label: string;
    comment: string;
    color: string;
}
/**
 * RdfUiClassMetadata Class. It is an implementation of UiClassMetadata for Clownface.
 */
export class RdfUiClassMetadata extends ClownfaceObject implements UiClassMetadata {

    private _targetNode: RdfTypes.NamedNode | RdfTypes.BlankNode | null = null;
    private _icon: string | null = null;
    private _colorIndex: number | null = null;
    private _searchPriority: number | null = null;
    private _label: string | null = null;
    private _comment: string | null = null;
    private _color: string | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * Get the target 
     * 
     * @readonly
     * @link shacl:targetNode
     */
    public get targetNode(): RdfTypes.NamedNode | RdfTypes.BlankNode | null {
        if (this._targetNode === null) {
            const targetNodes = this._node.out(shacl.targetNodeNamedNode).terms;
            if (targetNodes.length === 0) {
                console.warn(`No target node found for <${this._node.value}. Consider using shacl:targetNode to define the target node.`);
                this._targetNode = null;
                return this._targetNode;
            } if (targetNodes.length > 1) {
                console.warn(`Multiple target nodes found for <${this._node.value}.\nMultiple target nodes are not supported. Just the first one will be used.`);
            }
            const n = targetNodes[0];
            if (n.termType === 'BlankNode') {
                this._targetNode = rdfEnvironment.blankNode(n.value);
            } else if (n.termType === 'NamedNode') {
                this._targetNode = rdfEnvironment.namedNode(n.value);
            } else {
                console.warn(`Invalid target node type for <${this._node.value}. Only NamedNode and BlankNode are supported. Term type is ${n.termType}`);
                this._targetNode = null;
            }

        }
        return this._targetNode;
    }

    /**
     * The icon of the type.
     * 
     * @readonly
     * @link blueprint:faIcon
     */
    public get icon(): string {
        if (this._icon === null) {
            const icons = this._node.out(blueprint.faIconNamedNode).values;
            if (icons.length === 0) {
                console.warn(`No icon found for <${this._node.value}. Consider using blueprint:faIcon to define the icon.`);
                this._icon = '';
                return this.icon;
            } else if (icons.length > 1) {
                console.warn(`Multiple icons found for <${this._node.value}.\nMultiple icons are not supported. Just the first one will be used.`);
            }
            this._icon = icons[0];
        }
        return this._icon;
    }


    /**
     * Color index
     * 
     * @readonly
     * @link blueprint:colorIndex
     */
    public get colorIndex(): number {
        if (this._colorIndex === null) {
            const colorIndex = this._node.out(blueprint.colorIndexNamedNode).values;
            if (colorIndex.length === 0) {
                console.warn(`No color index found for <${this._node.value}. Consider using blueprint:colorIndex to define the color index. Defaulting to '${DEFAULT_COLOR}'.`);
                this._colorIndex = 0;
                return this._colorIndex;
            } else if (colorIndex.length > 1) {
                console.warn(`Multiple color indexes found for <${this._node.value}.\nMultiple color indexes are not supported. Just the first one will be used.`);
            }
            // check if the color index is a number
            const colorNumber = Number(colorIndex[0]);
            if (isNaN(colorNumber)) {
                console.warn(`Invalid color index found for <${this._node.value}. Color index must be a number current value ${colorIndex[0]}. Defaulting to 0.`);
                this._colorIndex = 0;
                return this._colorIndex;
            }
            this._colorIndex = colorNumber;
        }
        return this._colorIndex;
    }

    /**
     * The color of this type.
     * 
     * @readonly
     */
    public get color(): string {
        if (this._color === null) {
            this._color = ColorUtil.getColorForIndex(this.colorIndex);
        }
        return this._color;
    }

    /**
     * Search priority is a multiplier for the search score.
     * 
     * @readonly
     */
    public get searchPriority(): number {
        if (this._searchPriority === null) {
            const searchPriority = this._node.out(blueprint.searchPriorityNamedNode).values;
            if (searchPriority.length === 0) {
                console.warn(`No search priority found for <${this._node.value}. Consider using blueprint:searchPriority to define the search priority. Defaulting to 1.`);
                this._searchPriority = 1;
                return this._searchPriority;
            } else if (searchPriority.length > 1) {
                console.warn(`Multiple search priorities found for <${this._node.value}.\nMultiple search priorities are not supported. Just the first one will be used.`);
            }
            // check if the search priority is a number
            const searchPriorityNumber = Number(searchPriority[0]);
            if (isNaN(searchPriorityNumber)) {
                console.warn(`Invalid search priority found for <${this._node.value}. Search priority must be a number current value ${searchPriority[0]}. Defaulting to 1.`);
                this._searchPriority = 1;
                return this.searchPriority;
            }
            this._searchPriority = searchPriorityNumber;
        }
        return this._searchPriority;
    }

    /**
     * The label of this metadata. This is the name for this type. 
     * 
     * @readonly
     * @link rdfs:label
     */
    public get label(): string {
        if (this._label === null) {
            const label = this._node.out(rdfs.labelNamedNode).values;
            if (label.length === 0) {
                console.warn(`No label found for <${this._node.value}. Consider using rdfs:label to define the label.`);
                this._label = '';
                return this.label;
            } else if (label.length > 1) {
                console.warn(`Multiple labels found for <${this._node.value}.\nMultiple labels are not supported. Just the first one will be used.`);
            }
            this._label = label[0];
        }
        return this._label;
    }

    /**
     * The comment of this class
     * 
     * @readonly
     * 
     * @link rdfs:comment
     */
    public get comment(): string {
        if (this._comment === null) {
            const comment = this._node.out(rdfs.commentNamedNode).values;
            if (comment.length === 0) {
                console.warn(`No comment found for <${this._node.value}. Consider using rdfs:comment to define the comment.`);
                this._comment = '';
                return this._comment;
            } else if (comment.length > 1) {
                console.warn(`Multiple comments found for <${this._node.value}.\nMultiple comments are not supported. Just the first one will be used.`);
            }
            this._comment = comment[0];
        }

        return this._comment;
    }

}
