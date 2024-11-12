import { GraphPointer } from "clownface";

import { PathStrategy } from "../strategy/path-strategy";


export abstract class PathFactory {
    abstract createPath(pathNode: GraphPointer): PathStrategy;
}