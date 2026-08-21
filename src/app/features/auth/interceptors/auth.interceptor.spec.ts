import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of } from 'rxjs';
import { authInterceptor } from '@features/auth/interceptors/auth.interceptor';
import { AuthService } from '@features/auth/services/application/auth.service';
import { environment } from '@env/environment';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: {
    getAccessToken: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      getAccessToken: vi.fn().mockReturnValue('access-token'),
      refreshToken: vi.fn(),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should bypass the real login endpoint without retrying on 401', () => {
    httpClient.post(`${environment.apiUrl}/portal/auth/login`, {}).subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/portal/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
  });

  it('should bypass the real refresh endpoint without retrying on 401', () => {
    httpClient.post(`${environment.apiUrl}/portal/auth/refresh`, {}).subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/portal/auth/refresh`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
  });

  it('should attach the access token to non-auth requests', () => {
    httpClient.get('/api/portal/dashboard').subscribe();

    const req = httpMock.expectOne('/api/portal/dashboard');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-token');
    req.flush({});
  });

  it('should refresh once and retry on a 401 from a non-auth request', () => {
    authServiceMock.refreshToken.mockReturnValue(
      of({ accessToken: 'new-token', refreshToken: 'new-refresh', expiresIn: 900000 }),
    );

    httpClient.get('/api/portal/dashboard').subscribe();

    const req1 = httpMock.expectOne('/api/portal/dashboard');
    req1.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refreshToken).toHaveBeenCalledTimes(1);

    const req2 = httpMock.expectOne('/api/portal/dashboard');
    expect(req2.request.headers.get('Authorization')).toBe('Bearer new-token');
    req2.flush({});
  });
});
