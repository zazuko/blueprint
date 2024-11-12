import { GraphPointer } from "clownface";

import { ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";

export abstract class CompositionToNodeLinkFactory {
    abstract createCompositionToNodeLink(node: GraphPointer): ICompositionToNodeLink;
}