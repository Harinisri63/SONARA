import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (role: string): CanActivateFn => () => {
  const auth = inject(AuthService), router = inject(Router);
  return auth.user()?.roles.includes(role) ? true : router.createUrlTree(['/home']);
};
