import { GraphPointer } from 'clownface';
import { blueprint } from '@blueprint/ontology';

import { NodeElement } from '../node-element/node-element.class';

/**
 * SearchResultItem Class
 */
export class SearchResultItem extends NodeElement {
    private _score: number | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The search Score of this item
     * 
     * @readonly
     * @link blueprint:score
     */
    public get score(): number {
        if (this._score === null) {
            const scores = this._node.out(blueprint.scoreNamedNode).values;
            if (scores.length === 0) {
                console.error(`No score found for ${this._node.value}`);
                this._score = 0;
            } else {
                // get max score of scores
                this._score = Math.max(...scores.map(score => Number(score)));
            }
        }
        return this._score;
    }
}
