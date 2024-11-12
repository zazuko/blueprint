import { GraphPointer } from "clownface";

import { PathStrategy } from "../strategy/path-strategy";
import { PathFactory } from "./path-factory";
import { OutgoingPathFactory } from "./outgoing-path-factory";
import { ObjectPath } from "../strategy/object-path";

export class IncomingPathFactory extends PathFactory {
    #outgoingPathFactory = new OutgoingPathFactory();

    createPath(pathNode: GraphPointer): PathStrategy {
        const outgoingPath = this.#outgoingPathFactory.createPath(pathNode);
        const pathFragments = outgoingPath.toPathFragments();
        pathFragments.reverse();
        const reversedPathFragment = pathFragments.map((fragment) => {
            if (fragment.startsWith('^')) {
                return fragment.substring(1);
            }
            return '^' + fragment;
        });
        return new ObjectPath(reversedPathFragment);

    }


}