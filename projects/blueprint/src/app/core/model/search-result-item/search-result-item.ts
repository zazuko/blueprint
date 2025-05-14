import { GraphPointer } from 'clownface';

import { flux } from '@blueprint/ontology';

import { NodeElement } from '../node-element/node-element.class';

/**
 * SearchResultItem Class
 */
export class SearchResultItem extends NodeElement {
    #score: number | null = null;

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
        if (this.#score === null) {
            const scores = this._node.out(flux.scoreNamedNode).values;
            if (scores.length === 0) {
                console.error(`No score found for ${this._node.value}`);
                this.#score = 0;
            } else {
                // get max score of scores
                this.#score = Math.max(...scores.map(score => Number(score)));
            }
        }
        return this.#score;
    }
}
