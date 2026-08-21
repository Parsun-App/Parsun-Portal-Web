import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '@features/auth/services/application/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const bypassPaths = [
    '/api/portal/auth/login',
    '/api/portal/auth/refresh',
    '/api/portal/auth/logout',
  ];
  if (bypassPaths.some((path) => req.url.includes(path))) {
    return next(req);
  }

  const token = authService.getAccessToken();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            if (response) {
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` },
              });
              return next(retryReq);
            }
            authService.logout();
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
