import { GraphPointer } from 'clownface';
import { ClownfaceObject } from '../clownface-object/clownface-object';
import { appLocal, shacl } from '@blueprint/ontology';

import { OutgoingPathFactory } from 'projects/blueprint/src/app/shared/sparql/path/factory/outgoing-path-factory';
import { IncomingPathFactory } from 'projects/blueprint/src/app/shared/sparql/path/factory/incoming-path-factory';
import { rdfEnvironment } from '../../rdf/rdf-environment';

export interface UiLinkDefinition {
    iri: string;
    label: string;
    propertyPath: string | null;
    inversePropertyPath: string | null;
    propertyPathFragments: string[];
    prefixedPropertyPathFragments: PrefixedPathFragment[];
    inversePropertyPathFragments: string[] | null;
    arrowSource: string | null;
    arrowTarget: string | null;
    isSynthetic: boolean;
}

export interface PrefixedPathFragment {
    prefixedPredicate: string;
    predicateIri: string;
    isInverse: boolean;
}


export class RdfUiLinkDefinition extends ClownfaceObject implements UiLinkDefinition {
    #arrowSource: string | null | undefined = undefined;
    #arrowTarget: string | null | undefined = undefined;
    #label: string | undefined = undefined;
    #propertyPathFragments: string[] | undefined = undefined;
    #propertyPath: string | null | undefined = undefined;
    #inversePropertyPathFragments: string[] | undefined = undefined;
    #inversePropertyPath: string | null | undefined = undefined;
    #isSynthetic: boolean | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * Returns the label of the link.
     */
    get label(): string {
        if (this.#label === undefined) {
            const name = this._node.out(shacl.nameNamedNode).values;
            if (name.length === 0) {
                this.#label = '';
            } else {
                if (name.length > 1) {
                    console.warn(`Multiple names found for link <${this._node.value}>. Using the first one.`);
                }
                this.#label = name[0];
            }
        }
        return this.#label;
    }

    /**
     * Return the property path fragments for this link definition.
     * The property path is the path that points to the target of the link.
     * If no property path is found, it returns an empty array.
     */
    get propertyPathFragments(): string[] {

        if (this.#propertyPathFragments == undefined) {
            const paths = this._node.out(shacl.pathNamedNode);
            const pathFactory = new OutgoingPathFactory();
            const propertyPaths = paths.map(path => pathFactory.createPath(path));

            if (propertyPaths.length === 0) {
                console.error(`No path found for link <${this._node.value}>`);
                this.#propertyPathFragments = [];
                return this.#propertyPathFragments;
            }

            if (propertyPaths.length > 1) {
                console.warn(`Multiple paths found for link <${this._node.value}>. Using the first one.`);
            }
            this.#propertyPathFragments = propertyPaths[0].toPathFragments();
        }
        return this.#propertyPathFragments;
    }

    /**
     * Returns the property path for this link definition.
     * The property path is the path that points to the target of the link.
     * If no property path is found, it returns null. 
     * If multiple property paths are found, it logs a warning and returns the first one.
     */
    get propertyPath(): string | null {
        if (this.#propertyPath == undefined) {
            const paths = this._node.out(shacl.pathNamedNode);
            const pathFactory = new OutgoingPathFactory();
            const propertyPaths = paths.map(path => pathFactory.createPath(path));

            if (propertyPaths.length === 0) {
                console.error(`No path found for link <${this._node.value}>`);
                this.#propertyPath = null;
                return this.#propertyPath;
            }

            if (propertyPaths.length > 1) {
                console.warn(`Multiple paths found for link <${this._node.value}>. Using the first one.`);
            }
            this.#propertyPath = propertyPaths[0].toPropertyPath();
        }
        return this.#propertyPath;
    }

    /**
     * Returns the inverse property path fragments for this link definition.
     * The inverse property path is the path that points to the source of the link.
     * If no inverse property path is found, it returns an empty array. 
     * If multiple inverse property paths are found, it logs a warning and returns the first one.
     */
    get inversePropertyPathFragments(): string[] | null {
        if (this.#inversePropertyPathFragments === undefined) {
            const paths = this._node.out(shacl.pathNamedNode);
            const pathFactory = new IncomingPathFactory();
            const propertyPaths = paths.map(path => pathFactory.createPath(path));
            if (propertyPaths.length === 0) {
                console.error(`No path found for link <${this._node.value}>`);
                this.#inversePropertyPathFragments = [];
                return this.#inversePropertyPathFragments;
            }

            if (propertyPaths.length > 1) {
                console.warn(`Multiple paths found for link <${this._node.value}>. Using the first one.`);
            }
            this.#inversePropertyPathFragments = propertyPaths[0].toPathFragments();
        }
        return this.#inversePropertyPathFragments;
    }

    get prefixedPropertyPathFragments(): PrefixedPathFragment[] {
        return this.propertyPathFragments.map(fragment => {
            const isInverse = fragment.startsWith('^');
            const path = isInverse ? fragment.slice(1) : fragment;
            const prefixedPath = rdfEnvironment.shrink(path);
            const prefixedPathFragment: PrefixedPathFragment = {
                predicateIri: path,
                prefixedPredicate: prefixedPath,
                isInverse: isInverse,
            };
            return prefixedPathFragment;
        });
    }

    /**
     * Returns the inverse property path for this link definition.
     * The inverse property path is the path that points to the source of the link.
     * If no inverse property path is found, it returns null. 
     * If multiple inverse property paths are found, it logs a warning and returns the first one.
     */
    get inversePropertyPath(): string | null {
        if (this.#inversePropertyPath === undefined) {
            const paths = this._node.out(shacl.pathNamedNode);
            const pathFactory = new IncomingPathFactory();
            const propertyPaths = paths.map(path => pathFactory.createPath(path));
            if (propertyPaths.length === 0) {
                console.error(`No path found for link <${this._node.value}>`);
                this.#inversePropertyPath = null;
                return this.#inversePropertyPath;
            }

            if (propertyPaths.length > 1) {
                console.warn(`Multiple paths found for link <${this._node.value}>. Using the first one.`);
            }
            this.#inversePropertyPath = propertyPaths[0].toPropertyPath();
        }
        return this.#inversePropertyPath;
    }

    /**
     * Returns the source of the arrow for this link definition.
     * The source is the target class of the link.
     * If no source is found, it returns null. 
     * If multiple sources are found, it logs a warning and returns the first one.
     */
    get arrowSource(): string | null {
        if (this.#arrowSource === undefined) {
            const source = this._node.out(shacl.targetClassNamedNode).values;
            if (source.length === 0) {
                console.error(`No source found for link <${this._node.value}>`);
                this.#arrowSource = null;
            } else {
                if (source.length > 1) {
                    console.warn(`Multiple sources found for link <${this._node.value}>. Using the first one.`);
                }
                this.#arrowSource = source[0];
            }
        }
        return this.#arrowSource;
    }

    /**
     * Returns the target of the arrow for this link definition.
     * The target is the class that the link points to.
     * If no target is found, it returns null. 
     * If multiple targets are found, it logs a warning and returns the first one.
     */
    get arrowTarget(): string | null {
        if (this.#arrowTarget === undefined) {
            const targets = this._node.out(shacl.classNamedNode).values;
            if (targets.length === 0) {
                console.error(`No targets found for link <${this._node.value}>`);
                this.#arrowTarget = null;
            } else {
                if (targets.length > 1) {
                    console.warn(`Multiple targets found for link <${this._node.value}>. Using the first one.`);
                }
                this.#arrowTarget = targets[0];
            }
        }
        return this.#arrowTarget;
    }

    /**
     * Returns whether this link definition is synthetic.
     * A synthetic link is a link that is not defined in the ontology, but is created by the application.
     */
    get isSynthetic(): boolean {
        if (this.#isSynthetic === undefined) {
            const synthetic = this._node.out(appLocal.isSyntheticNamedNode).values;
            if (synthetic.length === 0) {
                this.#isSynthetic = false;
            } else {
                if (synthetic.length > 1) {
                    console.warn(`Multiple synthetics found for link <${this._node.value}>. Using the first one.`);
                }
                this.#isSynthetic = synthetic[0] === 'true';
            }
        }
        return this.#isSynthetic;
    }

}
