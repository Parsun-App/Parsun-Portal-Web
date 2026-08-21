import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { AuthService } from '@features/auth/services/application/auth.service';
import { AuthApiService } from '@features/auth/services/api/auth-api.service';

describe('AuthService', () => {
  let service: AuthService;
  let authApiMock: { login: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authApiMock = {
      login: vi.fn(),
      logout: vi.fn().mockReturnValue(of(undefined)),
    };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: authApiMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should navigate to the real /auth/login route on logout', () => {
    service.logout();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should navigate to /auth/login when refreshToken runs with no stored token', () => {
    service.refreshToken().subscribe();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should translate inactive account errors for the portal login', async () => {
    authApiMock.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Account is not active or portal access is disabled' } })),
    );

    await service.login('J-123', 'password');

    expect(service.error()).toBe('La cuenta no está activa o el acceso al portal está deshabilitado.');
  });

  it('should hide non-unique query errors behind an invalid credentials message', async () => {
    authApiMock.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Query did not return a unique result: 2 results were returned' } })),
    );

    await service.login('J-123', 'password');

    expect(service.error()).toBe('Los datos introducidos son incorrectos.');
  });
});
