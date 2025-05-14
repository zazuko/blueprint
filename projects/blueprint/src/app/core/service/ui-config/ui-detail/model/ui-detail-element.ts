import { GraphPointer } from "clownface";

import { flux, rdfs, shacl } from "@blueprint/ontology";

import { LiteralRenderType } from "./ui-detail-configuration-element";
import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { RdfTypes } from "../../../../rdf/rdf-environment";

/**
 * The interface for a UI detail element.
 * 
 * @alias blueprint:UiDetailElement
 * @readonly
 */

export interface IUiDetailElement {
    renderLiteralAs: LiteralRenderType;
    label: string;
    iri: string;
    order: number;
    linkLabel?: string;
    value: RdfTypes.Literal[];
    path: string;
}

/**
 * A UI detail element.
 * This is an implementation of UiDetailElement using clownface.
 * 
 */
export class RdfDetailElement extends ClownfaceObject implements IUiDetailElement {

    #label: string | null = null;
    #renderLiteralAs: LiteralRenderType | null = null;
    #order: number | null = null;
    #linkLabel: string | undefined | null = null;
    #value: RdfTypes.Literal[] | null = null;
    #path: string | null = null;


    constructor(pointer: GraphPointer) {
        super(pointer);
    }

    /**
    * The label of the element.
    * 
    * @alias rdfs:label
    * @readonly
    */
    get label(): string {
        if (this.#label === null) {
            this.#label = this._node.out(rdfs.labelNamedNode).value;
        }
        return this.#label;
    }

    /**
     * The type of the literal.
     * 
     * @alias blueprint:showAs
     * @readonly
     */
    get renderLiteralAs(): LiteralRenderType {
        if (this.#renderLiteralAs === null) {
            const rendererIri = this._node.out(flux.showAsNamedNode).value;
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
                    this.#renderLiteralAs = LiteralRenderType.BOOLEAN;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Hidden':
                    this.#renderLiteralAs = LiteralRenderType.HIDDEN;
                    break;
                default:
                    console.log('Unknown render type: ' + rendererIri);
                    this.#renderLiteralAs = LiteralRenderType.UNKNOWN;
            }
        }
        return this.#renderLiteralAs;
    }

    /**
     * The order of the element.
     * 
     * @alias sh:order
     * @readonly
     */
    get order(): number {
        if (this.#order === null) {
            this.#order = Number(this._node.out(shacl.orderNamedNode).value ?? 99);
        }
        return this.#order;
    }

    /**
    * The label for the link. If not set, the label will be used.
    * This is the string shown in the <a> tag. <a href="...">linkLabel</a>.
    * 
    * @alias blueprint:linkLabel
    * @readonly
    */
    get linkLabel(): string | undefined {
        if (this.#linkLabel === null) {
            this.#linkLabel = this._node.out(flux.linkLabelNamedNode).value;
        }
        return this.#linkLabel;
    }

    /**
     * The value of the element.
     * 
     * @alias blueprint:value
     * @readonly
     */
    get value(): RdfTypes.Literal[] {
        if (this.#value === null) {
            this.#value = this._node.out(flux.valueNamedNode).map((prt) => {
                return prt.term as RdfTypes.Literal;
            });
        }
        return this.#value;
    }

    get path(): string {
        if (this.#path === null) {
            const paths = this._node.out(shacl.pathNamedNode).values;
            if (paths.length === 0) {
                throw new Error('Path is empty');
            }
            if (paths.length > 1) {
                console.warn('Path has more than one value. Using the first one.');
            }
            this.#path = paths[0];

        }
        return this.#path;
    }

}