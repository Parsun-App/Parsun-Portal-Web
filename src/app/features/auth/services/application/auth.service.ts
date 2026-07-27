import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, finalize, tap, switchMap, Observable, of, throwError } from 'rxjs';
import { AuthApiService } from '../api/auth-api.service';
import { CustomerSummary, PortalAuthResponse } from '../../models/interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly currentCustomerSignal = signal<CustomerSummary | null>(null);
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);
  readonly currentUser = computed(() => this.currentCustomerSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly currentUser$ = toObservable(this.currentCustomerSignal);

  constructor() {
    this.loadAuthFromStorage();
  }

  login(rif: string, password: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Promise((resolve) => {
      this.authApi.login({ rif, password }).pipe(
        tap(response => this.setSession(response)),
        catchError(err => {
          this.errorSignal.set(err.error?.message || 'Error al iniciar sesión');
          return throwError(() => err);
        }),
        finalize(() => this.loadingSignal.set(false)),
      ).subscribe({
        next: () => resolve(),
        error: () => resolve(),
      });
    });
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<PortalAuthResponse | null> {
    const token = this.refreshTokenSignal();
    if (!token) {
      this.logout();
      return of(null);
    }

    return this.authApi.refresh(token).pipe(
      tap(response => this.setSession(response)),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  private setSession(response: PortalAuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('customer', JSON.stringify(response.customer));

    this.accessTokenSignal.set(response.accessToken);
    this.refreshTokenSignal.set(response.refreshToken);
    this.currentCustomerSignal.set(response.customer);
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('customer');

    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.currentCustomerSignal.set(null);
  }

  private loadAuthFromStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const customer = localStorage.getItem('customer');

    if (accessToken && refreshToken && customer) {
      try {
        this.accessTokenSignal.set(accessToken);
        this.refreshTokenSignal.set(refreshToken);
        this.currentCustomerSignal.set(JSON.parse(customer));
      } catch {
        this.clearSession();
      }
    }
  }
}
