

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

    /**
     * Get the domainIncludes predicate.
     * 
     * @readonly
     */
    get domainIncludes(): string {
        return this.namespace('domainIncludes').value;
    }

    /**
     * Get the prefixed domainIncludes predicate.
     * 
     * @readonly
     */
    get domainIncludesPrefixed(): string {
        return `${this.prefix()}:domainIncludes`;
    }
    /**
     * Get the domainIncludes predicate as NamedNode.
     * 
     * @readonly
     */
    get domainIncludesNamedNode(): RdfTypes.NamedNode {
        return this.namespace('domainIncludes');
    }
    /**
     * Get the rangeIncludes predicate.
     * 
     * @readonly
     */
    get rangeIncludes(): string {
        return this.namespace('rangeIncludes').value;
    }

    /**
     * Get the prefixed rangeIncludes predicate.
     * 
     * @readonly
     */
    get rangeIncludesPrefixed(): string {
        return `${this.prefix()}:rangeIncludes`;
    }
    /**
     * Get the rangeIncludes predicate as NamedNode.
     * 
     * @readonly
     */
    get rangeIncludesNamedNode(): RdfTypes.NamedNode {
        return this.namespace('rangeIncludes');
    }



}

export const schema = new SchemaOntology();
