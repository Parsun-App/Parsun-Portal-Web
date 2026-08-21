import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authGuard } from '@features/auth/guards/auth.guard';
import { AuthService } from '@features/auth/services/application/auth.service';

describe('authGuard', () => {
  let authServiceMock: { isAuthenticated: ReturnType<typeof vi.fn> };
  let routerMock: { parseUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { isAuthenticated: vi.fn() };
    routerMock = { parseUrl: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should allow access when authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(true);
    expect(routerMock.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to the real /auth/login route when not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const urlTree = {} as UrlTree;
    routerMock.parseUrl.mockReturnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(routerMock.parseUrl).toHaveBeenCalledWith('/auth/login');
    expect(result).toBe(urlTree);
  });
});
