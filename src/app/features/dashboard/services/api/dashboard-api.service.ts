import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalDashboard } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/dashboard`;

  getDashboard(): Observable<PortalDashboard> {
    return this.http.get<PortalDashboard>(this.baseUrl);
  }
}
