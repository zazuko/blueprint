

import { rdfEnvironment, NamespaceBuilder, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class AppOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('http://localhost/app/'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'app';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the result predicate.
     * 
     * @readonly
     */
    get result(): string {
        return this.namespace('result').value;
    }

    /**
     * Get the prefixed result predicate.
     * 
     * @readonly
     */
    get resultPrefixed(): string {
        return `${this.prefix()}:result`;
    }

    /**
     * Get the result predicate as NamedNode.
     * 
     * @readonly
     */
    get resultNamedNode(): RdfTypes.NamedNode {
        return this.namespace('result');
    }

    /**
     * Get the element predicate.
     * 
     * @readonly
     */
    get element(): string {
        return this.namespace('element').value;
    }

    /**
     * Get the prefixed element predicate.
     * 
     * @readonly
     */
    get elementPrefixed(): string {
        return `${this.prefix()}:element`;
    }

    /**
     * Get the element predicate as NamedNode.
     * 
     * @readonly
     */
    get elementNamedNode(): RdfTypes.NamedNode {
        return this.namespace('element');
    }

    /**
     * Get the iri predicate.
     * 
     * @readonly
     */
    get iri(): string {
        return this.namespace('iri').value;
    }

    /**
     * Get the prefixed iri predicate.
     * 
     * @readonly
     */
    get iriPrefixed(): string {
        return `${this.prefix()}:iri`;
    }

    /**
     * Get the iri predicate as NamedNode.
     * 
     * @readonly
     */
    get iriNamedNode(): RdfTypes.NamedNode {
        return this.namespace('iri');
    }

    /**
     * Get the classLabel predicate.
     * 
     * @readonly
     */
    get classLabel(): string {
        return this.namespace('classLabel').value;
    }

    /**
     * Get the prefixed classLabel predicate.
     * 
     * @readonly
     */
    get classLabelPrefixed(): string {
        return `${this.prefix()}:classLabel`;
    }

    /**
     * Get the classLabel predicate as NamedNode.
     * 
     * @readonly
     */
    get classLabelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('classLabel');
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
     * 
     * @readonly
     */
    get labelNamedNode(): RdfTypes.NamedNode {
        return this.namespace('label');
    }

    /**
     * Get the icon predicate.
     * 
     * @readonly
     */
    get icon(): string {
        return this.namespace('icon').value;
    }

    /**
     * Get the prefixed icon predicate.
     * 
     * @readonly
     */
    get iconPrefixed(): string {
        return `${this.prefix()}:icon`;
    }

    /**
     * Get the icon predicate as NamedNode.
     * 
     * @readonly
     */
    get iconNamedNode(): RdfTypes.NamedNode {
        return this.namespace('icon');
    }

    /**
     * Get the colorIndex predicate.
     * 
     * @readonly
     */
    get colorIndex(): string {
        return this.namespace('colorIndex').value;
    }

    /**
     * Get the prefixed colorIndex predicate.
     * 
     * @readonly
     */
    get colorIndexPrefixed(): string {
        return `${this.prefix()}:colorIndex`;
    }

    /**
     * Get the colorIndex predicate as NamedNode.
     * 
     * @readonly
     */
    get colorIndexNamedNode(): RdfTypes.NamedNode {
        return this.namespace('colorIndex');
    }

    /**
     * Get the index predicate.
     * 
     * @readonly
     */
    get index(): string {
        return this.namespace('index').value;
    }

    /**
     * Get the prefixed index predicate.
     * 
     * @readonly
     */
    get indexPrefixed(): string {
        return `${this.prefix()}:index`;
    }

    /**
     * Get the index predicate as NamedNode.
     * 
     * @readonly
     * 
     */
    get indexNamedNode(): RdfTypes.NamedNode {
        return this.namespace('index');
    }

}

export const appLocal = new AppOntology();
