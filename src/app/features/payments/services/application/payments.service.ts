import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, of, tap } from 'rxjs';
import { PaymentsApiService } from '@features/payments/services/api/payments-api.service';
import { PortalPaymentList, PortalPaymentDetail } from '@features/payments/models';
import { PAYMENTS_MESSAGES } from '@features/payments/messages/payments.messages';

const SEARCH_DEBOUNCE_MS = 300;

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly api = inject(PaymentsApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly payments = signal<PortalPaymentList[]>([]);
  readonly detail = signal<PortalPaymentDetail | null>(null);
  readonly detailDialogVisible = signal(false);
  readonly searchTerm = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params: { search?: string } = {};
    if (this.searchTerm()) params.search = this.searchTerm();
    this.api.list(params).pipe(
      tap(response => {
        this.payments.set(response);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add(PAYMENTS_MESSAGES.loadError);
        return of([] as PortalPaymentList[]);
      }),
    ).subscribe();
  }

  scheduleLoad(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.load(), SEARCH_DEBOUNCE_MS);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.scheduleLoad();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.load();
  }

  openDetail(id: string): void {
    this.api.getById(id).pipe(
      tap(detail => {
        this.detail.set(detail);
        this.detailDialogVisible.set(true);
      }),
      catchError(() => {
        this.messageService.add(PAYMENTS_MESSAGES.detailError);
        return of(null as unknown as PortalPaymentDetail);
      }),
    ).subscribe();
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
  }
}
