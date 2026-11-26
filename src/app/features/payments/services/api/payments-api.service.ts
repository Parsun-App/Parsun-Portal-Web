import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalPaymentList, PortalPaymentDetail } from '@features/payments/models';
import type { PagedResponse } from '@shared/models';

export interface PortalPaymentSummary {
  appliedTotal: number;
  pendingTotal: number;
  totalPayments: number;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface PayInvoiceRequest {
  amount: number;
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate?: string;
  useBalance?: boolean;
  balanceAmount?: number;
}

export interface PayAllDebtRequest {
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate?: string;
  useBalance?: boolean;
  balanceAmount?: number;
}

export interface PayPartialDebtRequest {
  amount: number;
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate?: string;
  useBalance?: boolean;
  balanceAmount?: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentsApiService {
  private readonly http = inject(HttpClient);
  private readonly portalBaseUrl = `${environment.apiUrl}/portal`;

  list(
    params?: {
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      status?: string;
    },
    page: number = 0,
    size: number = 10,
  ): Observable<PagedResponse<PortalPaymentList>> {
    let httpParams = new HttpParams().set('page', page).set('size', size);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PagedResponse<PortalPaymentList>>(`${this.portalBaseUrl}/payments`, {
      params: httpParams,
    });
  }

  getSummary(params?: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Observable<PortalPaymentSummary> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PortalPaymentSummary>(`${this.portalBaseUrl}/payments/summary`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<PortalPaymentDetail> {
    return this.http.get<PortalPaymentDetail>(`${this.portalBaseUrl}/payments/${id}`);
  }

  payInvoice(invoiceId: string, request: PayInvoiceRequest, file?: File): Observable<void> {
    return this.http.post<void>(
      `${this.portalBaseUrl}/invoices/${invoiceId}/pay`,
      this.buildPaymentFormData(request, file),
    );
  }

  payAllDebt(request: PayAllDebtRequest, file?: File): Observable<void> {
    return this.http.post<void>(
      `${this.portalBaseUrl}/debt/pay`,
      this.buildPaymentFormData(request, file),
    );
  }

  payPartialDebt(request: PayPartialDebtRequest, file?: File): Observable<void> {
    return this.http.post<void>(
      `${this.portalBaseUrl}/debt/pay-partial`,
      this.buildPaymentFormData(request, file),
    );
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.portalBaseUrl}/payment-methods`);
  }

  registerPayment(formData: FormData): Observable<PortalPaymentDetail> {
    return this.http.post<PortalPaymentDetail>(`${this.portalBaseUrl}/payments/register`, formData);
  }

  checkPendingPayment(invoiceId?: string): Observable<PortalPaymentList[]> {
    let httpParams = new HttpParams();
    if (invoiceId) httpParams = httpParams.set('invoiceId', invoiceId);
    return this.http.get<PortalPaymentList[]>(`${this.portalBaseUrl}/payments/pending-check`, {
      params: httpParams,
    });
  }

  private buildPaymentFormData(
    request: PayInvoiceRequest | PayAllDebtRequest | PayPartialDebtRequest,
    file?: File,
  ): FormData {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (file) {
      formData.append('justificante', file);
    }
    return formData;
  }
}
