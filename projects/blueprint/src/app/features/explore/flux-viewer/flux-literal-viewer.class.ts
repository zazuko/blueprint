import { FluxDetailMetadata } from "./flux-detail-metadata.class";
import { FluxViewer } from "./flux-detail-viewer.class";
import { FluxViewerType } from "./flux-viewer.model";
import { getPathPredicates } from "./metadata-utilities";
import { PathPredicate } from "./model/path-predicate.model";

export class FluxLiteralViewer extends FluxViewer {
    constructor(metadata: FluxDetailMetadata) {
        super(metadata);
    }

    get viewerType(): FluxViewerType {
        return FluxViewerType.LiteralViewer;
    }

    getPathsPredicates(): PathPredicate[][] {
        const predicatePaths = getPathPredicates(this.metadata.node);
        if (predicatePaths.length === 0) {
            console.log(
                `FluxLiteralViewer#model integrity: Detail metadata ${this.iri} has no Path defined.`
            );
        }
        return predicatePaths;
    }
}
