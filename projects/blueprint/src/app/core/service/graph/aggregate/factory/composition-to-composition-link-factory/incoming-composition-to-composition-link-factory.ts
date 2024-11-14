import { GraphPointer } from "clownface";

import { CompositionToCompositionLinkFactory } from "./composition-to-composition-link-factory";
import { CompositionToCompositionLink, ICompositionToCompositionLink } from "../../model/composition/composition-to-composition-link";

export class IncomingCompositionToCompositionLinkFactory extends CompositionToCompositionLinkFactory {

    creteLink(node: GraphPointer): ICompositionToCompositionLink {

        return new CompositionToCompositionLink(node).invert();
    }
}