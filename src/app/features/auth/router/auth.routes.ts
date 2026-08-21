import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@features/auth/pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
