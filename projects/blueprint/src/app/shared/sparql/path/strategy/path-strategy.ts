import { GraphPointer } from "clownface";

export abstract class PathStrategy {
    protected _node: GraphPointer | null;

    constructor(node: GraphPointer | null) {
        this._node = node;
    }

    abstract toPropertyPath(): string;
    abstract toPathFragments(): string[]
}
