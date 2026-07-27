import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortalLoginRequest, PortalAuthResponse } from '../../models/interfaces/auth.interface';
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
}
