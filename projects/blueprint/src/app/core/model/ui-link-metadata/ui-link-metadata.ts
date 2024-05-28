import { GraphPointer, MultiPointer } from 'clownface';
import { ClownfaceObject } from '../clownface-object/clownface-object';
import { shacl } from '@blueprint/ontology';

/**
 * UiLinkMetadata Class
 * Shacl Shape to identify flux link shapes
 */
export class UiLinkMetadata extends ClownfaceObject {

    private _destination: string | null = null;
    private _source: string | null = null;
    private _path: MultiPointer | null = null;
    private _label: string | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The target of this Link
     * 
     * @readonly
     * @link shacl:class
     */
    public get destination(): string {
        if (this._destination === null) {
            const destinationNodeIris = this._node.out(shacl.classNamedNode).values;
            if (destinationNodeIris.length === 0) {
                console.warn(`UiLinkMetadata.destination is undefined for ${this._node.value}.`);
            } else if (destinationNodeIris.length > 1) {
                console.warn(`UiLinkMetadata.destination has multiple values for ${this._node.value}. Using the first one.`);
            }
            this._destination = destinationNodeIris[0] ?? '';
        }
        return this._destination;
    }

    /**
     * The source class of this Link
     * 
     * @readonly
     * @link shacl:targetClass
     */
    public get source(): string {
        if (this._source === null) {
            const sourceNodeIris = this._node.out(shacl.targetClassNamedNode).values;
            if (sourceNodeIris.length === 0) {
                console.warn(`UiLinkMetadata.source is undefined for ${this._node.value}.`);
            } else if (sourceNodeIris.length > 1) {
                console.warn(`UiLinkMetadata.source has multiple values for ${this._node.value}. Using the first one.`);
            }
            this._source = sourceNodeIris[0] ?? '';
        }
        return this._source;
    }

    /**
     * The path between Link source and destination
     * 
     * @readonly
     * @link shacl:path
     */
    public get path(): MultiPointer {
        if (this._path === null) {
            const pathNode = this._node.out(shacl.pathNamedNode);
            if (pathNode.values.length === 0) {
                console.warn(`UiLinkMetadata.path is undefined for ${this._node.value}.`);
            } else if (pathNode.values.length > 1) {
                console.warn(`UiLinkMetadata.path has multiple values for ${this._node.value}. Using the first one.`);
            }
            this._path = pathNode.toArray()[0];
        }
        return this._path;
    }

    /**
     * The text shown on the link arrow
     * 
     * @returns
     * @link shacl:name
     */
    public get label(): string {
        if (this._label === null) {
            const labels = this._node.out(shacl.nameNamedNode).values;
            if (labels.length === 0) {
                console.warn(`UiLinkMetadata.label is undefined for ${this._node.value}. Using an empty string.`);
                this._label = '';
                return this._label;
            } else if (labels.length > 1) {
                console.warn(`UiLinkMetadata.label has multiple values for ${this._node.value}. Joining them with a space.`);
                this._label = labels.join(' ');
            } else {
                this._label = labels[0];
            }
        }
        return this._label;
    }

}
