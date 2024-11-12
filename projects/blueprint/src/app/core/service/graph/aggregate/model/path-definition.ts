/**
 * This is an element of an rdf path. It using shacl ontology and shacl path predicate but it's not not a shacl path.
 * sh:path is in our case never a list. But it can be a sh:inversePath.
 * 
 */

export class PathDefinition {
    public readonly sourceClassIri: string;
    public readonly targetClassIri: string;
    #pathFragments: string[];

    constructor(sourceClassIri: string, targetClassIri: string, pathFragments: string[]) {
        this.sourceClassIri = sourceClassIri;
        this.targetClassIri = targetClassIri;
        if (pathFragments.length === 0) {
            throw new Error('Path must have at least one fragment');
        }
        this.#pathFragments = pathFragments;
    }

    get path(): string {
        return this.#pathFragments.join(' ');
    }

    /**
     * Invert the path definition. It's not altering the original path definition. It returns a new inverted path definition instance.
     * 
     * @returns the inverse of the path
     */
    invert(): PathDefinition {
        const inversePath = this.#pathFragments.map(fragment => {
            if (fragment.startsWith('^')) {
                return fragment.substring(1);
            }
            return `^${fragment}`;
        }).reverse();
        return new PathDefinition(this.targetClassIri, this.sourceClassIri, inversePath);
    }
}
