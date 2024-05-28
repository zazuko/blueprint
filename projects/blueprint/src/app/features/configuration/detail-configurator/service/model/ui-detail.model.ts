import { rdf, rdfs, shacl } from '@blueprint/ontology';
import RDF from '@rdfjs/types';
import rdfEnvironment from '@zazuko/env';
import { GraphPointer } from 'clownface';

const dash = rdfEnvironment.namespace<string>('http://datashapes.org/dash#');


export enum UiDetailViewerType {
    LITERAL = 'UiDetailLiteralViewer',
    GROUP = 'UiDetailGroupViewer'
}

export abstract class UiDetailMetadata {
    protected readonly _clownfaceNode: GraphPointer
    private readonly _rdfIdentifier: RDF.NamedNode;

    protected constructor(rdfIdentifier: RDF.NamedNode, dataset: RDF.Dataset) {
        this._rdfIdentifier = rdfIdentifier;
        this._clownfaceNode = rdfEnvironment.clownface({ dataset }).node(rdfIdentifier);
    }

    public abstract readonly viewerType: UiDetailViewerType;

    get rdfIdentifier(): RDF.NamedNode {
        return this._rdfIdentifier;
    }

    get label(): string {
        return this._clownfaceNode.out(rdfs.labelNamedNode).value;
    }
}



export class UiDetailLiteralViewer extends UiDetailMetadata {
    public readonly desperate = 'L'
    public readonly viewerType = UiDetailViewerType.LITERAL;

    constructor(rdfIdentifier: RDF.NamedNode, dataset: RDF.Dataset) {
        super(rdfIdentifier, dataset);
    }



    get rdfType(): RDF.Term {
        return this._clownfaceNode.out(rdf.typeNamedNode).term;
    }

    get path(): string[] {
        const cfPath = this._clownfaceNode.out(shacl.pathNamedNode);
        if (cfPath.isList()) {
            const propertyPath: string[] = [];

            [...cfPath.list()].forEach(path => {
                if (path.term.termType === 'BlankNode') {
                    const inversePath = path.out(shacl.inversePathNamedNode).value;
                    propertyPath.push(`^<${inversePath}>`);
                } else {
                    propertyPath.push(`<${path.value}>`);
                }
            });
            return propertyPath;
        }
        if (cfPath.term.termType === 'BlankNode') {
            // this is never happening
            const inversePath = cfPath.out(shacl.inversePathNamedNode).value;
            return [`^<${inversePath}>`];
        }
        return [`<${cfPath.value}>`];
    }

    get propertyPath(): string {
        return this.path.join('/');
    }

    get order(): number {
        return Number(this._clownfaceNode.out(shacl.orderNamedNode).value);
    }

    get rdfClass(): RDF.Term {
        return this._clownfaceNode.out(rdfs['class']).term;
    }

    get group(): UiDetailGroupViewer | null {
        const cfGroup = this._clownfaceNode.out(shacl.groupNamedNode);
        if (cfGroup.values.length !== 1) {
            return null;
        }
        return new UiDetailGroupViewer(rdfEnvironment.namedNode(cfGroup.value), this._clownfaceNode.dataset as RDF.Dataset);
    }

}

export class UiDetailGroupViewer extends UiDetailMetadata {
    public readonly desperate = 'G'
    public readonly viewerType = UiDetailViewerType.GROUP;

    constructor(rdfIdentifier: RDF.NamedNode, dataset: RDF.Dataset) {
        super(rdfIdentifier, dataset);
    }



    get rdfType(): RDF.Term {
        return this._clownfaceNode.out(rdf.typeNamedNode).term;
    }

    get order(): number {
        return Number(this._clownfaceNode.out(shacl.orderNamedNode).value);
    }

    get rdfClass(): RDF.Term {
        return this._clownfaceNode.out(rdfs.ClassNamedNode).term;
    }

    get members(): (UiDetailGroupViewer | UiDetailLiteralViewer)[] {
        return this._clownfaceNode.in(shacl.groupNamedNode).map(member => {
            if (member.out(dash['viewer']).term.equals(dash['LiteralViewer'])) {
                return new UiDetailLiteralViewer(rdfEnvironment.namedNode(member.value), this._clownfaceNode.dataset as RDF.Dataset);
            }
            return new UiDetailGroupViewer(rdfEnvironment.namedNode(member.value), this._clownfaceNode.dataset as RDF.Dataset);
        });
    }

}


export class LiteralViewerCollection {
    private readonly _dataset: RDF.Dataset;

    private _literalViewers: UiDetailLiteralViewer[];
    private _groups: UiDetailGroupViewer[];

    constructor(dataset: RDF.Dataset) {
        this._dataset = dataset;
        const literalViewerGraph = rdfEnvironment.clownface({ dataset: this._dataset }).node(dash['LiteralViewer']).in(dash['viewer']);
        this._literalViewers = literalViewerGraph.map(literalViewer => new UiDetailLiteralViewer(rdfEnvironment.namedNode(literalViewer.value), this._dataset));

        const groupIriSet = new Set<string>(literalViewerGraph.out(shacl.groupNamedNode).values);
        this._groups = [...groupIriSet].map(groupIri => new UiDetailGroupViewer(rdfEnvironment.namedNode(groupIri), this._dataset));
    }

    get literalViewers(): UiDetailLiteralViewer[] {
        return this._literalViewers;
    }

    get groups(): UiDetailGroupViewer[] {
        return this._groups;
    }
}
