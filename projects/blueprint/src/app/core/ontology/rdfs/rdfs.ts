

import { rdfEnvironment, NamespaceBuilder, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class RdfsOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('http://www.w3.org/2000/01/rdf-schema#'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'rdfs';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `@prefix ${this.prefix()}: <${this.namespace[''].value}> .`;
    }

    /**
     * Get the label predicate.
     * 
     * @readonly
     */
    get label(): string {
        return this.namespace('label').value;
    }

    /**
     * Get the prefixed label predicate.
     * 
     * @readonly
     */
    get labelPrefixed(): string {
        return `${this.prefix()}:label`;
    }

    /**
     * Get the label predicate as NamedNode.
     */

    get labelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('label');
    }

    /**
     * Get the comment predicate.
     *
     * @readonly
     */
    get comment(): string {
        return this.namespace('comment').value;
    }

    /**
     * Get the prefixed comment predicate.
     *
     * @readonly
     */
    get commentPrefixed(): string {
        return `${this.prefix()}:comment`;
    }

    /**
     * Get the comment predicate as NamedNode.
     * 
     * @readonly
     */
    get commentNamedNode(): RdfTypes.NamedNode {
        return this.namespace('comment');
    }

    /**
     * Get the Class class.
     *
     * @readonly
     */
    get Class(): string {
        return this.namespace('Class').value;
    }

    /**
     * Get the prefixed Class class.
     *
     * @readonly
     */
    get ClassPrefixed(): string {
        return `${this.prefix()}:Class`;
    }

    /**
     * Get the Class class as NamedNode.
     * 
     * @readonly
     */
    get ClassNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Class');
    }

    /**
     * Get the subClassOf predicate.
     *
     * @readonly
     */
    get subClassOf(): string {
        return this.namespace('subClassOf').value;
    }

    /**
     * Get the prefixed subClassOf predicate.
     *
     * @readonly
     */
    get subClassOfPrefixed(): string {
        return `${this.prefix()}:subClassOf`;
    }

    /**
     * Get the subClassOf predicate as NamedNode.
     * 
     * @readonly
     */
    get subClassOfNamedNode(): RdfTypes.NamedNode {
        return this.namespace('subClassOf');
    }

    /**
     * Get the domain predicate.
     *
     * @readonly
     */
    get domain(): string {
        return this.namespace('domain').value;
    }

    /**
     * Get the prefixed domain predicate.
     *
     * @readonly
     */
    get domainPrefixed(): string {
        return `${this.prefix()}:domain`;
    }

    /**
     * Get the domain predicate as NamedNode.
     * 
     * @readonly
     */
    get domainNamedNode(): RdfTypes.NamedNode {
        return this.namespace('domain');
    }

    /**
     * Get the range predicate.
     *
     * @readonly
     */
    get range(): string {
        return this.namespace('range').value;
    }
    /**
     * Get the prefixed range predicate.
     *
     * @readonly
     */
    get rangePrefixed(): string {
        return `${this.prefix()}:range`;
    }

    /**
     * Get the range predicate as NamedNode.
     * 
     * @readonly
     */
    get rangeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('range');
    }

}

export const rdfs = new RdfsOntology();
