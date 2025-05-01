import { IUiGraphNode } from "../../model/graph.model";

export interface MultiLinkLabels {
  backward: string[];
  forward: string[];
  source: IUiGraphNode;
  target: IUiGraphNode;
}
