import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  if (typeof window !== 'undefined') {

    const token = localStorage.getItem('token');

    return !!token;

  }

  return false;

};
