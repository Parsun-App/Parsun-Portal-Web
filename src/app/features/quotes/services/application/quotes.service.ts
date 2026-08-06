import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, of, tap } from 'rxjs';
import { QuotesApiService, CreateQuoteRequest } from '@features/quotes/services/api/quotes-api.service';
import { PortalQuoteList, PortalQuoteDetail } from '@features/quotes/models';
import { QUOTES_MESSAGES } from '@features/quotes/messages/quotes.messages';

const SEARCH_DEBOUNCE_MS = 300;

interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  summary: string;
  detail: string;
}

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly api = inject(QuotesApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly quotes = signal<PortalQuoteList[]>([]);
  readonly detail = signal<PortalQuoteDetail | null>(null);
  readonly detailDialogVisible = signal(false);
  readonly createDialogVisible = signal(false);
  readonly creating = signal(false);
  readonly searchTerm = signal('');
  readonly filterStatus = signal<string | undefined>(undefined);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params: { search?: string; status?: string } = {};
    const search = this.searchTerm();
    const status = this.filterStatus();
    if (search) params.search = search;
    if (status) params.status = status;
    this.api.list(params).pipe(
      tap(response => {
        this.quotes.set(response);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add(QUOTES_MESSAGES.loadError);
        return of([] as PortalQuoteList[]);
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

  onStatusFilterChange(value: string | null): void {
    this.filterStatus.set(value ?? undefined);
    this.load();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterStatus.set(undefined);
    this.load();
  }

  openDetail(id: string): void {
    this.api.getById(id).pipe(
      tap(detail => {
        this.detail.set(detail);
        this.detailDialogVisible.set(true);
      }),
      catchError(() => {
        this.messageService.add(QUOTES_MESSAGES.detailError);
        return of(null as unknown as PortalQuoteDetail);
      }),
    ).subscribe();
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
  }

  notify(message: ToastMessage): void {
    this.messageService.add(message);
  }

  openCreateDialog(): void {
    this.createDialogVisible.set(true);
  }

  closeCreateDialog(): void {
    if (this.creating()) return;
    this.createDialogVisible.set(false);
  }

  create(request: CreateQuoteRequest): void {
    this.creating.set(true);
    this.api.create(request).pipe(
      tap(() => {
        this.creating.set(false);
        this.createDialogVisible.set(false);
        this.messageService.add(QUOTES_MESSAGES.createSuccess);
        this.load();
      }),
      catchError(() => {
        this.creating.set(false);
        this.messageService.add(QUOTES_MESSAGES.createError);
        return of(null as unknown as PortalQuoteDetail);
      }),
    ).subscribe();
  }
}
