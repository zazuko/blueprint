import { GraphPointer } from 'clownface';
import { ClownfaceObject } from '../clownface-object/clownface-object';
import { shacl } from '@blueprint/ontology';

import { OutgoingPathFactory } from 'projects/blueprint/src/app/shared/sparql/path/factory/outgoing-path-factory';
import { IncomingPathFactory } from 'projects/blueprint/src/app/shared/sparql/path/factory/incoming-path-factory';

export interface UiLinkDefinition {
    iri: string;
    label: string;
    propertyPath: string | null;
    inversePropertyPath: string | null;
    arrowSource: string | null;
    arrowTarget: string | null;
}



export class RdfUiLinkDefinition extends ClownfaceObject implements UiLinkDefinition {
    #arrowSource: string | null | undefined = undefined;
    #arrowTarget: string | null | undefined = undefined;
    #label: string | undefined = undefined;
    #propertyPath: string | null | undefined = undefined;
    #inversePropertyPath: string | null | undefined = undefined;

    constructor(node: GraphPointer) {
        super(node);
    }

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

}
