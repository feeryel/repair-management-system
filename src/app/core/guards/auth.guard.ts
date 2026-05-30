import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  if (typeof window !== 'undefined') {

    const token = localStorage.getItem('token');

    if (!token) {
      // ✅ Redirection explicite vers la page de login
      inject(Router).navigate(['/']);
      return false;
    }

    return true;
  }

  return false;

};
