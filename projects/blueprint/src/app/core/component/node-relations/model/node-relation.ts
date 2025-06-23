import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { flux, rdf, rdfs, schema } from "@blueprint/ontology";
import { GraphPointer } from "clownface";


export abstract class RdfNodeRelation extends ClownfaceObject {
    #count: number | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
    }


    get count(): number {
        if (this.#count === undefined) {
            const counts = this._node.out(flux.countNamedNode).values;
            if (counts.length > 0) {
                this.#count = counts[0] ? parseInt(counts[0], 10) : 0;
            } else {
                this.#count = 0;
            }
        }
        return this.#count;
    }

    abstract get relationType(): 'Bidirectional' | 'Incoming' | 'Outgoing';




}

export class BidiractionalRelation extends RdfNodeRelation {

    #incomingPredicate: string | undefined = undefined;
    #incomintPredicateLabel: string | undefined = undefined;
    #outgoingPredicate: string | undefined = undefined;
    #outgoingPredicateLabel: string | undefined = undefined;

    #doamin: string[] | undefined = undefined;
    #range: string[] | undefined = undefined;

    #domainIncludes: string[] | undefined = undefined;
    #rangeIncludes: string[] | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
        // check type
        if (!this._node.has(rdf.typeNamedNode, flux.BidirectionalRelationNamedNode).value) {
            throw new Error(`Node <${this._node.value}> is not a bidirectional relation.`);
        }
    }

    override get relationType(): 'Bidirectional' | 'Incoming' | 'Outgoing' {
        return 'Bidirectional';
    }

    get incomingPredicate(): string {
        if (this.#incomingPredicate === undefined) {
            const predicates = this._node.out(flux.hasIncomingPredicateNamedNode).values;
            if (predicates.length > 0) {
                if (predicates.length > 1) {
                    console.warn(`Multiple incoming predicates for <${this._node.value}> found, using the first one.`);
                }
                this.#incomingPredicate = predicates[0];
            } else {
                throw new Error(`No incoming predicate found for <${this._node.value}>`);
            }

        }
        return this.#incomingPredicate;
    }

    get incomingPredicateLabel(): string {
        if (this.#incomintPredicateLabel === undefined) {
            const labels = this._node.out(flux.hasIncomingPredicateNamedNode).map(p => ClownfaceObject.getLabelForNode(p));
            if (labels.length > 0) {
                this.#incomintPredicateLabel = labels[0];
            } else {
                throw new Error(`No incoming predicate label found for <${this._node.value}>`);
            }
        }
        return this.#incomintPredicateLabel;
    }

    get outgoingPredicate(): string {
        if (this.#outgoingPredicate === undefined) {
            const predicates = this._node.out(flux.hasOutgoingPredicateNamedNode).values;
            if (predicates.length > 0) {
                if (predicates.values.length > 1) {
                    console.warn(`Multiple outgoing predicates for <${this._node.value}> found, using the first one.`);
                }
                this.#outgoingPredicate = predicates[0];
            } else {
                throw new Error(`No outgoing predicate found for <${this._node.value}>`);
            }
        }
        return this.#outgoingPredicate;
    }

    get outgoingPredicateLabel(): string {
        if (this.#outgoingPredicateLabel === undefined) {
            const labels = this._node.out(flux.hasOutgoingPredicateNamedNode).map(p => ClownfaceObject.getLabelForNode(p));
            if (labels.length > 0) {
                this.#outgoingPredicateLabel = labels[0];
            } else {
                throw new Error(`No outgoing predicate label found for <${this._node.value}>`);
            }
        }
        return this.#outgoingPredicateLabel;
    }

    get domain(): string[] {
        if (this.#doamin === undefined) {
            this.#doamin = this._node.out(flux.hasOutgoingPredicateNamedNode).out(rdfs.domainNamedNode).values
        }
        return this.#doamin;
    }

    get range(): string[] {
        if (this.#range === undefined) {
            this.#range = this._node.out(flux.hasOutgoingPredicateNamedNode).out(rdfs.rangeNamedNode).values;
        }
        return this.#range;
    }

    get rangeIncludes(): string[] {
        if (this.#rangeIncludes === undefined) {
            this.#rangeIncludes = this._node.out(flux.hasOutgoingPredicateNamedNode).out(schema.rangeIncludesNamedNode).values;
        }
        return this.#rangeIncludes;
    }

    get domainIncludes(): string[] {
        if (this.#domainIncludes === undefined) {
            this.#domainIncludes = this._node.out(flux.hasOutgoingPredicateNamedNode).out(schema.domainIncludesNamedNode).values;
        }
        return this.#domainIncludes;
    }
}


export class IncomingRelation extends RdfNodeRelation {
    #incomingPredicate: string | undefined = undefined;
    #incomintPredicateLabel: string | undefined = undefined;


    #doamin: string[] | undefined = undefined;
    #range: string[] | undefined = undefined;

    #domainIncludes: string[] | undefined = undefined;
    #rangeIncludes: string[] | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
        // check type
        if (!this._node.has(rdf.typeNamedNode, flux.IncomingRelationNamedNode).value) {
            throw new Error(`Node <${this._node.value}> is not an incoming relation.`);
        }
    }

    override get relationType(): 'Bidirectional' | 'Incoming' | 'Outgoing' {
        return 'Incoming';
    }
    get incomingPredicate(): string {
        if (this.#incomingPredicate === undefined) {
            const predicates = this._node.out(flux.hasIncomingPredicateNamedNode).values;
            if (predicates.length > 0) {
                if (predicates.length > 1) {
                    console.warn(`Multiple incoming predicates for <${this._node.value}> found, using the first one.`);
                }
                this.#incomingPredicate = predicates[0];
            } else {
                throw new Error(`No incoming predicate found for <${this._node.value}>`);
            }

        }
        return this.#incomingPredicate;
    }

    get incomingPredicateLabel(): string {
        if (this.#incomintPredicateLabel === undefined) {
            const labels = this._node.out(flux.hasIncomingPredicateNamedNode).map(p => ClownfaceObject.getLabelForNode(p));
            if (labels.length > 0) {
                this.#incomintPredicateLabel = labels[0];
            } else {
                throw new Error(`No incoming predicate label found for <${this._node.value}>`);
            }
        }
        return this.#incomintPredicateLabel;
    }


    get domain(): string[] {
        if (this.#doamin === undefined) {
            this.#doamin = this._node.out(flux.hasIncomingPredicateNamedNode).out(rdfs.domainNamedNode).values
        }
        return this.#doamin;
    }

    get range(): string[] {
        if (this.#range === undefined) {
            this.#range = this._node.out(flux.hasIncomingPredicateNamedNode).out(rdfs.rangeNamedNode).values;
        }
        return this.#range;
    }

    get rangeIncludes(): string[] {
        if (this.#rangeIncludes === undefined) {
            this.#rangeIncludes = this._node.out(flux.hasOutgoingPredicateNamedNode).out(schema.rangeIncludesNamedNode).values;
        }
        return this.#rangeIncludes;
    }

    get domainIncludes(): string[] {
        if (this.#domainIncludes === undefined) {
            this.#domainIncludes = this._node.out(flux.hasOutgoingPredicateNamedNode).out(schema.domainIncludesNamedNode).values;
        }
        return this.#domainIncludes;
    }

}

export class OutgoingRelation extends RdfNodeRelation {
    #outgoingPredicate: string | undefined = undefined;
    #outgoingPredicateLabel: string | undefined = undefined;

    #doamin: string[] | undefined = undefined;
    #range: string[] | undefined = undefined;

    #domainIncludes: string[] | undefined = undefined;
    #rangeIncludes: string[] | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
        // check type
        if (!this._node.has(rdf.typeNamedNode, flux.OutgoingRelationNamedNode).value) {
            throw new Error(`Node <${this._node.value}> is not an outgoing relation.`);
        }
    }

    override get relationType(): 'Bidirectional' | 'Incoming' | 'Outgoing' {
        return 'Outgoing';
    }

    get outgoingPredicate(): string {
        if (this.#outgoingPredicate === undefined) {
            const predicates = this._node.out(flux.hasOutgoingPredicateNamedNode).values;
            if (predicates.length > 0) {
                if (predicates.length > 1) {
                    console.warn(`Multiple outgoing predicates for <${this._node.value}> found, using the first one.`);
                }
                this.#outgoingPredicate = predicates[0];
            } else {
                throw new Error(`No outgoing predicate found for <${this._node.value}>`);
            }
        }
        return this.#outgoingPredicate;
    }

    get outgoingPredicateLabel(): string {
        if (this.#outgoingPredicateLabel === undefined) {
            const labels = this._node.out(flux.hasOutgoingPredicateNamedNode).map(p => ClownfaceObject.getLabelForNode(p));
            if (labels.length > 0) {
                this.#outgoingPredicateLabel = labels[0];
            } else {
                throw new Error(`No outgoing predicate label found for <${this._node.value}>`);
            }
        }
        return this.#outgoingPredicateLabel;
    }


    get domain(): string[] {
        if (this.#doamin === undefined) {
            this.#doamin = this._node.out(flux.hasOutgoingPredicateNamedNode).out(rdfs.domainNamedNode).values
        }
        return this.#doamin;
    }

    get range(): string[] {
        if (this.#range === undefined) {
            this.#range = this._node.out(flux.hasOutgoingPredicateNamedNode).out(rdfs.rangeNamedNode).values;
        }
        return this.#range;
    }

    get rangeIncludes(): string[] {
        if (this.#rangeIncludes === undefined) {
            this.#rangeIncludes = this._node.out(flux.hasOutgoingPredicateNamedNode).out(schema.rangeIncludesNamedNode).values;
        }
        return this.#rangeIncludes;
    }

    get domainIncludes(): string[] {
        if (this.#domainIncludes === undefined) {
            this.#domainIncludes = this._node.out(flux.hasOutgoingPredicateNamedNode).out(schema.domainIncludesNamedNode).values;
        }
        return this.#domainIncludes;
    }
}