import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Redirects unauthenticated visitors to the login page. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('[authGuard]', auth.isLoggedIn(), auth.user(), localStorage.getItem('netflix-clone:user'));
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/** Only verified admins may manage the catalog. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAdmin() ? true : router.createUrlTree(['/home', 'browse']);
};
