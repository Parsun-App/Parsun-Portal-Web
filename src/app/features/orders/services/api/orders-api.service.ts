import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalOrderList, PortalOrderDetail } from '@features/orders/models';

export interface CreateOrderLineRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  notes?: string;
  lines: CreateOrderLineRequest[];
}

export interface UpdateOrderRequest {
  notes?: string;
  lines: CreateOrderLineRequest[];
}

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/orders`;

  list(params?: { search?: string; dateFrom?: string; dateTo?: string; status?: string }): Observable<PortalOrderList[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PortalOrderList[]>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<PortalOrderDetail> {
    return this.http.get<PortalOrderDetail>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateOrderRequest): Observable<PortalOrderDetail> {
    return this.http.post<PortalOrderDetail>(this.baseUrl, request);
  }

  update(id: string, request: UpdateOrderRequest): Observable<PortalOrderDetail> {
    return this.http.put<PortalOrderDetail>(`${this.baseUrl}/${id}`, request);
  }

  confirm(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
}
