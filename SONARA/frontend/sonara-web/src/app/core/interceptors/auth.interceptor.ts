import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { API_PATHS } from '../../constants/api.constants';
import { AuthService } from '../services/auth.service';

let refreshing$: Observable<unknown> | null = null; // single-flight: one refresh for many 401s

const isAuthCall = (url: string) =>
  [API_PATHS.auth.login, API_PATHS.auth.refresh, API_PATHS.auth.register, API_PATHS.auth.me].some((p) => url.includes(p));

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('sonara_access_token');

  const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;
  const authed = req.clone({ withCredentials: true, headers }); // send HttpOnly cookies + Bearer token fallback

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall(req.url)) return throwError(() => err);

      refreshing$ ??= auth.refresh().pipe(finalize(() => (refreshing$ = null)), shareReplay(1));
      return refreshing$.pipe(
        switchMap(() => next(authed)),
        catchError((e) => {
          auth.clearLocalSession();
          router.navigateByUrl('/login');
          return throwError(() => e);
        }),
      );
    }),
  );
};
