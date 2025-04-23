import { rdfEnvironment, RdfTypes } from "../../../../rdf/rdf-environment";

export interface ArchimateDiagramOntology {
    source: RdfTypes.NamedNode;
    target: RdfTypes.NamedNode;
    label: RdfTypes.NamedNode;
    businessObjectsTransported: RdfTypes.NamedNode;
    flowType: RdfTypes.NamedNode;
}


export const archimateDiagramOntology: ArchimateDiagramOntology = {
    source: rdfEnvironment.namedNode('http://example.org/ea/source'),
    target: rdfEnvironment.namedNode('http://example.org/ea/target'),
    label: rdfEnvironment.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    businessObjectsTransported: rdfEnvironment.namedNode('http://localhost/ontology/businessObjectsTransported'),
    flowType: rdfEnvironment.namedNode('http://example.org/ea/flowtype')
}
