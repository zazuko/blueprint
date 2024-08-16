import * as RDF from '@rdfjs/types';

export interface TopologyPathElement {
    predicate: RDF.NamedNode;
    isInverse?: boolean;
}

export interface TopologyPath {
    path: TopologyPathElement[];
    toClass: RDF.NamedNode;
}
