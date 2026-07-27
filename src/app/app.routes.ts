import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/router/auth.routes').then(m => m.authRoutes),
  },
  {
    path: '',
    loadComponent: () => import('./core/layouts/portal-layout.component').then(m => m.PortalLayoutComponent),
    canActivate: [() => import('./features/auth/guards/auth.guard').then(m => m.authGuard)],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'products', loadComponent: () => import('./features/products/products-page.component').then(m => m.ProductsPageComponent) },
      { path: 'quotes', loadComponent: () => import('./features/quotes/quotes-page.component').then(m => m.QuotesPageComponent) },
      { path: 'orders', loadComponent: () => import('./features/orders/orders-page.component').then(m => m.OrdersPageComponent) },
      { path: 'invoices', loadComponent: () => import('./features/invoices/invoices-page.component').then(m => m.InvoicesPageComponent) },
      { path: 'payments', loadComponent: () => import('./features/payments/payments-page.component').then(m => m.PaymentsPageComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile-page.component').then(m => m.ProfilePageComponent) },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
