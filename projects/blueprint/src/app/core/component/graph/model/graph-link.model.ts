import * as cola from 'webcola';

import { GraphNode } from './graph-node.model';

export interface GraphLink extends cola.Link<GraphNode> {
  id: string;
  label: string;
  //   index?: number;
}
