import { GraphPointer } from "clownface";

import { blueprint, rdfs, shacl } from "@blueprint/ontology";

import { LiteralRenderType } from "./ui-detail-configuration-element";


export interface IUiDetailElement {
    renderLiteralAs: LiteralRenderType;
    label: string;
    iri: string;
    order: number;
    linkLabel?: string;
    value: string[];
}

/**
 * A UI detail element.
 * This is an implementation of UiDetailElement using clownface.
 * 
 */
export class RdfDetailElement implements IUiDetailElement {

    private _node: GraphPointer;
    private _iri: string | null = null;
    private _label: string | null = null;
    private _renderLiteralAs: LiteralRenderType | null = null;
    private _order: number | null = null;
    private _linkLabel: string | undefined | null = null;
    private _value: string[] | null = null;

    constructor(pointer: GraphPointer) {
        this._node = pointer;
    }

    /**
     * The IRI of the element.
     * 
     * @readonly
     */
    get iri(): string {
        if (this._iri === null) {
            this._iri = this._node.value;
        }
        return this._iri;
    }

    /**
    * The label of the element.
    * 
    * @alias rdfs:label
    * @readonly
    */
    get label(): string {
        if (this._label === null) {
            this._label = this._node.out(rdfs.labelNamedNode).value;
        }
        return this._label;
    }

    /**
     * The type of the literal.
     * 
     * @alias blueprint:showAs
     * @readonly
     */
    get renderLiteralAs(): LiteralRenderType {
        if (this._renderLiteralAs === null) {
            const rendererIri = this._node.out(blueprint.showAsNamedNode).value;
            switch (rendererIri) {
                case 'https://ld.flux.zazuko.com/shapes/metadata/Link':
                    this._renderLiteralAs = LiteralRenderType.LINK;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Email':
                    this._renderLiteralAs = LiteralRenderType.EMAIL;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/PhoneNumber':
                    this._renderLiteralAs = LiteralRenderType.PHONE;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Plain':
                    this._renderLiteralAs = LiteralRenderType.PLAIN;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Boolean':
                    this._renderLiteralAs = LiteralRenderType.BOOLEAN;
                    break;
                default:
                    console.log('Unknown render type: ' + rendererIri);
                    this._renderLiteralAs = LiteralRenderType.UNKNOWN;
            }
        }
        return this._renderLiteralAs;
    }

    /**
     * The order of the element.
     * 
     * @alias sh:order
     * @readonly
     */
    get order(): number {
        if (this._order === null) {
            this._order = Number(this._node.out(shacl.orderNamedNode).value ?? 99);
        }
        return this._order;
    }

    /**
    * The label for the link. If not set, the label will be used.
    * This is the string shown in the <a> tag. <a href="...">linkLabel</a>.
    * 
    * @alias blueprint:linkLabel
    * @readonly
    */
    get linkLabel(): string | undefined {
        if (this._linkLabel === null) {
            this._linkLabel = this._node.out(blueprint.linkLabelNamedNode).value;
        }
        return this._linkLabel;

    }

    /**
     * The value of the element.
     * 
     * @alias blueprint:value
     * @readonly
     */
    get value(): string[] {
        if (this._value === null) {
            this._value = this._node.out(blueprint.valueNamedNode).values;
        }
        return this._value;
    }

}