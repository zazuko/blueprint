import { GraphPointer } from 'clownface';

import rdfEnvironment from '@zazuko/env';

import { rdfs, rdf, shacl } from "@blueprint/ontology";
import { ColorUtil } from '@blueprint/utils';
import { ClownfaceObject } from '../clownface-object/clownface-object';
import { RdfUiClassMetadata, UiClassMetadata } from '../ui-class-metadata/ui-class-metadata';

import { DEFAULT_ICON } from '@blueprint/constant/icon';
import { Avatar } from '@blueprint/component/avatar/avatar.component';

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
    private _uiClassMetadata: UiClassMetadata[] | null = null;
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
     * UiMetadata of the node.
     * 
     * @readonly
     * 
     * @link rdf:type/^sh:targetNode
     */
    private get uiClassMetadata(): UiClassMetadata[] {
        if (this._uiClassMetadata === null) {
            const uiClassMetadata = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).map(n => new RdfUiClassMetadata(n));
            if (uiClassMetadata.length === 0) {
                console.warn(`No UiClassMetadata found for ${this.iri}. This should not happen. There is no icon, color, ... configured for this node. Defaulting to default values.`);
                const rdfTypes = this._node.out(rdf.typeNamedNode).values;
                const defaultUiClassMetadatas = rdfTypes.map(rdfType => {
                    const defaultUIClassMetadata: UiClassMetadata = {
                        iri: this.iri + '/default/UiMetadata',
                        targetNode: rdfEnvironment.namedNode(rdfType),
                        icon: DEFAULT_ICON,
                        colorIndex: 0,
                        searchPriority: 0,
                        label: 'Default',
                        comment: 'No configuration for this node.',
                        color: ColorUtil.getColorForIndex(0)
                    };
                    return defaultUIClassMetadata;
                });
                this._uiClassMetadata = defaultUiClassMetadatas;
            } else {
                this._uiClassMetadata = uiClassMetadata;
            }
        }
        return this._uiClassMetadata;
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
            this._avatars = this.uiClassMetadata.map(uiMetadata => {
                return {
                    label: uiMetadata.label,
                    icon: uiMetadata.icon,
                    color: uiMetadata.color,
                    classIri: uiMetadata.targetNode.value
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
            this._color = this.uiClassMetadata[0].color;
        }
        return this._color;
    }


}