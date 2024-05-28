import { GraphNode } from "../../model/graph-node.model";

export interface MultiLinkLabels {
  backward: string[];
  forward: string[];
  source: GraphNode;
  target: GraphNode;
}
