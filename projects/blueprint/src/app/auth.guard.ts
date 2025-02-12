import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@blueprint/service/auth/auth.service';
import { environment } from '../environments/environment';

export const authGuard: CanActivateFn = () => {

  if (environment.skipAuthentication) {
    return true;
  }
  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) {
    const router = inject(Router);
    router.navigate(['login']);
  }
  return authService.isAuthenticated();
};
