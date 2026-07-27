import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalOrderList, PortalOrderDetail } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/orders`;

  list(params?: { dateFrom?: string; dateTo?: string; status?: string }): Observable<PortalOrderList[]> {
    let httpParams = new HttpParams();
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PortalOrderList[]>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<PortalOrderDetail> {
    return this.http.get<PortalOrderDetail>(`${this.baseUrl}/${id}`);
  }

  confirm(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
}
