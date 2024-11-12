import { GraphPointer } from "clownface";
import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { blueprint, rdf, rdfs, shacl } from "@blueprint/ontology";
import { PathDefinition } from "../path-definition";
import { Composition } from "../composition";
import { OutgoingPathFactory } from "projects/blueprint/src/app/shared/sparql/path/factory/outgoing-path-factory";


export interface ICompositionToNodeLink {
    iri: string;
    sourceComposition: Composition | null;
    targetComposition: Composition | null;
    sourceNodeIri: string | null;
    targetNodeIri: string | null;
    label: string;
    path: PathDefinition[][];
}

export class CompositionToNodeLink extends ClownfaceObject implements ICompositionToNodeLink {
    private _sourceComposition: Composition | null | undefined = undefined;
    private _targetComposition: Composition | null | undefined = undefined;

    private _sourceNodeIri: string | null | undefined = undefined;
    private _targetNodeIri: string | null | undefined = undefined;

    private _label: string | null = null;


    constructor(node: GraphPointer) {
        super(node);
    }

    /**
     * The source composition of the link. The source composition is the composition that is the source of the link.
     * 
     * @readonly
     */
    get sourceComposition(): Composition | null {
        if (this._sourceComposition === undefined) {

            const sourceCompositions = this._node.out(shacl.targetClassNamedNode).map(p => new Composition(p));

            if (sourceCompositions.length === 0) {
                this._sourceComposition = null;
            } else {
                if (sourceCompositions.length > 1) {
                    console.warn(`AggregateLink has more than one source Composition: <${this._node.value}>. Using the first one.`);
                }
                this._sourceComposition = sourceCompositions[0];
            }
        }

        return this._sourceComposition;
    }

    /**
     * The target composition of the link. The target composition is the composition that is the target of the link.
     * It can be null if the link target is a node and not a composition.
     * 
     * @readonly
     */
    get targetComposition(): Composition | null {
        if (this._targetComposition === undefined) {
            const targetCompositions = this._node.out(blueprint.targetNamedNode).has(rdf.typeNamedNode, blueprint.CompositionNamedNode).map(p => new Composition(p));

            if (targetCompositions.length === 0) {
                this._targetComposition = null;
            } else {
                if (targetCompositions.length > 1) {
                    console.warn(`AggregateLink has more than one Composition <${this._node.value}>. Using the first one.`);
                }
                this._targetComposition = targetCompositions[0];
            }
        }

        return this._targetComposition;
    }

    /**
     * The label of the link. If the link is incomming the label is showing the bp:inverseLabel. 
     * This is done while fetching the data (SPARQL construct). 
     * 
     * @readonly
     */
    get label(): string {
        if (this._label === null) {
            const labels = this._node.out(rdfs.labelNamedNode).values;
            if (labels.length === 0) {
                console.warn(`AggregateLink has no label: ${this._node.value}. Using "" as label.`);
                this._label = '';
            } else {
                if (labels.length > 1) {
                    console.warn(`AggregateLink has more than one label: ${labels}. Joining them with a space.`);
                }
                this._label = labels.join(' ');
            }
        }
        return this._label;
    }

    /**
     * The path of the link. The path is the sequence of path elements that define the link.
     * 
     * @readonly
     */
    get path(): PathDefinition[][] {
        const path = this._node.out(shacl.propertyNamedNode).map(p => {
            const targetClass = p.out(shacl.targetClassNamedNode).values[0];
            const shClass = p.out(shacl.classNamedNode).values[0];
            const cfPath = p.out(shacl.pathNamedNode).toArray()[0];
            const pathFactory = new OutgoingPathFactory();
            debugger;
            const path = pathFactory.createPath(cfPath);
            return [new PathDefinition(targetClass, shClass, path.toPathFragments())];

        });

        return path;
    }

    /**
     * Get the IRI of the source node class of this link or null if the source node.
     * 
     * @readonly
     */
    get sourceNodeIri(): string | null {
        if (this._sourceNodeIri === undefined) {
            const sourceIris = this._node.out(blueprint.sourceNamedNode).values;
            if (sourceIris.length === 0) {
                this._sourceNodeIri = null;
            } else {
                if (sourceIris.length > 1) {
                    console.warn(`AggregateLink has more than one sourceNodeIri: ${sourceIris}. Using the first one.`);
                }
                this._sourceNodeIri = sourceIris[0];
            }
        }
        return this._sourceNodeIri;
    }

    /**
     * Get the IRI of the target node class of this link or null if the target node.
     * 
     * @readonly
     */
    get targetNodeIri(): string | null {
        if (this._targetNodeIri === undefined) {
            const targetIris = this._node.out(blueprint.targetNamedNode).values;
            if (targetIris.length === 0) {
                this._targetNodeIri = null;
            } else {
                if (targetIris.length > 1) {
                    console.warn(`AggregateLink has more than one targetNodeIri: ${targetIris}. Using the first one.`);
                }
                this._targetNodeIri = targetIris[0];
            }
        }
        return this._targetNodeIri;
    }

    invert(): ICompositionToNodeLink {
        return {
            iri: this.iri,
            sourceComposition: this.targetComposition,
            targetComposition: this.sourceComposition,
            sourceNodeIri: this.targetNodeIri,
            targetNodeIri: this.sourceNodeIri,
            label: this.label,
            path: this.path.map(path => path.map(p => p.invert()))
        };
    }
}
