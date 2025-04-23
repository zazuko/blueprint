

import { rdfEnvironment, NamespaceBuilder, RdfTypes } from '../../rdf/rdf-environment';
import { Ontology } from '../ontology';

class BlueprintShapeOntology extends Ontology {

    constructor() {
        super(rdfEnvironment.namespace('https://ld.flux.zazuko.com/shapes/metadata/'));
    }

    get namespace(): NamespaceBuilder<string> {
        return this._namespace;
    }

    prefix(): string {
        return 'blueprintShape';
    }

    sparqlPrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    turtlePrefix(): string {
        return `PREFIX ${this.prefix()}: <${this.namespace[''].value}> `;
    }

    /**
     * Get the ClassDetailShape class / shape.
     * 
     * @readonly
     */
    get ClassDetailShape(): string {
        return this.namespace('ClassDetailShape').value;
    }

    /**
     * Get the prefixed icon predicate.
     * 
     * @readonly
     */
    get ClassDetailShapePrefixed(): string {
        return `${this.prefix()}:ClassDetailShape`;
    }

    /**
     * Get the icon predicate as NamedNode.
     */

    get ClassDetailShapeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('ClassDetailShape');
    }

    /**
     * Get the ClassMetadataShape class / shape.
     * 
     * @readonly
     */
    get ClassMetadataShape(): string {
        return this.namespace('ClassMetadataShape').value;
    }

    /**
     * Get the  ClassMetadataShape class / shape.
     * 
     * @readonly
     */
    get ClassMetadataShapePrefixed(): string {
        return `${this.prefix()}:ClassMetadataShape`;
    }

    /**
     * Get the  ClassMetadataShape class / shape as  NamedNode.
     * 
     * @readonly
     */
    get ClassMetadataShapeNamedNode(): RdfTypes.NamedNode {
        return this.namespace('ClassMetadataShape');
    }


}

export const blueprintShape = new BlueprintShapeOntology();
