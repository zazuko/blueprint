import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@blueprint/service/auth/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) {
    const router = inject(Router);
    router.navigate(['login']);
  }
  return authService.isAuthenticated();
};
