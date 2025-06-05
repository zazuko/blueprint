import { ClownfaceObject } from '../clownface-object/clownface-object';

import { GraphPointer } from 'clownface';

import { flux } from '@blueprint/ontology';



/**
 * UiClassCount Class
 * Instance Count for a Search result
 */
export class UiClassCount extends ClownfaceObject {

    #count: number | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The count for this class
     * 
     * @readonly
     */
    public get count(): number {
        if (this.#count === null) {
            const c = this._node.out(flux.countNamedNode).values;
            if (c.length === 0) {
                console.error(`No count found for ${this._node.value}`);
                this.#count = 0;
            } else {
                if (c.length > 1) {
                    console.warn(`Multiple counts found for ${this._node.value}`);
                    this.logTable();
                }
                this.#count = Number(c[0]);
            }
        }
        return this.#count;
    }

}
