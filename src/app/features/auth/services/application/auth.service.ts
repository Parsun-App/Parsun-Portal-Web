import { Injectable, inject, signal, computed, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, finalize, tap, Observable, of, throwError } from 'rxjs';
import { AuthApiService } from '@features/auth/services/api/auth-api.service';
import { CustomerSummary, PortalAuthResponse, ChangePasswordRequest } from '@features/auth/models/interfaces/auth.interface';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const CUSTOMER_KEY = 'customer';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

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
    const token = this.refreshTokenSignal();
    if (token) {
      this.authApi.logout(token).subscribe({
        error: () => {},
      });
    }
    this.clearSession();
    this.router.navigate(['@features/auth/login']);
  }

  changePassword(request: ChangePasswordRequest): Observable<CustomerSummary> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.authApi.changePassword(request).pipe(
      catchError(err => {
        this.errorSignal.set(err.error?.message || 'Error al cambiar la contraseña');
        return throwError(() => err);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  refreshToken(): Observable<PortalAuthResponse | null> {
    const token = this.refreshTokenSignal();
    if (!token) {
      this.logout();
      return of(null);
    }

    return this.authApi.refresh(token).pipe(
      tap(response => {
        const currentCustomer = this.currentCustomerSignal();
        this.accessTokenSignal.set(response.accessToken);
        this.refreshTokenSignal.set(response.refreshToken);
        if (currentCustomer) {
          this.currentCustomerSignal.set(currentCustomer);
        } else if (response.customer) {
          this.currentCustomerSignal.set(response.customer);
        }
        if (this.isBrowser) {
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        }
      }),
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
    this.accessTokenSignal.set(response.accessToken);
    this.refreshTokenSignal.set(response.refreshToken);
    this.currentCustomerSignal.set(response.customer);

    if (this.isBrowser) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(response.customer));
    }
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.currentCustomerSignal.set(null);

    if (this.isBrowser) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_KEY);
    }
  }

  private loadAuthFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const customer = localStorage.getItem(CUSTOMER_KEY);

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
