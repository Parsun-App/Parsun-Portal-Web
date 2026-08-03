import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalQuoteList, PortalQuoteDetail } from '@features/quotes/models';

export interface CreateQuoteRequest {
  notes?: string;
  expiryDate?: string;
  lines: { productId: string; quantity: number; unitPrice: number }[];
}

@Injectable({ providedIn: 'root' })
export class QuotesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/quotes`;

  list(params?: { search?: string; dateFrom?: string; dateTo?: string; status?: string }): Observable<PortalQuoteList[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PortalQuoteList[]>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<PortalQuoteDetail> {
    return this.http.get<PortalQuoteDetail>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateQuoteRequest): Observable<PortalQuoteDetail> {
    return this.http.post<PortalQuoteDetail>(this.baseUrl, request);
  }

  cancel(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, { reason });
  }

  convertToOrder(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/convert`, {});
  }
}
