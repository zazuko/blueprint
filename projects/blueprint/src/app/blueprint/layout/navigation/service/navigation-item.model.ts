export interface NavigationItem {
    label?: string;
    path?: string;
    children?: NavigationItem[];
    isExternal?: boolean;
    isExpanded?: boolean;
    level?: number;
    parent?: NavigationItem;
    contentPath?: string;
}