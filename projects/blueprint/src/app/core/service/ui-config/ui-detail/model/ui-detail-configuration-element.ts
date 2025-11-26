import { GraphPointer } from "clownface";
import { rdfs, blueprint, shacl } from "@blueprint/ontology";

export interface UiDetailConfigurationElement {
    renderLiteralAs: LiteralRenderType;
    label: string;
    iri: string;
    order: number;
    path: string;
}

export class RdfDetailConfigurationElement implements UiDetailConfigurationElement {
    private _node: GraphPointer;

    private _iri: string | null = null;
    private _label: string | null = null;
    private _renderLiteralAs: LiteralRenderType | null = null;
    private _order: number | null = null;

    constructor(pointer: GraphPointer) {
        this._node = pointer;
    }

    get iri(): string {
        if (this._iri === null) {
            this._iri = this._node.value;
        }
        return this._iri;
    }

    get label(): string {
        if (this._label === null) {
            this._label = this._node.out(rdfs.labelNamedNode).value;
        }
        return this._label;
    }

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
                    this._renderLiteralAs = LiteralRenderType.PLAIN;
                    break;
                default:
                    this._renderLiteralAs = LiteralRenderType.UNKNOWN;
            }
        }
        return this._renderLiteralAs;
    }

    get renderLiteralAsNode(): string {
        return this._node.out(blueprint.showAsNamedNode).value;
    }

    get order(): number {
        if (this._order === null) {
            this._order = Number(this._node.out(shacl.orderNamedNode).value);
        }
        return this._order;
    }

    get path(): string {
        return this._node.out(shacl.pathNamedNode).value;
    }

    getSparqlDetailQueryForSubject(subjectIri: string): string {
        const path = this._node.out(shacl.pathNamedNode).value;
        const label = this.label;
        const iri = this.iri;
        const order = this.order;
        const rendererIri = this._node.out(blueprint.showAsNamedNode).value;

        return `
        ${blueprint.sparqlPrefix()}
        ${rdfs.sparqlPrefix()}
        ${shacl.sparqlPrefix()}

        CONSTRUCT {
            <${subjectIri}> ${blueprint.detailPrefixed} <${iri}> .
            <${iri}> ${rdfs.labelPrefixed} "${label}" .
            <${iri}> ${shacl.orderPrefixed} ${order} .
            <${iri}> ${blueprint.showAsPrefixed} <${rendererIri}> .
            <${iri}> ${blueprint.valuePrefixed} ?literal .
        } WHERE {
            <${subjectIri}> <${path}> ?literal .
        }
        `;
    }
}

export enum LiteralRenderType {
    PLAIN = 'PLAIN',
    LINK = 'LINK',
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
    BOOLEAN = 'BOOLEAN',
    UNKNOWN = 'UNKNOWN'
}

