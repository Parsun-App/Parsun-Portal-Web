import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { environment } from '@env/environment';
import { PaymentsApiService } from '@features/payments/services/api/payments-api.service';

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('PaymentsApiService', () => {
  let service: PaymentsApiService;
  let httpMock: HttpTestingController;
  const portalBaseUrl = `${environment.apiUrl}/portal`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PaymentsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('payInvoice', () => {
    it('should send a FormData request with a JSON request part and no justificante part when no file is provided', () => {
      service.payInvoice('inv-1', { amount: 100, paymentMethodId: 'method-1' }).subscribe();

      const req = httpMock.expectOne(`${portalBaseUrl}/invoices/inv-1/pay`);
      expect(req.request.body).toBeInstanceOf(FormData);
      const body = req.request.body as FormData;
      expect(body.has('request')).toBe(true);
      expect(body.has('justificante')).toBe(false);
      req.flush(null);
    });

    it('should attach the selected file as the justificante part', () => {
      const file = new File(['content'], 'voucher.pdf', { type: 'application/pdf' });

      service.payInvoice('inv-1', { amount: 100, paymentMethodId: 'method-1' }, file).subscribe();

      const req = httpMock.expectOne(`${portalBaseUrl}/invoices/inv-1/pay`);
      const body = req.request.body as FormData;
      expect(body.get('justificante')).toBe(file);
      req.flush(null);
    });

    it('should send the request part as a JSON blob matching the given payload', async () => {
      const payload = { amount: 100, paymentMethodId: 'method-1', referenceNumber: 'REF-1' };

      service.payInvoice('inv-1', payload).subscribe();

      const req = httpMock.expectOne(`${portalBaseUrl}/invoices/inv-1/pay`);
      const body = req.request.body as FormData;
      const requestPart = body.get('request') as Blob;
      expect(requestPart.type).toBe('application/json');
      const text = await readBlobAsText(requestPart);
      expect(JSON.parse(text)).toEqual(payload);
      req.flush(null);
    });
  });

  describe('payAllDebt', () => {
    it('should send a FormData request with a JSON request part and no justificante part when no file is provided', () => {
      service.payAllDebt({ paymentMethodId: 'method-1' }).subscribe();

      const req = httpMock.expectOne(`${portalBaseUrl}/debt/pay`);
      expect(req.request.body).toBeInstanceOf(FormData);
      const body = req.request.body as FormData;
      expect(body.has('request')).toBe(true);
      expect(body.has('justificante')).toBe(false);
      req.flush(null);
    });

    it('should attach the selected file as the justificante part', () => {
      const file = new File(['content'], 'voucher.pdf', { type: 'application/pdf' });

      service.payAllDebt({ paymentMethodId: 'method-1' }, file).subscribe();

      const req = httpMock.expectOne(`${portalBaseUrl}/debt/pay`);
      const body = req.request.body as FormData;
      expect(body.get('justificante')).toBe(file);
      req.flush(null);
    });
  });

  describe('payPartialDebt', () => {
    it('should send a FormData request with a JSON request part and no justificante part when no file is provided', () => {
      service.payPartialDebt({ amount: 50, paymentMethodId: 'method-1' }).subscribe();

      const req = httpMock.expectOne(`${portalBaseUrl}/debt/pay-partial`);
      expect(req.request.body).toBeInstanceOf(FormData);
      const body = req.request.body as FormData;
      expect(body.has('request')).toBe(true);
      expect(body.has('justificante')).toBe(false);
      req.flush(null);
    });

    it('should attach the selected file as the justificante part', () => {
      const file = new File(['content'], 'voucher.pdf', { type: 'application/pdf' });

      service.payPartialDebt({ amount: 50, paymentMethodId: 'method-1' }, file).subscribe();

      const req = httpMock.expectOne(`${portalBaseUrl}/debt/pay-partial`);
      const body = req.request.body as FormData;
      expect(body.get('justificante')).toBe(file);
      req.flush(null);
    });
  });

  describe('checkPendingPayment', () => {
    it('should query pending-check without an invoiceId param when none is given', () => {
      service.checkPendingPayment().subscribe();

      const req = httpMock.expectOne((r) => r.url === `${portalBaseUrl}/payments/pending-check`);
      expect(req.request.params.has('invoiceId')).toBe(false);
      req.flush([]);
    });

    it('should query pending-check with the given invoiceId param', () => {
      service.checkPendingPayment('inv-1').subscribe();

      const req = httpMock.expectOne((r) => r.url === `${portalBaseUrl}/payments/pending-check`);
      expect(req.request.params.get('invoiceId')).toBe('inv-1');
      req.flush([]);
    });
  });
});
