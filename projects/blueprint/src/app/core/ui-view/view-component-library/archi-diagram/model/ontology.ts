import { NamedNode } from "@rdfjs/types";
import rdfEnvironment from "@zazuko/env";




export interface ArchimateDiagramOntology {
    source: NamedNode;
    target: NamedNode;
    label: NamedNode;
    businessObjectsTransported: NamedNode;
    flowType: NamedNode;
}


export const archimateDiagramOntology: ArchimateDiagramOntology = {
    source: rdfEnvironment.namedNode('http://example.org/ea/source'),
    target: rdfEnvironment.namedNode('http://example.org/ea/target'),
    label: rdfEnvironment.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    businessObjectsTransported: rdfEnvironment.namedNode('http://localhost/ontology/businessObjectsTransported'),
    flowType: rdfEnvironment.namedNode('http://example.org/ea/flowtype')
}
