import { Routes } from '@angular/router';
import { HorizontalTreeDetailComponent } from './horizontal-tree-detail.component';

export const HORIZONTAL_TREE_DETAIL_CONFIGURATION_ROUTES: Routes = [
    { path: ':id', component: HorizontalTreeDetailComponent },
];
