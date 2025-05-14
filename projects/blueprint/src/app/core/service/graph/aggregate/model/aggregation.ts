import { ClownfaceObject } from '@blueprint/model/clownface-object/clownface-object';
import { flux, rdf, shacl } from '@blueprint/ontology';
import { GraphPointer } from 'clownface';
import { PathDefinition } from './path-definition';


export abstract class Aggregation extends ClownfaceObject {
    private _aggregateNodes: AggregateMemberNode[] | null = null;
    private _rdfTypeIris: string[] | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    get rdfTypeIris(): string[] {
        if (this._rdfTypeIris === null) {
            this._rdfTypeIris = this._node.out(rdf.typeNamedNode).values;
        }
        return this._rdfTypeIris;
    }

    /**
    * The member nodes of the aggregate. The member nodes are the nodes that are part of the aggregate 
    * but not exposed to the outside. They contain the internal structure of the composition.
    * 
    * @readonly
    */
    get aggregateNodes(): AggregateMemberNode[] {
        if (this._aggregateNodes === null) {
            this._aggregateNodes = this._node.in(shacl.groupNamedNode).map(node => new AggregateMemberNode(node));
        }
        return this._aggregateNodes;
    }

    /**
    * The root iri of the aggregate. The root is the node that is the entry point of the aggregate.
    * If this return undefined. There is a configuration error in the flux.
    * 
    * @readonly
    */
    get rootIri(): string | undefined {
        return this._node.out(flux.hasRootNamedNode).value;
    }
}


/**
 * This class represents an inner node of an Aggregate.
 * It provides information about the target class and the path to the root.
 * 
 * It also provides information if it's a connection point. An connection point
 * is a node that is exposed to the outside and can be connected to other nodes or aggregates.
 */
export class AggregateMemberNode extends ClownfaceObject {

    private _targetClassIri: string | null | undefined = undefined;
    private _pathToRoot: PathDefinition[] | null = null;
    private _isConnectionPoint: boolean | null = null;

    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * Check if the node is a connection point. A connection point allows links to other nodes or aggregates.
     * 
     * @readonly
     * 
     */
    get isConnectionPoint(): boolean {
        if (this._isConnectionPoint === null) {
            this._isConnectionPoint = this._node.has(rdf.typeNamedNode, flux.ConnectionPointNamedNode).values.length > 0;
        }
        return this._isConnectionPoint
    }

    /**
     * The target class of the node. The target RDF class is the class that is represented by the node.
     * 
     * @readonly
     */
    get targetClassIri(): string {
        if (this._targetClassIri === undefined) {
            const targetClassIris = this._node.out(shacl.targetClassNamedNode).values;
            if (targetClassIris.length === 0) {
                console.warn(`ConnectionPoint has no targetClass: ${this._node.value}`);
                this._targetClassIri = null;
            } else {
                if (targetClassIris.length > 1) {
                    console.warn(`ConnectionPoint has more than one targetClass: ${targetClassIris}. Using the first one.`);
                }
                this._targetClassIri = targetClassIris[0];
            }
        }
        return this._targetClassIri;
    }

    /**
     * The path to the root of the aggregate. This is the path inside the aggregate to reach the root.
     * 
     * @readonly
     */
    get pathToRoot(): PathDefinition[] {
        if (this._pathToRoot === null) {
            this._pathToRoot = [];
            this._traversePathToRoot(this._node, this._pathToRoot);
        }
        return this._pathToRoot;
    }

    /**
     * The path from the Aggregation root node to this node.
     * It's the inverse of the pathToRoot.
     * 
     * @readonly 
     */
    get pathFromRoot(): PathDefinition[] {
        return this.pathToRoot.reverse().map(pathElement => pathElement.invert());
    }

    private _traversePathToRoot(node: GraphPointer, path: PathDefinition[]): void {
        if (node.in(flux.hasRootNamedNode).values.length > 0) {
            return;
        }
        const pathElementNodes = node.in(shacl.nodeNamedNode);
        const cfPath = pathElementNodes.out(shacl.pathNamedNode);
        if (cfPath.values.length !== 1) {
            console.warn(`PathElement has no path: ${pathElementNodes.values}`);
            return;
        }
        if (cfPath.term.termType === 'BlankNode') {
            const inversePaths = cfPath.out(shacl.inversePathNamedNode).values;
            if (inversePaths.length !== 1) {
                console.warn(`PathElement has no inversePath: ${cfPath.values}`);
                return;
            }
            const inversePath = inversePaths[0];
            path.push(new PathDefinition(node.out(shacl.targetClassNamedNode).value,
                pathElementNodes.in(shacl.propertyNamedNode).out(shacl.targetClassNamedNode).value,
                [`<${inversePath}>`]))

        } else {
            path.push(new PathDefinition(
                node.out(shacl.targetClassNamedNode).value,
                pathElementNodes.in(shacl.propertyNamedNode).out(shacl.targetClassNamedNode).value,
                [`^<${cfPath.values[0]}>`]
            ));
        }
        const nextNodeShape = pathElementNodes.in(shacl.propertyNamedNode);
        this._traversePathToRoot((nextNodeShape as GraphPointer), path);

    }
}
