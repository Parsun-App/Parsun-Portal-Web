import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/router/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    loadComponent: () =>
      import('@core/layouts/portal-layout.component').then((m) => m.PortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/router/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('@features/products/router/products.routes').then((m) => m.productsRoutes),
      },
      {
        path: 'quotes',
        loadChildren: () =>
          import('@features/quotes/router/quotes.routes').then((m) => m.quotesRoutes),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('@features/orders/router/orders.routes').then((m) => m.ordersRoutes),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('@features/invoices/router/invoices.routes').then((m) => m.invoicesRoutes),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('@features/payments/router/payments.routes').then((m) => m.paymentsRoutes),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('@features/profile/router/profile.routes').then((m) => m.profileRoutes),
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
