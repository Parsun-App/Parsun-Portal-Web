import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import { authGuard } from './features/auth/guards/auth.guard';

describe('application routes', () => {
  it('protects the persistent portal shell with the auth guard', () => {
    const shellRoute = routes.find((route) => route.path === '' && route.children);

    expect(shellRoute?.canActivate).toEqual([authGuard]);
    expect(shellRoute?.children?.some((route) => route.path === 'dashboard')).toBe(true);
  });

  it('lazy loads public authentication routes', async () => {
    const authRoute = routes.find((route) => route.path === 'auth');
    const authRoutes = await authRoute?.loadChildren?.();
    const loginRoute = Array.isArray(authRoutes)
      ? authRoutes.find((route) => route.path === 'login')
      : undefined;

    expect(loginRoute?.loadComponent).toBeDefined();
    expect(loginRoute?.component).toBeUndefined();
  });
});
