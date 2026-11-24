import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

const API_PATH_PREFIX = '/api';

export const apiUrlInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(`${API_PATH_PREFIX}/`)) {
    return next(request);
  }

  const url = `${environment.apiUrl}${request.url.slice(API_PATH_PREFIX.length)}`;
  return next(request.clone({ url }));
};
