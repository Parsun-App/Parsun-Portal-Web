import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject, catchError, of, tap } from 'rxjs';
import {
  OrdersApiService,
  CreateOrderRequest,
  UpdateOrderRequest,
} from '@features/orders/services/api/orders-api.service';
import { PortalOrderList, PortalOrderDetail } from '@features/orders/models';
import { ORDERS_MESSAGES } from '@features/orders/messages/orders.messages';
import type { PagedResponse } from '@shared/models';

const SEARCH_DEBOUNCE_MS = 300;
const CANCEL_REASON = 'Cancelado por el cliente';
const EMPTY_PAGE: PagedResponse<PortalOrderList> = {
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
export class OrdersService {
  private readonly api = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly creating = signal(false);
  readonly orders = signal<PortalOrderList[]>([]);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly summaryPending = signal(0);
  readonly summaryTotalAmount = signal(0);
  readonly detail = signal<PortalOrderDetail | null>(null);
  readonly detailDialogVisible = signal(false);
  readonly createDialogVisible = signal(false);
  readonly createDialogRequested$ = new Subject<void>();
  readonly created$ = new Subject<void>();
  readonly searchTerm = signal('');
  readonly filterStatus = signal<string | undefined>(undefined);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.orders.set([]);
    this.detail.set(null);
    this.detailDialogVisible.set(false);
    this.loading.set(true);
    this.api
      .list(this.buildParams(), this.currentPage(), this.pageSize())
      .pipe(
        tap((response) => {
          this.orders.set(response.content);
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        }),
        catchError(() => {
          this.loading.set(false);
          this.messageService.add(ORDERS_MESSAGES.loadError);
          return of(EMPTY_PAGE);
        }),
      )
      .subscribe();
    this.loadSummary();
  }

  loadSummary(): void {
    this.api
      .getSummary(this.buildParams())
      .pipe(
        tap((summary) => {
          this.summaryPending.set(summary.pendingCount);
          this.summaryTotalAmount.set(summary.totalAmount);
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

  private buildParams(): { search?: string; status?: string; dateFrom?: string; dateTo?: string } {
    const params: { search?: string; status?: string; dateFrom?: string; dateTo?: string } = {};
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
          this.messageService.add(ORDERS_MESSAGES.detailError);
          return of(null as unknown as PortalOrderDetail);
        }),
      )
      .subscribe();
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
  }

  openCreateDialog(): void {
    this.createDialogVisible.set(true);
  }

  requestCreateDialog(): void {
    this.createDialogRequested$.next();
  }

  closeCreateDialog(): void {
    if (this.creating()) return;
    this.createDialogVisible.set(false);
  }

  notify(message: { severity: string; summary: string; detail: string }): void {
    this.messageService.add(message);
  }

  loadOrderForEdit(id: string) {
    return this.api.getById(id);
  }

  create(request: CreateOrderRequest): void {
    this.creating.set(true);
    this.api
      .create(request)
      .pipe(
        tap(() => {
          this.creating.set(false);
          this.createDialogVisible.set(false);
          this.messageService.add(ORDERS_MESSAGES.createSuccess);
          this.load();
          this.created$.next();
        }),
        catchError(() => {
          this.creating.set(false);
          this.messageService.add(ORDERS_MESSAGES.createError);
          return of(null);
        }),
      )
      .subscribe();
  }

  updateOrder(id: string, request: UpdateOrderRequest): void {
    this.creating.set(true);
    this.api
      .update(id, request)
      .pipe(
        tap(() => {
          this.creating.set(false);
          this.createDialogVisible.set(false);
          this.messageService.add(ORDERS_MESSAGES.updateSuccess);
          this.load();
        }),
        catchError(() => {
          this.creating.set(false);
          this.messageService.add(ORDERS_MESSAGES.updateError);
          return of(null);
        }),
      )
      .subscribe();
  }

  confirmOrder(id: string): void {
    this.api
      .confirm(id)
      .pipe(
        tap(() => {
          this.messageService.add(ORDERS_MESSAGES.confirmSuccess);
          this.load();
        }),
        catchError(() => {
          this.messageService.add(ORDERS_MESSAGES.confirmError);
          return of(void 0);
        }),
      )
      .subscribe();
  }

  cancelOrder(id: string): void {
    this.api
      .cancel(id, CANCEL_REASON)
      .pipe(
        tap(() => {
          this.messageService.add(ORDERS_MESSAGES.cancelSuccess);
          this.load();
        }),
        catchError(() => {
          this.messageService.add(ORDERS_MESSAGES.cancelError);
          return of(void 0);
        }),
      )
      .subscribe();
  }
}
