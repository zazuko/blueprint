

import { NamespaceBuilder, rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class SchemaOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('http://schema.org/'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'schema';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the name predicate.
     * 
     * @readonly
     */
    get name(): string {
        return this.namespace('name').value;
    }

    /**
     * Get the prefixed name predicate.
     * 
     * @readonly
     */
    get namePrefixed(): string {
        return `${this.prefix()}:name`;
    }

    /**
     * Get the name predicate as NamedNode.
     */

    get nameNamedNode(): RdfTypes.NamedNode {
        return this.namespace('name');
    }
}

export const schema = new SchemaOntology();
