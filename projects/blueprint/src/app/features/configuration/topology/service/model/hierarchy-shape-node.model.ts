import * as RDF from '@rdfjs/types';

import { TopologyPath, TopologyPathElement } from './topology-path.model';
import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { shacl } from '@blueprint/ontology';
import { GraphPointer } from 'clownface';


export class HierarchyShapeNode extends ClownfaceObject {

    constructor(node: GraphPointer) {
        super(node);
    }

}


