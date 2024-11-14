import { GraphPointer } from "clownface";
import { CompositionToNodeLink } from "../../model/composition/composition-to-node-link";
import { CompositionToNodeLinkFactory } from "./composition-to-node-link-factory";

export class OutgoingCompositionToNodeLinkFactory extends CompositionToNodeLinkFactory {

    creteLink(node: GraphPointer): CompositionToNodeLink {
        return new CompositionToNodeLink(node);
    }
}