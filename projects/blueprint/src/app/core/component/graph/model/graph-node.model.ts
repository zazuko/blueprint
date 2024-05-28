import * as cola from 'webcola';

export interface GraphNode extends cola.InputNode {
  id: string;
  type: string;
  label: string;
  icon?: string;
  colorIndex: string;
  expanded?: boolean;
  linksLimitedTo: number;
  showPin?: boolean;
  showMenu?: boolean;
  isPinned?: boolean;
}
