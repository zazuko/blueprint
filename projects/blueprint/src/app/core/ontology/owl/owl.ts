

import { NamespaceBuilder, rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class OwlOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('http://www.w3.org/2002/07/owl#'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'owl';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the inverseOf predicate.
     * 
     * @readonly
     */
    get inverseOf(): string {
        return this.namespace('inverseOf').value;
    }

    /**
     * Get the prefixed inverseOf predicate.
     * 
     * @readonly
     */
    get inverseOfPrefixed(): string {
        return `${this.prefix()}:inverseOf`;
    }

    /**
     * Get the inverseOf predicate as NamedNode.
     */
    get inverseOfNamedNode(): RdfTypes.NamedNode {
        return this.namespace('inverseOf');
    }

    /**
     * Get the sameAs predicate.
     * 
     * @readonly
     */
    get sameAs(): string {
        return this.namespace('sameAs').value;
    }
    /**
     * Get the prefixed sameAs predicate.
     * 
     * @readonly
     */
    get sameAsPrefixed(): string {
        return `${this.prefix()}:sameAs`;
    }
    /**
     * Get the sameAs predicate as NamedNode.
     */
    get sameAsNamedNode(): RdfTypes.NamedNode {
        return this.namespace('sameAs');
    }



}


export const owl = new OwlOntology();
