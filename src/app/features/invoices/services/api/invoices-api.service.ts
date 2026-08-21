import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalInvoiceList, PortalInvoiceDetail } from '@features/invoices/models';

export interface PortalInvoiceSummary {
  totalDebt: number;
  pendingCount: number;
  paidThisMonth: number;
  pendingApprovalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class InvoicesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/portal/invoices`;

  list(params?: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    statuses?: string[];
  }): Observable<PortalInvoiceList[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.statuses) {
      params.statuses.forEach((s) => {
        httpParams = httpParams.append('statuses', s);
      });
    }
    return this.http.get<PortalInvoiceList[]>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<PortalInvoiceDetail> {
    return this.http.get<PortalInvoiceDetail>(`${this.baseUrl}/${id}`);
  }

  getSummary(): Observable<PortalInvoiceSummary> {
    return this.http.get<PortalInvoiceSummary>(`${this.baseUrl}/summary`);
  }
}
