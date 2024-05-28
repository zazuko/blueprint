import { Routes } from '@angular/router';
import { DetailConfiguratorComponent } from './detail-configurator.component';

export const DETAIL_CONFIGURATION_ROUTES: Routes = [
    { path: '', component: DetailConfiguratorComponent },
    { path: 'detail', loadChildren: () => import('../class-detail-configurator/routers').then((m) => m.CLASS_DETAIL_CONFIGURATION_ROUTES) },

];
