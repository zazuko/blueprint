import { GraphPointer } from "clownface";

import { ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";

export abstract class CompositionToNodeLinkFactory {
    abstract creteLink(node: GraphPointer): ICompositionToNodeLink;
}