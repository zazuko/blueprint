import { Routes } from '@angular/router';
import { TreeDetailComponent } from './tree-detail.component';

export const TREE_DETAIL_CONFIGURATION_ROUTES: Routes = [
    { path: ':id', component: TreeDetailComponent },
];
