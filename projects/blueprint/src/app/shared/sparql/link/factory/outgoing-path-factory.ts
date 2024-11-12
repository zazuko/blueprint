import { GraphPointer } from "clownface";

import { PathStrategy } from "../strategy/path-strategy";
import { SimplePath } from "../strategy/simple-path";
import { InversePath } from "../strategy/inverse-path";
import { ListPath } from "../strategy/list-path";
import { PathFactory } from "./path-factory";

export class OutgoingPathFactory extends PathFactory {

    createPath(pathNode: GraphPointer): PathStrategy {
        if (pathNode.term.termType === 'NamedNode') {
            return new SimplePath(pathNode);
        }
        if (pathNode.isList()) {
            return new ListPath(pathNode);
        }
        if (pathNode.term.termType === 'BlankNode') {
            return new InversePath(pathNode);
        }
        if (pathNode.term.termType === 'Literal') {
            throw new TypeError('Path cannot cannot be a literal');
        }
        throw new TypeError('Path must be a NamedNode, BlankNode or a list');

    }


}