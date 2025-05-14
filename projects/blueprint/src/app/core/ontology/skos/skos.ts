

import { NamespaceBuilder, rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class SkosOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('http://www.w3.org/2004/02/skos/core#'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'skos';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the prefLabel predicate.
     * 
     * @readonly
     */
    get prefLabel(): string {
        return this.namespace('prefLabel').value;
    }

    /**
     * Get the prefixed prefLabel predicate.
     * 
     * @readonly
     */
    get prefLabelPrefixed(): string {
        return `${this.prefix()}:prefLabel`;
    }

    /**
     * Get the prefLabel predicate as NamedNode.
     */

    get prefLabelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('prefLabel');
    }

    /**
     * Get the altLabel predicate.
     * 
     * @readonly
     */
    get altLabel(): string {
        return this.namespace('altLabel').value;
    }

    /**
     * Get the prefixed altLabel predicate.
     * 
     * @readonly
     */
    get altLabelPrefixed(): string {
        return `${this.prefix()}:altLabel`;
    }
    /**
     * Get the altLabel predicate as NamedNode.
     *  
     * @readonly
     */
    get altLabelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('altLabel');
    }

    /**
     * Get the definition predicate.
     * 
     * @readonly
     */
    get definition(): string {
        return this.namespace('definition').value;
    }
    /**
     * Get the prefixed definition predicate.
     * 
     * @readonly
     */
    get definitionPrefixed(): string {
        return `${this.prefix()}:definition`;
    }
    /**
     * Get the definition predicate as NamedNode.
     * 
     * @readonly
     */
    get definitionNamedNode(): RdfTypes.NamedNode {
        return this.namespace('definition');
    }

    /**
     * Get the inScheme predicate.
     * 
     * @readonly
     */
    get inScheme(): string {
        return this.namespace('inScheme').value;
    }

    /**
     * Get the prefixed inScheme predicate.
     * 
     * @readonly
     */
    get inSchemePrefixed(): string {
        return `${this.prefix()}:inScheme`;
    }

    /**
     * Get the inScheme predicate as NamedNode.
     * 
     * @readonly
     *  
     * @returns {RdfTypes.NamedNode}
     */
    get inSchemeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('inScheme');
    }

    /**
     * Get the broader predicate.
     * 
     * @readonly
     */
    get broader(): string {
        return this.namespace('broader').value;
    }
    /**
     * Get the prefixed broader predicate.
     *  
     * @readonly
     * @returns {string}
     */
    get broaderPrefixed(): string {
        return `${this.prefix()}:broader`;
    }

    /**
     * Get the broader predicate as NamedNode.
     * 
     * @readonly
     */
    get broaderNamedNode(): RdfTypes.NamedNode {
        return this.namespace('broader');
    }
    /**
     * Get the narrower predicate.
     * 
     * @readonly
     *
     * @returns {string}
     */
    get narrower(): string {
        return this.namespace('narrower').value;
    }
    /**
     * Get the prefixed narrower predicate.
     * 
     * @readonly
     */
    get narrowerPrefixed(): string {
        return `${this.prefix()}:narrower`;
    }
    /**
     * Get the narrower predicate as NamedNode.
     *
     *
     * @returns {RdfTypes.NamedNode}
     */
    get narrowerNamedNode(): RdfTypes.NamedNode {
        return this.namespace('narrower');
    }

}


export const skos = new SkosOntology();
