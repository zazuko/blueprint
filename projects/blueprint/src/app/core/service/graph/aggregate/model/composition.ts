import { GraphPointer } from 'clownface';

import { AggregateMemberNode, Aggregation } from './aggregation';


export class Composition extends Aggregation {

    constructor(node: GraphPointer) {
        super(node);
    }


    /**
     * The connection points of the aggregate. The connection points are the nodes that are exposed to the outside and can be connected to other nodes or aggregates.
     * 
     * @readonly
     */
    get connectionPoints(): AggregateMemberNode[] {
        return this.aggregateNodes.filter(aggregateNode => aggregateNode.isConnectionPoint);
    }

}