import { GraphPointer } from "clownface";

import { CompositionToNodeLink, ICompositionToNodeLink } from "../../model/composition/composition-to-node-link";
import { CompositionToNodeLinkFactory } from "./composition-to-node-link-factory";

export class IncomingCompositionToNodeLinkFactory extends CompositionToNodeLinkFactory {

    creteLink(node: GraphPointer): ICompositionToNodeLink {

        return new CompositionToNodeLink(node).invert();
    }
}