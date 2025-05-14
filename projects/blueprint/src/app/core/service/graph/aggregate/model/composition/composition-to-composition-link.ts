import { GraphPointer } from "clownface";
import { ClownfaceObject } from "@blueprint/model/clownface-object/clownface-object";
import { flux, rdfs, shacl } from "@blueprint/ontology";
import { Composition } from "../composition";
import { PathDefinition } from "../path-definition";



export interface ICompositionToCompositionLink {
    iri: string;
    sourceComposition: Composition | null;
    targetComposition: Composition | null;
    label: string;
    path: PathDefinition[][];
}

export class CompositionToCompositionLink extends ClownfaceObject implements ICompositionToCompositionLink {

    #sourceComposition: Composition | null | undefined = undefined;
    #targetComposition: Composition | null | undefined = undefined;
    #label: string | null = null;


    constructor(node: GraphPointer) {
        super(node);
    }

    get sourceComposition(): Composition | null {
        if (this.#sourceComposition === undefined) {

            const sourceCompositions = this._node.out(shacl.targetClassNamedNode).map(p => new Composition(p));

            if (sourceCompositions.length === 0) {
                console.warn(`AggregateLink has no sourceIri: ${this._node.value}`);
                this.#sourceComposition = null;
            } else {
                if (sourceCompositions.length > 1) {
                    console.warn(`AggregateLink has more than one source composition: ${this._node.value}. Using the first one.`);
                }
                this.#sourceComposition = sourceCompositions[0];
            }
        }
        return this.#sourceComposition;
    }

    get targetComposition(): Composition | null {
        if (this.#targetComposition === undefined) {
            const targetCompositions = this._node.out(flux.targetNamedNode).map(n => new Composition(n));
            if (targetCompositions.length === 0) {
                console.warn(`AggregateLink has no sourceIri: ${this._node.value}`);
                this.#targetComposition = null;
            } else {
                if (targetCompositions.length > 1) {
                    console.warn(`AggregateLink has more than one target compositions: ${this._node.value}. Using the first one.`);
                }
                this.#targetComposition = targetCompositions[0];
            }
        }
        return this.#targetComposition;
    }

    get label(): string {
        if (this.#label === null) {
            const labels = this._node.out(rdfs.labelNamedNode).values;
            if (labels.length === 0) {
                console.warn(`AggregateLink has no label: ${this._node.value}. Using "" as label.`);
                this.#label = '';
            } else {
                if (labels.length > 1) {
                    console.warn(`AggregateLink has more than one label: ${labels}. Joining them with a space.`);
                }
                this.#label = labels.join(' ');
            }
        }
        return this.#label;
    }

    get path(): PathDefinition[][] {
        const path = this._node.out(shacl.propertyNamedNode).map(p => {
            const targetClass = p.out(shacl.targetClassNamedNode).values[0];
            const shClass = p.out(shacl.classNamedNode).values[0];
            const cfPath = p.out(shacl.pathNamedNode).toArray()[0];

            if (cfPath.term.termType === 'NamedNode') {
                return [new PathDefinition(targetClass, shClass, [`<${cfPath.value}>`])];
            }
            if (cfPath.term.termType === 'BlankNode') {
                const inversePath = cfPath.out(shacl.inversePathNamedNode).values[0];
                return [new PathDefinition(targetClass, shClass, [`<${inversePath}>`])];
            }
            console.warn(`no path found for path element: ${p}`);
            return [] as PathDefinition[];
        });

        return path;
    }

    invert(): ICompositionToCompositionLink {
        return {
            iri: this.iri,
            sourceComposition: this.targetComposition,
            targetComposition: this.sourceComposition,
            label: this.label,
            path: this.path.map(path => path.map(p => p.invert()))
        };
    }
}

