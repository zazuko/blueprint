import { GraphPointer } from 'clownface';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { rdfs, schema, shacl, skos } from '@blueprint/ontology';

/**
 * Base class for all objects that are represented by a node in the RDF graph. It provides some basic functionality to
 * access the node and its predicates. It is a wrapper around the clownface GraphPointer.
 * 
 */
export abstract class ClownfaceObject {

    static getLabelForNode(graphPointer: GraphPointer): string {
        const rdfsLabelTerm = graphPointer.out(rdfs.labelNamedNode).terms.filter((term) => term.termType === 'Literal');
        const schemaNameTerm = graphPointer.out(schema.nameNamedNode).terms.filter((term) => term.termType === 'Literal');
        const skosPrefLabelTerm = graphPointer.out(skos.prefLabelNamedNode).terms.filter((term) => term.termType === 'Literal');
        const schemaFamilyNameTerm = graphPointer.out(schema.familyNameNamedNode).terms.filter((term) => term.termType === 'Literal');
        const shaclNameTerm = graphPointer.out(shacl.nameNamedNode).terms.filter((term) => term.termType === 'Literal');

        let label = '';
        if (skosPrefLabelTerm.length > 0) {
            label = skosPrefLabelTerm.sort(precedence)[0].value;
            return label;
        }
        if (rdfsLabelTerm.length > 0) {
            label = rdfsLabelTerm.sort(precedence)[0].value;
            return label;
        }
        if (schemaNameTerm.length > 0) {
            // order by langage tag and terms with langage en first
            label = schemaNameTerm.sort(precedence)[0].value;
            return label;
        }
        if (schemaFamilyNameTerm.length > 0) {
            // order by langage tag and terms with langage en first
            label = schemaFamilyNameTerm.sort(precedence)[0].value;
            return label;
        }

        if (shaclNameTerm.length > 0) {
            // order by langage tag and terms with langage en first
            label = shaclNameTerm.sort(precedence)[0].value;
            return label;
        }

        if (graphPointer.value.includes('#')) {
            label = graphPointer.value.split('#').pop();
            return decodeURIComponent(label);

        }

        label = graphPointer.value.split('/').pop();
        if (label === '') {
            const parts = graphPointer.value.split('/');
            parts.pop();
            label = parts.pop();
        }
        return decodeURIComponent(label);

    }


    /**
     * This is a helper function that returns all predicates that are used in the dataset of the given node.
     * 
     * @param node The clownface GraphPointer
     * @returns An array of all predicates that are used in the dataset of the node
     */
    static getPredicatesForNode(node: GraphPointer): string[] {
        const predicateSet = new Set<string>([...node.dataset.match(rdfEnvironment.namedNode(node.value))].map(quad => quad.predicate.value));
        return [...predicateSet];
    }

    /**
     * Write the node to the console as a table.
     * 
     * @param node The clownface GraphPointer
     */
    static logNodeAsTable(node: GraphPointer) {
        const spo = [...node.dataset.match(node.term)].map(quad => {
            return {
                subject: quad.subject.value,
                predicate: quad.predicate.value,
                object: quad.object.value,
            }
        });
        console.table(spo);
    }

    protected readonly _node: GraphPointer;

    /**
     * Constructor for the ClownfaceObject
     * 
     * @param node The clownface GraphPointer that represents the node in the RDF graph
     */
    constructor(node: GraphPointer) {
        this._node = node;
    }

    /**
     * Returns the IRI of the node in the RDF graph
     * 
     * @returns The IRI of the node
     */
    get iri(): string {
        return this._node.value;
    }

    /**
     * Returns predicates that are available for the node in the RDF graph
     * 
     * @returns The clownface GraphPointer that represents the node
     */
    availablePredicates(): string[] {
        return ClownfaceObject.getPredicatesForNode(this._node);
    }

    /**
     * Log Table
     * 
     * This is a debug function to log this node to the console as a table.
     */
    logTable() {
        return ClownfaceObject.logNodeAsTable(this._node);
    }

}



export function precedence(a: RdfTypes.Literal, b: RdfTypes.Literal): number {
    const aTerm = a as RdfTypes.Literal;
    const bTerm = b as RdfTypes.Literal;
    if (aTerm.language.startsWith('en') && !aTerm.language.startsWith('en')) {
        return -1;
    } else if (!aTerm.language.startsWith('en') && bTerm.language.startsWith('en')) {
        return 1;
    } else {
        return 0;
    }
}