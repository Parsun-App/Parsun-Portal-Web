import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, of, tap } from 'rxjs';
import { QuotesApiService, CreateQuoteRequest, UpdateQuoteRequest } from '@features/quotes/services/api/quotes-api.service';
import { PortalQuoteList, PortalQuoteDetail } from '@features/quotes/models';
import { QUOTES_MESSAGES } from '@features/quotes/messages/quotes.messages';

const SEARCH_DEBOUNCE_MS = 300;

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly api = inject(QuotesApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly creating = signal(false);
  readonly quotes = signal<PortalQuoteList[]>([]);
  readonly detail = signal<PortalQuoteDetail | null>(null);
  readonly detailDialogVisible = signal(false);
  readonly createDialogVisible = signal(false);
  readonly searchTerm = signal('');
  readonly filterStatus = signal<string | undefined>(undefined);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params: { search?: string; status?: string; dateFrom?: string; dateTo?: string } = {};
    const search = this.searchTerm();
    const status = this.filterStatus();
    const from = this.dateFrom();
    const to = this.dateTo();
    if (search) params.search = search;
    if (status) params.status = status;
    if (from) params.dateFrom = from;
    if (to) params.dateTo = to;
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

  loadQuoteForEdit(id: string) {
    return this.api.getById(id);
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
  }

  openCreate(): void {
    this.createDialogVisible.set(true);
  }

  openCreateDialog(): void {
    this.createDialogVisible.set(true);
  }

  closeCreateDialog(): void {
    if (this.creating()) return;
    this.createDialogVisible.set(false);
  }

  notify(message: { severity: string; summary: string; detail: string }): void {
    this.messageService.add(message);
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
        return of(null);
      }),
    ).subscribe();
  }

  cancelQuote(id: string): void {
    this.api.cancel(id, 'Cancelado por cliente').pipe(
      tap(() => {
        this.detailDialogVisible.set(false);
        this.messageService.add(QUOTES_MESSAGES.cancelSuccess);
        this.load();
      }),
      catchError(() => {
        this.messageService.add(QUOTES_MESSAGES.cancelError);
        return of(null);
      }),
    ).subscribe();
  }

  updateQuote(id: string, request: UpdateQuoteRequest): void {
    this.creating.set(true);
    this.api.update(id, request).pipe(
      tap(() => {
        this.creating.set(false);
        this.createDialogVisible.set(false);
        this.messageService.add(QUOTES_MESSAGES.updateSuccess);
        this.load();
      }),
      catchError(() => {
        this.creating.set(false);
        this.messageService.add(QUOTES_MESSAGES.updateError);
        return of(null);
      }),
    ).subscribe();
  }
}
