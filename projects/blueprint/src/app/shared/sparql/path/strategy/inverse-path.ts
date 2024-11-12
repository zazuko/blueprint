import { GraphPointer } from "clownface";
import { PathStrategy } from "./path-strategy";
import { shacl } from "@blueprint/ontology";


export class InversePath extends PathStrategy {
    readonly #pathFragments: string[];

    constructor(pathNode: GraphPointer) {
        super(pathNode);
        if (this._node.isList()) {
            throw new TypeError('InversePathLink cannot be a list');
        }

        if (this._node.term.termType === 'NamedNode') {
            throw new TypeError('InversePathLink cannot be a named node');
        }

        if (this._node.term.termType === 'Literal') {
            throw new TypeError('InversePathLink cannot be a literal');
        }

        const nodeValue = this._node.out(shacl.inversePathNamedNode).value;

        if (!nodeValue) {
            throw new TypeError('InversePathLink must have a sh:inversePath');
        }
        // SPARQL query generation for a sh:inversePath link
        this.#pathFragments = ['^<' + nodeValue + '>'];
    }

    toPropertyPath(): string {
        return this.#pathFragments[0];
    }

    toPathFragments(): string[] {
        return this.#pathFragments
    }
}