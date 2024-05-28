import { ClownfaceObject } from '../clownface-object/clownface-object';

import { GraphPointer } from 'clownface';

import { blueprint } from '@blueprint/ontology';



/**
 * UiClassCount Class
 * Instance Count for a Search result
 */
export class UiClassCount extends ClownfaceObject {

    private _count: number | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The count for this class
     * 
     * @readonly
     */
    public get count(): number {
        if (this._count === null) {
            const c = this._node.out(blueprint.countNamedNode).values;
            if (c.length === 0) {
                console.error(`No count found for ${this._node.value}`);
                this._count = 0;
            } else {
                if (c.length > 1) {
                    console.warn(`Multiple counts found for ${this._node.value}`);
                }
                this._count = Number(c[0]);
            }
        }
        return this._count;
    }

}
