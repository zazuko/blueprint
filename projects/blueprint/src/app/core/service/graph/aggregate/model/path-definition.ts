/**
 * This is an element of an rdf path. It using shacl ontology and shacl path predicate but it's not not a shacl path.
 * sh:path is in our case never a list. But it can be a sh:inversePath.
 * 
 */

export class PathDefinition {
    public readonly sourceClassIri: string;
    public readonly targetClassIri: string;
    public readonly path: string;

    constructor(sourceClassIri: string, targetClassIri: string, path: string) {
        this.sourceClassIri = sourceClassIri;
        this.targetClassIri = targetClassIri;
        const pathToken1 = path[0];
        const pathToken2 = path[1];

        if (pathToken1 === '^' && pathToken2 === '<') {
            this.path = path;
        } else if (pathToken1 === '<') {
            this.path = path;
        } else {
            console.warn(`PathDefinition: path is not valid. It should start with ^< or <. Path is ${path}. Fix it`);
            if (pathToken1 === '^') {
                this.path = `^<${path.substring(1)}>`;
            } else {
                this.path = `<${path}>`;
            }

        }
    }

    /**
     * Invert the path definition. It's not altering the original path definition. It returns a new inverted path definition instance.
     * 
     * @returns the inverse of the path
     */
    invert(): PathDefinition {
        const inversePath = this.path.startsWith('^') ? this.path.substring(1) : `^${this.path}`
        return new PathDefinition(this.targetClassIri, this.sourceClassIri, inversePath);
    }
}
