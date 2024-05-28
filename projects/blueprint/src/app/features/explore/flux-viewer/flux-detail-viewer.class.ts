import { FluxDetailViewer, FluxViewerType } from "./flux-viewer.model";
import { FluxDetailMetadata } from './flux-detail-metadata.class'

export abstract class FluxViewer implements FluxDetailViewer {
    private _sparqlQuery: string = null;

    constructor(public metadata: FluxDetailMetadata) { }

    get iri(): string {
        return this.metadata.iri;
    }

    get label(): string {
        return this.metadata.label;
    }

    get group(): string {
        return this.metadata.group;
    }

    get order(): number {
        return this.metadata.order;
    }

    get sparqlQuery(): string {
        return this._sparqlQuery;
    }

    set sparqlQuery(query: string) {
        this._sparqlQuery = query;
    }

    abstract get viewerType(): FluxViewerType;
}
