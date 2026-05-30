import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from '../services/auth.service';

const ROLE_DASHBOARD: Record<string, string> = {
  [Role.ADMIN]:                  '/admin/dashboard',
  [Role.CLIENT]:                 '/client/dashboard',
  [Role.RECEPTION]:  '/reception/dashboard',
  [Role.TECHNICIEN]:             '/technicien/dashboard',
  [Role.RESPONSABLE_REPARATION]: '/reparation/dashboard',
  [Role.ACHAT_STOCK]:'/stock/dashboard',
};

export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/']);
      return false;
    }

    if (auth.hasRole(allowedRoles)) {
      return true;
    }

    // Redirect to the correct dashboard for the current role
    const role = auth.getRole() ?? '';
    const dest = ROLE_DASHBOARD[role] ?? '/';
    router.navigate([dest]);
    return false;
  };
}
