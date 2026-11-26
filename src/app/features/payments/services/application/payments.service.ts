import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, of, tap } from 'rxjs';
import { PaymentsApiService } from '@features/payments/services/api/payments-api.service';
import { PortalPaymentList, PortalPaymentDetail } from '@features/payments/models';
import { PAYMENTS_MESSAGES } from '@features/payments/messages/payments.messages';
import type { PagedResponse } from '@shared/models';

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_LIST_STATUS = 'APPLIED';
const EMPTY_PAGE: PagedResponse<PortalPaymentList> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly api = inject(PaymentsApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly payments = signal<PortalPaymentList[]>([]);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly summaryApplied = signal(0);
  readonly summaryPending = signal(0);
  readonly summaryTotal = signal(0);
  readonly detail = signal<PortalPaymentDetail | null>(null);
  readonly detailDialogVisible = signal(false);
  readonly searchTerm = signal('');
  readonly filterStatus = signal<string | undefined>(undefined);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.payments.set([]);
    this.detail.set(null);
    this.detailDialogVisible.set(false);
    this.loading.set(true);
    this.api
      .list(this.buildListParams(), this.currentPage(), this.pageSize())
      .pipe(
        tap((response) => {
          this.payments.set(response.content);
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        }),
        catchError(() => {
          this.loading.set(false);
          this.messageService.add(PAYMENTS_MESSAGES.loadError);
          return of(EMPTY_PAGE);
        }),
      )
      .subscribe();
    this.loadSummary();
  }

  loadSummary(): void {
    this.api
      .getSummary(this.buildSummaryParams())
      .pipe(
        tap((summary) => {
          this.summaryApplied.set(summary.appliedTotal);
          this.summaryPending.set(summary.pendingTotal);
          this.summaryTotal.set(summary.totalPayments);
        }),
        catchError(() => of(null)),
      )
      .subscribe();
  }

  onPageChange(first: number, rows: number): void {
    this.currentPage.set(Math.floor(first / rows));
    this.pageSize.set(rows);
    this.load();
  }

  private buildListParams(): { search?: string; dateFrom?: string; dateTo?: string; status?: string } {
    const params = this.buildSummaryParams();
    params.status = this.filterStatus() ?? DEFAULT_LIST_STATUS;
    return params;
  }

  private buildSummaryParams(): {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  } {
    const params: { search?: string; dateFrom?: string; dateTo?: string; status?: string } = {};
    const search = this.searchTerm();
    const status = this.filterStatus();
    const from = this.dateFrom();
    const to = this.dateTo();
    if (search) params.search = search;
    if (status) params.status = status;
    if (from) params.dateFrom = from;
    if (to) params.dateTo = to;
    return params;
  }

  scheduleLoad(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.load(), SEARCH_DEBOUNCE_MS);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(0);
    this.scheduleLoad();
  }

  onStatusFilterChange(value: string | null): void {
    this.filterStatus.set(value ?? undefined);
    this.currentPage.set(0);
    this.load();
  }

  onDateFilterChange(from: string, to: string): void {
    this.dateFrom.set(from);
    this.dateTo.set(to);
    this.currentPage.set(0);
    this.load();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterStatus.set(undefined);
    this.dateFrom.set('');
    this.dateTo.set('');
    this.currentPage.set(0);
    this.load();
  }

  openDetail(id: string): void {
    this.api
      .getById(id)
      .pipe(
        tap((detail) => {
          this.detail.set(detail);
          this.detailDialogVisible.set(true);
        }),
        catchError(() => {
          this.messageService.add(PAYMENTS_MESSAGES.detailError);
          return of(null as unknown as PortalPaymentDetail);
        }),
      )
      .subscribe();
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
  }
}
