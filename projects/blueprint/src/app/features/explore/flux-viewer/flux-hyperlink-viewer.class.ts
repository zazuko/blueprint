import { FluxDetailMetadata } from "./flux-detail-metadata.class";
import { FluxViewer } from "./flux-detail-viewer.class";
import { FluxViewerType } from "./flux-viewer.model";

import { shacl } from '@blueprint/ontology';
import { PathPredicate } from "./model/path-predicate.model";
import { getPathPredicates } from "./metadata-utilities";
export class FluxHyperlinkViewer extends FluxViewer {
    constructor(metadata: FluxDetailMetadata) {
        super(metadata);
    }

    get viewerType(): FluxViewerType {
        return FluxViewerType.HyperlinkViewer;
    }

    getLiteralPathsPredicates(): PathPredicate[][] {
        const node = this.metadata.node.out(shacl.nodeNamedNode).has(shacl.nodeKindNamedNode, shacl.LiteralNamedNode);
        const predicatePaths = getPathPredicates(node);
        if (predicatePaths.length === 0) {
            console.log(
                `FluxHyperLinkViewer#model integrity: Detail metadata ${this.iri} has no Path for literal defined.`
            );
        }
        return predicatePaths;
    }

    getHrefPathsPredicates(): PathPredicate[][] {
        const node = this.metadata.node.out(shacl.nodeNamedNode).has(shacl.nodeKindNamedNode, shacl.IRINamedNode);

        const predicatePaths = getPathPredicates(node);
        if (predicatePaths.length === 0) {
            console.log(
                `FluxHyperLinkViewer#model integrity: Detail metadata ${this.iri} has no Path for href defined.`
            );
        }
        return predicatePaths;
    }
}
