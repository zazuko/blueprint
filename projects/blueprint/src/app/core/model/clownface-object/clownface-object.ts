import { GraphPointer } from "clownface";
import rdfEnvironment from '@zazuko/env';

/**
 * Base class for all objects that are represented by a node in the RDF graph. It provides some basic functionality to
 * access the node and its predicates. It is a wrapper around the clownface GraphPointer.
 * 
 */
export abstract class ClownfaceObject {
    /**
     * This is a helper function that returns all predicates that are used in the dataset of the given node.
     * 
     * @param node The clownface GraphPointer
     * @returns An array of all predicates that are used in the dataset of the node
     */
    static getPredicatesForNode(node: GraphPointer): string[] {
        const predicateSet = new Set<string>([...node.dataset.match(rdfEnvironment.namedNode(node.value))].map(quad => quad.predicate.value));
        return [...predicateSet];
    }

    static logTable(node: GraphPointer): void {
        console.table([...node.dataset.match(rdfEnvironment.namedNode(node.value))].map(quad => {
            return {
                subject: quad.subject.value,
                predicate: quad.predicate.value,
                object: quad.object.value
            };
        }));
    }

    protected readonly _node: GraphPointer;

    /**
     * Constructor for the ClownfaceObject
     * 
     * @param node The clownface GraphPointer that represents the node in the RDF graph
     */
    constructor(node: GraphPointer) {
        this._node = node;
    }

    /**
     * Returns the IRI of the node in the RDF graph
     * 
     * @returns The IRI of the node
     */
    get iri(): string {
        return this._node.value;
    }

    /**
     * Returns predicates that are available for the node in the RDF graph
     * 
     * @returns The clownface GraphPointer that represents the node
     */
    availablePredicates(): string[] {
        return ClownfaceObject.getPredicatesForNode(this._node);
    }

    /**
     * Logs the predicates of the node in the RDF graph to the console
     */
    logTable(): void {
        ClownfaceObject.logTable(this._node);
    }
}