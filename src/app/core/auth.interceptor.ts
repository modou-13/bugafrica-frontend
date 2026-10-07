import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './config';
import { AuthService } from './auth.service';

/** Ajoute le JWT à chaque appel vers l'API et déconnecte si le token est refusé. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const authed = token && req.url.startsWith(API_URL)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authed).pipe(catchError(err => {
    if (err.status === 401 && token) auth.logout();
    return throwError(() => err);
  }));
};
