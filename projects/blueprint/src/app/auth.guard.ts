import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@blueprint/service/auth/auth.service';
import { ConfigService } from '@blueprint/service/config/config.service';



export const authGuard: CanActivateFn = () => {
  const appConfig = inject(ConfigService).getConfiguration();

  if (appConfig.skipAuthentication) {
    return true;
  }

  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) {
    const router = inject(Router);
    router.navigate(['login']);
  }
  return authService.isAuthenticated();
};
