import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PortalPaymentList, PortalPaymentDetail } from '@features/payments/models';

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

  list(params?: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Observable<PortalPaymentList[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PortalPaymentList[]>(`${this.portalBaseUrl}/payments`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<PortalPaymentDetail> {
    return this.http.get<PortalPaymentDetail>(`${this.portalBaseUrl}/payments/${id}`);
  }

  payInvoice(invoiceId: string, request: PayInvoiceRequest): Observable<void> {
    return this.http.post<void>(`${this.portalBaseUrl}/invoices/${invoiceId}/pay`, request);
  }

  payAllDebt(request: PayAllDebtRequest): Observable<void> {
    return this.http.post<void>(`${this.portalBaseUrl}/debt/pay`, request);
  }

  payPartialDebt(request: PayPartialDebtRequest): Observable<void> {
    return this.http.post<void>(`${this.portalBaseUrl}/debt/pay-partial`, request);
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.portalBaseUrl}/payment-methods`);
  }

  registerPayment(formData: FormData): Observable<PortalPaymentDetail> {
    return this.http.post<PortalPaymentDetail>(`${this.portalBaseUrl}/payments/register`, formData);
  }
}
