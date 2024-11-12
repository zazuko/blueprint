import { GraphPointer } from "clownface";
import { PathStrategy } from "./path-strategy";

export class SimplePath extends PathStrategy {

    readonly #pathFragments: string[];

    constructor(pathNode: GraphPointer) {
        super(pathNode);
        if (this._node.isList()) {
            throw new TypeError('SimpleNodeLink cannot be a list');
        }

        if (this._node.term.termType === 'BlankNode') {
            throw new TypeError('SimpleNodeLink cannot be a blank node');
        }

        if (this._node.term.termType === 'Literal') {
            throw new TypeError('SimpleNodeLink cannot be a literal');
        }

        this.#pathFragments = ['<' + this._node.value + '>'];

    }

    toPropertyPath(): string {
        return this.#pathFragments[0];
    }

    toPathFragments(): string[] {
        return this.#pathFragments
    }


}
