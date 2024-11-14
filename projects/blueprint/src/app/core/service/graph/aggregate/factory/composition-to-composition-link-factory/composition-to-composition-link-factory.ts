import { GraphPointer } from "clownface";

import { ICompositionToCompositionLink } from "../../model/composition/composition-to-composition-link";

export abstract class CompositionToCompositionLinkFactory {
    abstract creteLink(node: GraphPointer): ICompositionToCompositionLink;
}