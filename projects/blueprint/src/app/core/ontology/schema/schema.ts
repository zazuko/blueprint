

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

    /**
     * Get the familyName predicate.
     * 
     * @readonly
     */
    get familyName(): string {
        return this.namespace('familyName').value;
    }

    /** 
     *  Get the prefixed familyName predicate.
     * 
     * 
     * @readonly
     */
    get familyNamePrefixed(): string {
        return `${this.prefix()}:familyName`;
    }

    /**
     * Get the familyName predicate as NamedNode.
     * 
     * @readonly
     */
    get familyNameNamedNode(): RdfTypes.NamedNode {
        return this.namespace('familyName');
    }


}

export const schema = new SchemaOntology();
