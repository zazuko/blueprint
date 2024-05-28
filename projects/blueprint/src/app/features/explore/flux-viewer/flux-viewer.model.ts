export interface FluxDetailViewer {
    sparqlQuery: string;
    viewerType: FluxViewerType;
}

export enum FluxViewerType {
    DetailViewer,
    LiteralViewer,
    ValueTableViewer,
    HyperlinkViewer,
    GroupViewer,
}