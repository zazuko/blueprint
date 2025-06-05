import { GraphPointer } from "clownface";

import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { rdf, rdfs, schema } from "@blueprint/ontology";
import { RdfTypes } from "../rdf-environment";
import { sortLiteralsByBrowserLanguage } from "../../utils/language-prededence";
import { createPredicateAboxQuery } from "./query/create-predicate-abox.query";

export class PredicateTBox extends ClownfaceObject {

    static getPredicateAboxQuery(predicateIri: string): string {
        return createPredicateAboxQuery(predicateIri);
    }

    #label: string | undefined = undefined;
    #comment: string | undefined = undefined;

    #domain: string[] | undefined = undefined;
    #range: string[] | undefined = undefined;

    #type: string[] | undefined = undefined;

    #domainIncludes: string[] | undefined = undefined;
    #rangeIncludes: string[] | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
    }

    get type(): string[] {
        if (this.#type === undefined) {
            this.#type = this._node.out(rdf.typeNamedNode).values;
        }
        return this.#type;
    }

    get label(): string | undefined {
        if (this.#label === undefined) {
            this.#label = ClownfaceObject.getLabelForNode(this._node);
        }
        return this.#label;
    }

    get comment(): string {
        if (this.#comment === undefined) {
            // todo: implement getCommentForNode
            // this.#comment = ClownfaceObject.getCommentForNode(this._node);
            const commentLiterals = this._node.out(rdfs.commentNamedNode).terms as RdfTypes.Literal[];
            this.#comment = sortLiteralsByBrowserLanguage(commentLiterals)[0]?.value || '';
        }
        return this.#comment;
    }

    get domain(): string[] {
        if (this.#domain === undefined) {
            this.#domain = this._node.out(rdfs.domainNamedNode).values;
        }
        return this.#domain;
    }

    get range(): string[] {
        if (this.#range === undefined) {
            this.#range = this._node.out(rdfs.rangeNamedNode).values;
        }
        return this.#range;
    }

    get domainIncludes(): string[] {
        if (this.#domainIncludes === undefined) {
            this.#domainIncludes = this._node.out(schema.domainIncludesNamedNode).values;
        }
        return this.#domainIncludes;
    }

    get rangeIncludes(): string[] {
        if (this.#rangeIncludes === undefined) {
            this.#rangeIncludes = this._node.out(schema.rangeIncludesNamedNode).values;
        }
        return this.#rangeIncludes;
    }
}