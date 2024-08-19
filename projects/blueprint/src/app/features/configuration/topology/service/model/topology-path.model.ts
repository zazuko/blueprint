import * as RDF from '@rdfjs/types';

export interface TopologyPathElement {
    predicate: RDF.NamedNode;
    isInverse?: boolean;
    isReverse?: boolean;
}

export interface TopologyPath {
    path: TopologyPathElement[];
    toClass: RDF.NamedNode;
}
