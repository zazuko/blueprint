import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object"
import { LiteralRenderType } from "../model/ui-detail-configuration-element";
import { RdfTypes } from "../../../../rdf/rdf-environment";
import { GraphPointer } from "clownface";
import { blueprint, rdfs, shacl } from "@blueprint/ontology";

export interface LiteralPresentationRule {
    readonly iri: string,
    readonly label: string,
    readonly renderLiteralAs: LiteralRenderType,
    readonly order: number,
    readonly path: RdfTypes.NamedNode,
    readonly targetClass: RdfTypes.NamedNode[],
}

export class RdfLiteralPresentationRule extends ClownfaceObject implements LiteralPresentationRule {
    #label: string | null = null;
    #renderLiteralAs: LiteralRenderType | null = null;
    #order: number | null = null;
    #linkLabel: string | undefined | null = null;
    #path: RdfTypes.NamedNode | null = null;
    #tragetClass: RdfTypes.NamedNode[] | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    get label(): string {
        if (this.#label === null) {
            const labels = this._node.out(this._node.namedNode(rdfs.labelNamedNode)).values;
            console.assert(labels.length > 0, 'Label is not defined');
            console.assert(labels.length === 1, 'Label is not unique');
            this.#label = labels[0];
        }
        return this.#label;
    }

    get renderLiteralAs(): LiteralRenderType {
        if (this.#renderLiteralAs === null) {
            const rendererIri = this._node.out(this._node.namedNode(blueprint.showAsNamedNode)).value;
            switch (rendererIri) {
                case 'https://ld.flux.zazuko.com/shapes/metadata/Link':
                    this.#renderLiteralAs = LiteralRenderType.LINK;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Email':
                    this.#renderLiteralAs = LiteralRenderType.EMAIL;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/PhoneNumber':
                    this.#renderLiteralAs = LiteralRenderType.PHONE;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Plain':
                    this.#renderLiteralAs = LiteralRenderType.PLAIN;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Boolean':
                    this.#renderLiteralAs = LiteralRenderType.PLAIN;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Hidden':
                    this.#renderLiteralAs = LiteralRenderType.HIDDEN;
                    break;
                default:
                    this.#renderLiteralAs = LiteralRenderType.UNKNOWN;
            }
        }
        return this.#renderLiteralAs;
    }

    get order(): number {
        if (this.#order === null) {
            const order = this._node.out(this._node.namedNode(shacl.orderNamedNode)).value;
            console.assert(order !== null, 'Order is not defined');
            this.#order = Number(order);
        }
        return this.#order;
    }

    get path(): RdfTypes.NamedNode {
        if (this.#path === null) {
            const paths = this._node.out(shacl.pathNamedNode).terms;
            if (paths.length === 0) {
                throw new Error('sh:path is not defined for ' + this.iri);
            }
            if (paths.length > 1) {
                console.warn('sh:path is not unique for <' + this.iri + '>, using first one');
            }
            this.#path = paths[0] as RdfTypes.NamedNode;
        }
        return this.#path;
    }

    get linkLabel(): string | null {
        if (this.#linkLabel === undefined) {
            const labels = this._node.out(this._node.namedNode(rdfs.labelNamedNode)).values;
            if (labels.length === 0) {
                this.#linkLabel = null;
            } else {
                if (labels.length > 1) {
                    console.warn('Link label is not unique for <' + this.iri + '>, using first one');
                }
                this.#linkLabel = labels[0];
            }
        }
        return this.#linkLabel;
    }

    get targetClass(): RdfTypes.NamedNode[] {
        if (this.#tragetClass === null) {
            const classes = this._node.out(shacl.targetClassNamedNode).terms;
            if (classes.length === 0) {
                console.warn('sh:targetClass is not defined for ' + this.iri);
                this.#tragetClass = [];
            } else {
                this.#tragetClass = classes as RdfTypes.NamedNode[];
            }
        }
        return this.#tragetClass;
    }

}