import { Routes } from '@angular/router';
import { TopologyComponent } from './topology.component';

export const TOPOLOGY_CONFIGURATION_ROUTES: Routes = [
    { path: '', component: TopologyComponent },
    { path: 'tree', loadChildren: () => import('./tree-detail/routes').then((m) => m.TREE_DETAIL_CONFIGURATION_ROUTES) },
    { path: 'horizontal-tree', loadChildren: () => import('./horizontal-tree-detail/routes').then((m) => m.HORIZONTAL_TREE_DETAIL_CONFIGURATION_ROUTES) },
];
