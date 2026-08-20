import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { AuthService } from '@features/auth/services/application/auth.service';
import { AuthApiService } from '@features/auth/services/api/auth-api.service';

describe('AuthService', () => {
  let service: AuthService;
  let authApiMock: { logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authApiMock = { logout: vi.fn().mockReturnValue(of(undefined)) };
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
});
