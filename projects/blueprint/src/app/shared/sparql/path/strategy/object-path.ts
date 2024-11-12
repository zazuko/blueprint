import { PathStrategy } from "./path-strategy";

export class ObjectPath extends PathStrategy {
    readonly #pathFragments: string[] = [];

    constructor(fragments: string[]) {
        super(null);
        if (fragments.length === 0) {
            throw new TypeError('ObjectPathLink must have at least one fragment');
        }
        this.#pathFragments = fragments;

    }

    toPropertyPath(): string {
        return this.#pathFragments.join('/');
    }

    toPathFragments(): string[] {
        return this.#pathFragments
    }
}
