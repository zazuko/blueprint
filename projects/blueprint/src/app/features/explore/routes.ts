import { Routes } from '@angular/router';

import { ExploreComponent } from './explore/explore.component';

export const EXPLORE_ROUTES: Routes = [
  { path: ':subject', component: ExploreComponent },
  { path: '', component: ExploreComponent },
];
