import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalLoginRequest, PortalAuthResponse, ChangePasswordRequest, CustomerSummary } from '@features/auth/models/interfaces/auth.interface';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/auth`;

  login(request: PortalLoginRequest): Observable<PortalAuthResponse> {
    return this.http.post<PortalAuthResponse>(`${this.baseUrl}/login`, request);
  }

  refresh(token: string): Observable<PortalAuthResponse> {
    return this.http.post<PortalAuthResponse>(`${this.baseUrl}/refresh`, { refreshToken: token });
  }

  logout(token: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, { refreshToken: token });
  }

  changePassword(request: ChangePasswordRequest): Observable<CustomerSummary> {
    return this.http.patch<CustomerSummary>(`${this.baseUrl}/change-password`, request);
  }
}
