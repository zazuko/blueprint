import { Routes } from '@angular/router';
import { ClassDetailConfiguratorComponent } from './class-detail-configurator.component';

export const CLASS_DETAIL_CONFIGURATION_ROUTES: Routes = [
    { path: ':className/:id', component: ClassDetailConfiguratorComponent },
];
