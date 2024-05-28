import { Routes } from '@angular/router';
import { GraphDetailComponent } from './graph-detail.component';

export const GRAPH_DETAIL_CONFIGURATION_ROUTES: Routes = [
    { path: ':id', component: GraphDetailComponent },
];
