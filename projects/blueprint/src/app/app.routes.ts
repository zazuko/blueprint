import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [

  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./blueprint/routes').then(m => m.routes)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component')
        .then(m => m.LoginComponent)
  }
];