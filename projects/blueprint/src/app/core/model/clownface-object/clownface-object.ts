import { GraphPointer } from 'clownface';

import { rdfEnvironment, RdfTypes } from '../../rdf/rdf-environment';
import { rdf, rdfs, schema, shacl, skos } from '@blueprint/ontology';
import { sortLiteralsByBrowserLanguage } from '../../utils/language-prededence';

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
            label = sortLiteralsByBrowserLanguage(skosPrefLabelTerm as RdfTypes.Literal[])[0].value;
            return label;
        }
        if (rdfsLabelTerm.length > 0) {
            label = sortLiteralsByBrowserLanguage(rdfsLabelTerm as RdfTypes.Literal[])[0].value;
            return label;
        }
        if (schemaNameTerm.length > 0) {
            // order by langage tag and terms with langage en first
            label = sortLiteralsByBrowserLanguage(schemaNameTerm as RdfTypes.Literal[])[0].value;
            return label;
        }
        if (schemaFamilyNameTerm.length > 0) {
            // order by langage tag and terms with langage en first
            label = sortLiteralsByBrowserLanguage(schemaFamilyNameTerm as RdfTypes.Literal[])[0].value;
            return label;
        }

        if (shaclNameTerm.length > 0) {
            // order by langage tag and terms with langage en first
            label = sortLiteralsByBrowserLanguage(shaclNameTerm as RdfTypes.Literal[])[0].value;
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
     * Get CBD - Concise Bounded Description for this node.
     * https://www.w3.org/submissions/CBD/
     * 
     * @returns A dataset that contains the CBD for this node.
     */
    static describeCDBForNode(node: GraphPointer): RdfTypes.Dataset {

        const result = rdfEnvironment.dataset();
        const visited = new Set<string>();
        const dataset = node.dataset;
        function addTriples(subject: RdfTypes.Term) {
            if (visited.has(subject.value)) {
                return;
            }
            visited.add(subject.value);

            const triples = dataset.match(subject, null, null, null);
            for (const quad of triples) {
                result.add(quad);

                // If object is a blank node, recursively describe it
                if (quad.object.termType === 'BlankNode') {
                    addTriples(quad.object);
                }
            }
        }

        addTriples(node.term);
        return result;
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

    describeCDB(): RdfTypes.Dataset {
        return ClownfaceObject.describeCDBForNode(this._node);
    }



}
