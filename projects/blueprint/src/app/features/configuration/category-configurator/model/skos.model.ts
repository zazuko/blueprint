import { GraphPointer } from 'clownface';
import rdfEnvironment from '@zazuko/env';
import { Dataset, NamedNode, Term } from '@rdfjs/types';
import { rdf } from '@blueprint/ontology';


const Skos = new Map<string, NamedNode>([
    ['prefLabel', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#prefLabel')],
    ['altLabel', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#altLabel')],
    ['hiddenLabel', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#hiddenLabel')],
    ['notation', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#notation')],
    ['definition', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#definition')],
    ['broader', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#broader')],
    ['narrower', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#narrower')],
    ['related', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#related')],
    ['hidden', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#hidden')],
    ['deprecated', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#deprecated')],
    ['order', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#order')],
    ['hasTopConcept', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#hasTopConcept')],
    ['topConceptOf', rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#topConceptOf')]

]);

// category interface based on SKOS
export interface Category {
    id: string;
    prefLabel: string;
    altLabel?: string[];
    definition?: string;
    broader: Category | null;
    narrower: Category[];
    related?: string[];
    hiddenLabel?: boolean;
    hidden?: boolean;
    deprecated?: boolean;
    order?: number;
}


export abstract class RdfNode {
    protected readonly _iri: NamedNode;
    protected readonly _clownfaceNode: GraphPointer<Term, Dataset>;


    constructor(iri: NamedNode, dataset: Dataset) {
        this._iri = iri;
        this._clownfaceNode = rdfEnvironment.clownface({ dataset }).node(iri);
    }

    get iri(): NamedNode {
        return this._iri;
    }

    get dataset(): Dataset {
        return this._clownfaceNode.dataset;
    }

    abstract serialize(): string


}

export class SkosConcept extends RdfNode {

    constructor(iri: NamedNode, dataset: Dataset) {
        super(iri, dataset);
        this._clownfaceNode.addOut(rdf.typeNamedNode), rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#Concept');
    }

    override serialize(): string {
        return this._iri.value;
    }

    get prefLabel(): string {
        return this._clownfaceNode.out(Skos.get('prefLabel')).value;
    }

    set prefLabel(value: string) {
        this._clownfaceNode.deleteOut(Skos.get('prefLabel'));
        this._clownfaceNode.addOut(Skos.get('prefLabel'), value);
    }

    get altLabel(): string[] {
        return this._clownfaceNode.out(Skos.get('altLabel')).values;
    }

    set altLabel(value: string[]) {
        this._clownfaceNode.deleteOut(Skos.get('altLabel'));
        this._clownfaceNode.addOut(Skos.get('altLabel'), value);
    }

    get hiddenLabel(): string[] {
        return this._clownfaceNode.out(Skos.get('hiddenLabel')).values;
    }

    set hiddenLabel(value: string[]) {
        this._clownfaceNode.deleteOut(Skos.get('hiddenLabel'));
        this._clownfaceNode.addOut(Skos.get('hiddenLabel'), value);
    }

    get notation(): string {
        return this._clownfaceNode.out(Skos.get('notation')).value;
    }

    set notation(value: string) {
        this._clownfaceNode.deleteOut(Skos.get('notation'));
        this._clownfaceNode.addOut(Skos.get('notation'), value);
    }

    get definition(): string {
        return this._clownfaceNode.out(Skos.get('definition')).value;
    }

    set definition(value: string) {
        this._clownfaceNode.deleteOut(Skos.get('definition'));
        this._clownfaceNode.addOut(Skos.get('definition'), value);
    }

    get topConceptOf(): SkosConceptScheme[] {
        return this._clownfaceNode.out(Skos.get('topConceptOf')).values.map((iri) => new SkosConceptScheme(rdfEnvironment.namedNode(iri), this.dataset));
    }

    set topConceptOf(conceptScheme: SkosConceptScheme[]) {
        this._clownfaceNode.deleteOut(Skos.get('topConceptOf'));
        conceptScheme.forEach((scheme) => {
            this._clownfaceNode.addOut(Skos.get('topConceptOf'), scheme.iri);
        }
        );
    }

    get broader(): SkosConcept | null {
        const broader = this._clownfaceNode.out(Skos.get('broader')).term;
        if (broader === null) {
            return null;
        }
        return new SkosConcept(rdfEnvironment.namedNode(broader.value), this.dataset);
    }

    set broader(concept: SkosConcept | null) {
        this._clownfaceNode.deleteOut(Skos.get('broader'));
        if (concept !== null) {
            this._clownfaceNode.addOut(Skos.get('broader'), concept.iri);
        }
    }

    get narrower(): SkosConcept[] {
        return this._clownfaceNode.out(Skos.get('narrower')).values.map((iri) => new SkosConcept(rdfEnvironment.namedNode(iri), this.dataset));
    }

    set narrower(concepts: SkosConcept[]) {
        this._clownfaceNode.deleteOut(Skos.get('narrower'));
        concepts.forEach((concept) => {
            this._clownfaceNode.addOut(Skos.get('narrower'), concept.iri);
        }
        );
    }
}


/**
 * A concept scheme is a set of concepts, optionally including statements about semantic relationships between those concepts.
 * A concept scheme may be defined to include all concepts in a given knowledge organization system, or just those concepts
 * which are used in a particular context. In the context of this Recommendation, a concept scheme is understood to be a set of 
 * concepts, possibly including statements about semantic relationships between those concepts. 
 */

export class SkosConceptScheme extends RdfNode {

    private static schemaInstanceCount = 0;

    private _conceptInstanceCount = 0;

    static createEmptyConceptScheme(): SkosConceptScheme {
        const iri = rdfEnvironment.namedNode('http://www.blueprint.org/ontology/CategoryScheme/' + SkosConceptScheme.schemaInstanceCount++ + '/');
        const dataset = rdfEnvironment.dataset() as unknown as Dataset;
        return new SkosConceptScheme(iri, dataset);
    }

    constructor(iri: NamedNode, dataset: Dataset) {
        super(iri, dataset);
        this._clownfaceNode.addOut(rdf.typeNamedNode), rdfEnvironment.namedNode('http://www.w3.org/2004/02/skos/core#ConceptScheme');
    }

    createEmptyConcept(): SkosConcept {
        const iri = rdfEnvironment.namedNode(this.iri.value + '/' + this._conceptInstanceCount++ + '/');
        return new SkosConcept(iri, this._clownfaceNode.dataset);
    }
    override serialize(): string {
        return this._iri.value;
    }

    get prefLabel(): string {
        return this._clownfaceNode.out(Skos.get('prefLabel')).value;
    }

    set prefLabel(value: string) {
        this._clownfaceNode.deleteOut(Skos.get('prefLabel'));
        this._clownfaceNode.addOut(Skos.get('prefLabel'), value);
    }

    get altLabel(): string[] {
        return this._clownfaceNode.out(Skos.get('altLabel')).values;
    }

    set altLabel(value: string[]) {
        this._clownfaceNode.deleteOut(Skos.get('altLabel'));
        this._clownfaceNode.addOut(Skos.get('altLabel'), value);
    }

    get hiddenLabel(): string[] {
        return this._clownfaceNode.out(Skos.get('hiddenLabel')).values;
    }

    set hiddenLabel(value: string[]) {
        this._clownfaceNode.deleteOut(Skos.get('hiddenLabel'));
        this._clownfaceNode.addOut(Skos.get('hiddenLabel'), value);
    }

    get notation(): string {
        return this._clownfaceNode.out(Skos.get('notation')).value;
    }

    set notation(value: string) {
        this._clownfaceNode.deleteOut(Skos.get('notation'));
        this._clownfaceNode.addOut(Skos.get('notation'), value);
    }

    get definition(): string {
        return this._clownfaceNode.out(Skos.get('definition')).value;
    }

    set definition(value: string) {
        this._clownfaceNode.deleteOut(Skos.get('definition'));
        this._clownfaceNode.addOut(Skos.get('definition'), value);
    }

    get topConcepts(): SkosConcept[] {
        return this._clownfaceNode.out(Skos.get('hasTopConcept')).values.map((iri) => new SkosConcept(rdfEnvironment.namedNode(iri), this.dataset));
    }

    set topConcepts(concepts: SkosConcept[]) {
        this._clownfaceNode.deleteOut(Skos.get('hasTopConcept'));

        concepts.forEach((concept) => {
            this._clownfaceNode.addOut(Skos.get('hasTopConcept'), concept.iri);
        }
        );
    }
}