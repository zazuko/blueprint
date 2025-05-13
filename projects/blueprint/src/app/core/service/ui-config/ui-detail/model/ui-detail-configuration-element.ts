import { GraphPointer } from "clownface";
import { rdfs, blueprint, shacl } from "@blueprint/ontology";
import { NamedNode } from "@rdfjs/types";
import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";

export interface UiDetailConfigurationElement {
    renderLiteralAs: LiteralRenderType;
    label: string;
    iri: string;
    order: number;
}

export class RdfDetailConfigurationElement extends ClownfaceObject implements UiDetailConfigurationElement {

    #_label: string | null = null;
    #_renderLiteralAs: LiteralRenderType | null = null;
    #_order: number | null = null;

    constructor(pointer: GraphPointer) {
        super(pointer);
    }
    get label(): string {
        if (this.#_label === null) {
            this.#_label = this._node.out(rdfs.labelNamedNode).value;
        }
        return this.#_label;
    }

    get renderLiteralAs(): LiteralRenderType {
        if (this.#_renderLiteralAs === null) {
            const rendererIri = this._node.out(blueprint.showAsNamedNode).value;
            switch (rendererIri) {
                case 'https://ld.flux.zazuko.com/shapes/metadata/Link':
                    this.#_renderLiteralAs = LiteralRenderType.LINK;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Email':
                    this.#_renderLiteralAs = LiteralRenderType.EMAIL;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/PhoneNumber':
                    this.#_renderLiteralAs = LiteralRenderType.PHONE;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Plain':
                    this.#_renderLiteralAs = LiteralRenderType.PLAIN;
                    break;
                case 'https://ld.flux.zazuko.com/shapes/metadata/Boolean':
                    this.#_renderLiteralAs = LiteralRenderType.PLAIN;
                    break;
                default:
                    this.#_renderLiteralAs = LiteralRenderType.UNKNOWN;
            }
        }
        return this.#_renderLiteralAs;
    }

    get order(): number {
        if (this.#_order === null) {
            this.#_order = Number(this._node.out(shacl.orderNamedNode).value);
        }
        return this.#_order;
    }

    getSparqlDetailQueryForSubject(subjectNode: NamedNode): string {
        const path = this._node.out(shacl.pathNamedNode).value;
        const label = this.label;
        const iri = this.iri;
        const order = this.order;
        const rendererIri = this._node.out(blueprint.showAsNamedNode).value;

        const sparqlQueryForUiDetails = `
        ${blueprint.sparqlPrefix()}
        ${rdfs.sparqlPrefix()}
        ${shacl.sparqlPrefix()}

        CONSTRUCT {
            <${subjectNode.value}> ${blueprint.detailPrefixed} <${iri}> .
            <${iri}> ${rdfs.labelPrefixed} "${label}" .
            <${iri}> ${shacl.orderPrefixed} ${order} .
            <${iri}> ${blueprint.showAsPrefixed} <${rendererIri}> .
            <${iri}> ${blueprint.valuePrefixed} ?literal .
        } WHERE {
            <${subjectNode.value}> <${path}> ?literal .
        }
        `;

        return sparqlQueryForUiDetails;
    }
}

export enum LiteralRenderType {
    PLAIN = 'PLAIN',
    LINK = 'LINK',
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
    BOOLEAN = 'BOOLEAN',
    HIDDEN = 'HIDDEN',
    UNKNOWN = 'UNKNOWN'
}

