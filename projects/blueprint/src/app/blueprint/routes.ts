import { Routes } from '@angular/router';
import { BlueprintComponent } from './blueprint.component';

export const routes: Routes = [
    {
        path: '',
        component: BlueprintComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'search',
            },
            {
                path: 'explore',
                loadChildren: () =>
                    import('../features/explore/routes').then(
                        (m) => m.EXPLORE_ROUTES
                    ),
            },
            {
                path: 'search',
                loadChildren: () =>
                    import('../features/search/routes').then((m) => m.SEARCH_ROUTES),
            },
            {
                path: 'inventory',
                loadChildren: () =>
                    import('../features/inventory/routes').then(
                        (m) => m.INVENTORY_ROUTES
                    ),
            },
            {
                path: 'configurator',
                loadChildren: () =>
                    import('../features/configuration/routes').then(
                        (m) => m.CONFIGURATION_ROUTES
                    ),
            },
            {
                path: 'playground',
                loadChildren: () =>
                    import('../features/playground/routes').then(
                        (m) => m.PLAYGROUND_ROUTES
                    ),
            }
        ]
    },

];