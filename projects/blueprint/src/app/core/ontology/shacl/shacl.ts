

import { NamespaceBuilder, rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class ShaclOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('http://www.w3.org/ns/shacl#'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'sh';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the path predicate.
     * 
     * @readonly
     */
    get path(): string {
        return this.namespace('path').value;
    }

    /**
     * Get the prefixed path predicate.
     * 
     * @readonly
     */
    get pathPrefixed(): string {
        return `${this.prefix()}:path`;
    }

    /**
     * Get the path predicate as NamedNode.
     */

    get pathNamedNode(): RdfTypes.NamedNode {
        return this.namespace('path');
    }

    /**
     * Get the order predicate.
     * 
     * @readonly
     */
    get order(): string {
        return this.namespace('order').value;
    }
    /**
     * Get the prefixed order predicate.
     */
    get orderPrefixed(): string {
        return `${this.prefix()}:order`;
    }

    /**
     * Get the order predicate as NamedNode.
     */
    get orderNamedNode(): RdfTypes.NamedNode {
        return this.namespace('order');
    }

    /** 
     * Get the targetNode predicate.
     * 
     * @readonly
     */
    get targetNode(): string {
        return this.namespace('targetNode').value;
    }
    /**
     * Get the prefixed targetNode predicate.
     * 
     * @readonly
     */
    get targetNodePrefixed(): string {
        return `${this.prefix()}:targetNode`;
    }
    /**
     * Get the targetNode predicate as NamedNode.
     * 
     * $@readonly
     */
    get targetNodeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('targetNode');
    }

    /**
     * Get the targetClass predicate.
     * 
     * @readonly
     */
    get targetClass(): string {
        return this.namespace('targetClass').value;
    }

        /**
         * Get the prefixed targetClass predicate.
         * 
         * @readonly
         */$
    get targetClassPrefixed(): string {
        return `${this.prefix()}:targetClass`;
    }

    /**
     * Get the targetClass predicate as NamedNode.
     */

    get targetClassNamedNode(): RdfTypes.NamedNode {
        return this.namespace('targetClass');
    }

    /**
     * Get the group predicate.
     * 
     * @readonly
     */
    get group(): string {
        return this.namespace('group').value;
    }

    /**
     * Get the prefixed group predicate.
     * 
     * @readonly
     */
    get groupPrefixed(): string {
        return `${this.prefix()}:group`;
    }

    /**
     * Get the group predicate as NamedNode.
     * 
     * @readonly
     */
    get groupNamedNode(): RdfTypes.NamedNode {
        return this.namespace('group');
    }


    /** 
     * Get the node predicate.
     * 
     * @readonly
     */
    get node(): string {
        return this.namespace('node').value;
    }

    /**
     * Get the prefixed node predicate.
     * 
     * @readonly
     */
    get nodePrefixed(): string {
        return `${this.prefix()}:node`;
    }

    /**
     * Get the node predicate as NamedNode.
     * 
     * @readonly
     */
    get nodeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('node');
    }

    /**
     * Get the inversePath predicate.
     * 
     * @readonly
     */
    get inversePath(): string {
        return this.namespace('inversePath').value;
    }

    /**
     * Get the prefixed inversePath predicate.
     * 
     * @readonly
     */
    get inversePathPrefixed(): string {
        return `${this.prefix()}:inversePath`;
    }

    /**
     * Get the inversePath predicate as NamedNode.
     * 
     * @readonly
     */
    get inversePathNamedNode(): RdfTypes.NamedNode {
        return this.namespace('inversePath');
    }

    /**
     * Get the property predicate.
     * 
     * @readonly
     */
    get property(): string {
        return this.namespace('property').value;
    }

    /**
     * Get the prefixed property predicate.
     * 
     * @readonly
     */
    get propertyPrefixed(): string {
        return `${this.prefix()}:property`;
    }

    /**
     * Get the property predicate as NamedNode.
     * 
     * @readonly
     */
    get propertyNamedNode(): RdfTypes.NamedNode {
        return this.namespace('property');
    }

    /**
     * Get the class predicate.
     * 
     * @readonly
     */
    get class(): string {
        return this.namespace('class').value;
    }

    /**
     * Get the prefixed class predicate.
     * 
     * @readonly
     */
    get classPrefixed(): string {
        return `${this.prefix()}:class`;
    }

    /**
     * Get the class predicate as NamedNode.
     * 
     * @readonly
     */
    get classNamedNode(): RdfTypes.NamedNode {
        return this.namespace('class');
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
     * 
     * @readonly
     */
    get nameNamedNode(): RdfTypes.NamedNode {
        return this.namespace('name');
    }

    /**
     * Get the nodeKind predicate.
     * 
     * @readonly
     */
    get nodeKind(): string {
        return this.namespace('nodeKind').value;
    }

    /**
     * Get the prefixed nodeKind predicate.
     * 
     * @readonly
     */
    get nodeKindPrefixed(): string {
        return `${this.prefix()}:nodeKind`;
    }

    /**
     * Get the nodeKind predicate as NamedNode.
     * 
     * @readonly
     */
    get nodeKindNamedNode(): RdfTypes.NamedNode {
        return this.namespace('nodeKind');
    }

    /**
     * Get the Literal predicate.
     * 
     * @readonly
     */
    get Literal(): string {
        return this.namespace('Literal').value;
    }

    /**
     * Get the prefixed Literal predicate.
     * 
     * @readonly
     */
    get LiteralPrefixed(): string {
        return `${this.prefix()}:Literal`;
    }

    /**
     * Get the Literal predicate as NamedNode.
     * 
     * @readonly
     */
    get LiteralNamedNode(): RdfTypes.NamedNode {
        return this.namespace('Literal');
    }

    /**
     * Get the IRI predicate.
     * 
     * @readonly
     */
    get IRI(): string {
        return this.namespace('IRI').value;
    }

    /**
     * Get the prefixed IRI predicate.
     * 
     * @readonly
     */
    get IRIPrefixed(): string {
        return `${this.prefix()}:IRI`;
    }

    /**
     * Get the IRI predicate as NamedNode.
     * 
     * @readonly
     */
    get IRINamedNode(): RdfTypes.NamedNode {
        return this.namespace('IRI');
    }

    /**
     * Get the PropertyGroup class.
     * 
     * @readonly
     */
    get PropertyGroup(): string {
        return this.namespace('PropertyGroup').value;
    }

    /**
     * Get the prefixed PropertyGroup class.
     * 
     * @readonly
     */
    get PropertyGroupPrefixed(): string {
        return `${this.prefix()}:PropertyGroup`;
    }

    /**
     * Get the PropertyGroup class as NamedNode.
     * 
     * @readonly
     */
    get PropertyGroupNamedNode(): RdfTypes.NamedNode {
        return this.namespace('PropertyGroup');
    }

}

export const shacl = new ShaclOntology();
