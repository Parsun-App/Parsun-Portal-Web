import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, of, tap } from 'rxjs';
import { InvoicesApiService } from '@features/invoices/services/api/invoices-api.service';
import { PortalInvoiceList, PortalInvoiceDetail } from '@features/invoices/models';
import { INVOICES_MESSAGES } from '@features/invoices/messages/invoices.messages';

const SEARCH_DEBOUNCE_MS = 300;

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly api = inject(InvoicesApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly invoices = signal<PortalInvoiceList[]>([]);
  readonly detail = signal<PortalInvoiceDetail | null>(null);
  readonly detailDialogVisible = signal(false);
  readonly searchTerm = signal('');
  readonly filterStatus = signal<string | undefined>(undefined);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params: { search?: string; statuses?: string[]; dateFrom?: string; dateTo?: string } = {};
    const search = this.searchTerm();
    const status = this.filterStatus();
    const from = this.dateFrom();
    const to = this.dateTo();
    if (search) params.search = search;
    if (status) params.statuses = [status];
    if (from) params.dateFrom = from;
    if (to) params.dateTo = to;
    this.api
      .list(params)
      .pipe(
        tap((response) => {
          this.invoices.set(response);
          this.loading.set(false);
        }),
        catchError(() => {
          this.loading.set(false);
          this.messageService.add(INVOICES_MESSAGES.loadError);
          return of([] as PortalInvoiceList[]);
        }),
      )
      .subscribe();
  }

  scheduleLoad(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.load(), SEARCH_DEBOUNCE_MS);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.scheduleLoad();
  }

  onStatusFilterChange(value: string | null): void {
    this.filterStatus.set(value ?? undefined);
    this.load();
  }

  onDateFilterChange(from: string, to: string): void {
    this.dateFrom.set(from);
    this.dateTo.set(to);
    this.load();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterStatus.set(undefined);
    this.dateFrom.set('');
    this.dateTo.set('');
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
          this.messageService.add(INVOICES_MESSAGES.detailError);
          return of(null as unknown as PortalInvoiceDetail);
        }),
      )
      .subscribe();
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
  }
}
