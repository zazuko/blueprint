import { GraphNode } from './graph-node.model';
import { GraphLink } from './graph-link.model';

export interface Graph {
  nodes: GraphNode[];
  links: GraphLink[];
}
