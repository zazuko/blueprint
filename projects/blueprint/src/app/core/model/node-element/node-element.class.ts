import { GraphPointer } from 'clownface';


import { rdfs, rdf, shacl } from "@blueprint/ontology";
import { ClownfaceObject } from '../clownface-object/clownface-object';
import { RdfUiClassMetadata, UiClassMetadata } from '../ui-class-metadata/ui-class-metadata';

import { Avatar } from 'projects/blueprint/src/app/shared/component/avatar/avatar.component';
import { rdfEnvironment } from '../../rdf/rdf-environment';
import { DEFAULT_ICON } from '@blueprint/constant/icon';
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

    #label: string | null = null;
    #classLabel: string[] | null = null;
    #description: string | null = null;
    #uiClassMetadata: UiClassMetadata[] | null = null;
    #avatars: Avatar[] | null = null;
    #color: string | null = null;

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
        if (this.#uiClassMetadata === null) {
            const uiClassMetadata = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).map(n => new RdfUiClassMetadata(n));
            if (uiClassMetadata.length === 0) {
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
                        color: DEFAULT_COLOR,
                    };
                    return defaultUIClassMetadata;
                });
                this.#uiClassMetadata = defaultUiClassMetadatas;
            } else {
                this.#uiClassMetadata = uiClassMetadata;
            }
        }
        return this.#uiClassMetadata;
    }
    /**
     * The label of the node
     * 
     * @readonly
     * @link rdfs:label
     */
    get label(): string {
        if (this.#label === null) {
            this.#label = ClownfaceObject.getLabelForNode(this._node);
        }
        return this.#label;
    }

    /**
     * Get the label of the class of the node
     * 
     * @readonly
     * @link rdf:type/^sh:targetNode/rdfs:label
     * 
     */
    get classLabel(): string[] {
        if (this.#classLabel === null) {
            const labelsFromBPUiConfig = this._node.out(rdf.typeNamedNode).in(shacl.targetNodeNamedNode).out(rdfs.labelNamedNode).values;
            if (labelsFromBPUiConfig.length > 0) {
                this.#classLabel = labelsFromBPUiConfig;
                return this.#classLabel;
            }
            const tBoxClassLabel = this._node.out(rdf.typeNamedNode).out(rdfs.labelNamedNode).values;
            if (tBoxClassLabel.length > 0) {
                this.#classLabel = tBoxClassLabel;
                return this.#classLabel;
            }
            const classIris = this._node.out(rdf.typeNamedNode).filter(node => node.value !== 'https://flux.described.at/UiNode').values.map(iri => rdfEnvironment.shrink(iri));
            console.log(this._node.out(rdf.typeNamedNode).filter(node => node.value !== 'https://flux.described.at/UiNode').values);
            if (classIris.length > 0) {
                this.#classLabel = classIris;
                return this.#classLabel;
            }
            this.#classLabel = [''];
        }

        return this.#classLabel;
    }
    /**
     * The description of the element.
     * 
     * @readonly
     * @link rdfs:comment
     */
    get description(): string {
        if (this.#description === null) {
            const comments = this._node.out(rdfs.commentNamedNode).values;
            if (comments.length === 0) {
                this.#description = '';
            } if (comments.length > 1) {
                console.warn(`Multiple descriptions for ${this.iri}. Joining them with a comma. This should not happen.`);
                this.#description = comments.join(', ');
            } else {
                this.#description = comments[0];
            }
        }
        return this.#description;
    }

    /**
     * The avatar of the element.
     * 
     * @readonly
     */
    get avatars(): Avatar[] {
        if (this.#avatars === null) {
            this.#avatars = this.uiClassMetadata.map(uiMetadata => {
                return {
                    label: uiMetadata.label,
                    icon: uiMetadata.icon,
                    color: uiMetadata.color
                }
            })
        }
        return this.#avatars;
    }

    /**
     * The color of the element.
     * 
     * @readonly
     */
    get color(): string {
        if (this.#color === null) {
            this.#color = this.uiClassMetadata[0].color;
        }
        return this.#color;
    }


}