import { FluxDetailMetadata } from "./flux-detail-metadata.class";
import { FluxViewer } from "./flux-detail-viewer.class";
import { FluxViewerType } from "./flux-viewer.model";

export class FluxGroupViewer extends FluxViewer {
    private _members: FluxViewer[] = [];

    constructor(metadata: FluxDetailMetadata) {
        super(metadata);
    }

    get viewerType(): FluxViewerType {
        return FluxViewerType.GroupViewer;
    }

    get members(): FluxViewer[] {
        return this._members;
    }

    set members(members: FluxViewer[]) {
        this._members = members;
    }
}
