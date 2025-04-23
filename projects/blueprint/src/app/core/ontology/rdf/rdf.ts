

import { rdfEnvironment, NamespaceBuilder, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class RdfOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'rdf';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the type predicate.
     * 
     * @readonly
     */
    get type(): string {
        return this.namespace('type').value;
    }

    /**
     * Get the prefixed type predicate.
     * 
     * @readonly
     */
    get typePrefixed(): string {
        return `${this.prefix()}:type`;
    }

    /**
     * Get the label predicate as NamedNode.
     */

    get typeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('type');
    }

    /**
     * Get the subclassOf predicate.
     * 
     * @readonly
     */
    get subclassOf(): string {
        return this.namespace('subclassOf').value;
    }

    /**
     * Get the prefixed subclassOf predicate.
     * 
     * @readonly
     */
    get subclassOfPrefixed(): string {
        return `${this.prefix()}:subclassOf`;
    }

    /**
     * Get the subclassOf predicate as NamedNode.
     * 
     * @readonly
     */
    get subclassOfNamedNode(): RdfTypes.NamedNode {
        return this.namespace('subclassOf');
    }

}

export const rdf = new RdfOntology();
