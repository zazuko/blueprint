import * as RDF from '@rdfjs/types';

import { TopologyIpl } from "./topology.model";
import { TopologyNode } from './topology-node.model';
import { TopologyPath } from './topology-path.model';


/**
 * Tree topology
 * 
 * Implements the TopologyIpl interface for a tree topology
 */
export class TreeTopology extends TopologyIpl {

    /**
     * 
     * @param iri The IRI of the topology
     * @param label The label of the topology
     * @param comment The comment of the topology
     * @param root The root node of the topology
     */
    constructor(iri: RDF.NamedNode, label: string, comment: string, root: TopologyNode) {
        super(iri, label, comment, root);
    }

    hasNode(classIri: RDF.NamedNode): boolean {

        return this.rootNode.hasNode(classIri);
    }

    getUpstreamPathToRoot(classIri: RDF.NamedNode): TopologyPath[] {
        const path: TopologyPath[] = [];



        // find node in tree
        const node = this.rootNode.findNode(classIri);
        if (!node) {
            return path;
        }

        // find all paths to root
        const paths = node.getFullPathToRoot();


        return paths;
    }
}