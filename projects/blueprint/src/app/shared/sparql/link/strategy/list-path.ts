import { GraphPointer } from "clownface";
import { PathStrategy } from "./path-strategy";
import { SimplePath } from "./simple-path";
import { InversePath } from "./inverse-path";

export class ListPath extends PathStrategy {
    readonly #pathFragments: string[];

    constructor(pathNode: GraphPointer) {
        super(pathNode);
        if (this._node.term.termType === 'NamedNode') {
            throw new TypeError('CompositePathLink cannot be a named node');
        }

        if (this._node.term.termType === 'Literal') {
            throw new TypeError('CompositePathLink cannot be a literal');
        }

        if (!this._node.isList()) {
            throw new TypeError('CompositePathLink must be a list');
        }

        this.#pathFragments = [];
        [...this._node.list()].forEach((element) => {
            if (element.term.termType === 'NamedNode') {
                this.#pathFragments.push(new SimplePath(element).toPropertyPath());
                return;
            }
            if (element.term.termType === 'BlankNode') {
                this.#pathFragments.push(new InversePath(element).toPropertyPath());
                return;
            }
            if (element.term.termType === 'Literal') {
                throw new TypeError('CompositePathLink cannot be a literal');
            }
            throw new TypeError('CompositePathLink path element must be a NamedNode or a BlankNode');

        });
    }

    toPropertyPath(): string {
        return this.#pathFragments.join('/');
    }

    toPathFragments(): string[] {
        return this.#pathFragments;
    }
}
