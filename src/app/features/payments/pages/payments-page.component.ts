import { Component, inject, computed, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { PopoverModule } from 'primeng/popover';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { PaymentsService } from '@features/payments/services/application/payments.service';
import { PaymentsApiService, PaymentMethod } from '@features/payments/services/api/payments-api.service';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MetricCardComponent, PageHeaderComponent } from '@shared/components/ui';
import { ListFiltersComponent } from '@shared/components/list';
import { PaymentDetailDialogComponent } from '@features/payments/components/payment-detail-dialog/payment-detail-dialog.component';
import { clearNotificationFocusFromUrl } from '@shared/utils/notification-focus-url';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, InputNumberModule, TextareaModule, SelectModule, DatePickerModule, FileUploadModule, PopoverModule, PaginatorModule, EmptyStateComponent, ListFiltersComponent, MetricCardComponent, PageHeaderComponent, PaymentDetailDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments-page.component.html',
})
export class PaymentsPageComponent implements OnInit {
  private readonly paymentsService = inject(PaymentsService);
  private readonly paymentsApi = inject(PaymentsApiService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private focusedId: string | null = null;

  readonly loading = this.paymentsService.loading;
  readonly payments = this.paymentsService.payments;
  readonly detail = this.paymentsService.detail;
  readonly detailDialogVisible = this.paymentsService.detailDialogVisible;
  readonly searchTerm = this.paymentsService.searchTerm;
  readonly filterStatus = this.paymentsService.filterStatus;
  readonly dateFrom = this.paymentsService.dateFrom;
  readonly dateTo = this.paymentsService.dateTo;
  readonly dateFromDate = signal<Date | null>(null);
  readonly dateToDate = signal<Date | null>(null);

  readonly mobileFirst = signal(0);
  readonly mobileRows = 10;
  readonly mobilePayments = computed(() => {
    const start = this.mobileFirst();
    return this.payments().slice(start, start + this.mobileRows);
  });

  readonly totalPayments = computed(() => this.payments().length);
  readonly appliedTotal = computed(() => this.payments().filter(p => p.status === 'APPLIED').reduce((s, p) => s + p.amount, 0));
  readonly pendingTotal = computed(() => this.payments().filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0));

  readonly registerDialogVisible = signal(false);
  readonly registering = signal(false);
  readonly paymentMethods = signal<PaymentMethod[]>([]);

  readonly registerAmount = signal<number>(0);
  readonly registerMethodId = signal<string | null>(null);
  readonly registerDate = signal<Date | null>(null);
  readonly registerReference = signal('');
  readonly registerNotes = signal('');
  readonly registerFile = signal<File | null>(null);

  readonly canSubmitRegister = computed(() =>
    this.registerAmount() > 0 &&
    this.registerMethodId() !== null &&
    this.registerDate() !== null &&
    (this.registerReference().trim().length > 0 || this.registerFile() !== null)
  );

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.filterStatus()) count++;
    if (this.dateFrom() || this.dateTo()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(() => Boolean(this.searchTerm()) || Boolean(this.filterStatus()) || Boolean(this.dateFrom()) || Boolean(this.dateTo()));

  readonly emptyConfig = computed(() => {
    if (this.hasActiveFilters()) {
      return {
        icon: 'pi pi-credit-card',
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda o filtros actuales.',
      };
    }
    return {
      icon: 'pi pi-credit-card',
      title: 'No hay pagos',
      message: 'Tus pagos aparecerán aquí cuando los tengas.',
    };
  });

  readonly statusOptions = [
    { label: 'Aplicado', value: 'APPLIED' },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Cancelado', value: 'CANCELLED' },
    { label: 'Rechazado', value: 'REJECTED' },
  ];

  readonly getStatusLabel = getStatusLabel;

  ngOnInit(): void {
    this.loadPaymentMethods();
    this.route.queryParamMap.subscribe((params) => this.consumeFocus(params.get('focus')));
  }

  loadPaymentMethods(): void {
    this.paymentsApi.getPaymentMethods().subscribe({
      next: (methods) => this.paymentMethods.set(methods),
    });
  }

  openRegisterDialog(): void {
    this.registerAmount.set(0);
    this.registerMethodId.set(null);
    this.registerDate.set(null);
    this.registerReference.set('');
    this.registerNotes.set('');
    this.registerFile.set(null);
    this.registerDialogVisible.set(true);
  }

  onRegisterFileSelected(event: { files: File[] }): void {
    this.registerFile.set(event.files[0] ?? null);
  }

  onRegisterFileCleared(): void {
    this.registerFile.set(null);
  }

  submitRegister(): void {
    if (!this.canSubmitRegister()) return;

    this.registering.set(true);
    const formData = new FormData();

    const request = {
      amount: this.registerAmount(),
      paymentMethodId: this.registerMethodId()!,
      paymentDate: this.formatDate(this.registerDate()!),
      referenceNumber: this.registerReference().trim() || undefined,
      notes: this.registerNotes().trim() || undefined,
    };
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    const file = this.registerFile();
    if (file) {
      formData.append('justificante', file);
    }

    this.paymentsApi.registerPayment(formData).subscribe({
      next: () => {
        this.registering.set(false);
        this.registerDialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Pago registrado', detail: 'El pago se registró correctamente.' });
        this.paymentsService.load();
      },
      error: () => {
        this.registering.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el pago.' });
      },
    });
  }

  onSearch(value: string): void {
    this.paymentsService.onSearch(value);
  }

  onStatusFilterChange(value: string | null): void {
    this.paymentsService.onStatusFilterChange(value);
  }

  onDateFromChange(value: Date | null): void {
    this.dateFromDate.set(value);
    const from = value ? this.formatDate(value) : '';
    this.paymentsService.onDateFilterChange(from, this.dateTo());
  }

  onDateToChange(value: Date | null): void {
    this.dateToDate.set(value);
    const to = value ? this.formatDate(value) : '';
    this.paymentsService.onDateFilterChange(this.dateFrom(), to);
  }

  clearFilters(): void {
    this.dateFromDate.set(null);
    this.dateToDate.set(null);
    this.paymentsService.clearFilters();
  }

  onMobilePageChange(event: PaginatorState): void {
    this.mobileFirst.set(event.first ?? 0);
  }

  openDetail(id: string): void {
    this.paymentsService.openDetail(id);
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
    void this.clearFocus();
  }

  private consumeFocus(focus: string | null): void {
    if (!focus) {
      this.focusedId = null;
      return;
    }
    if (focus === this.focusedId) return;
    this.focusedId = focus;
    this.openDetail(focus);
    void this.clearFocus();
  }

  async clearFocus(): Promise<void> {
    try {
      const cleared = await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { focus: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      if (!cleared) await this.reconcileFocusCleanup();
    } catch {
      await this.reconcileFocusCleanup();
    }
  }

  private async reconcileFocusCleanup(): Promise<void> {
    await Promise.resolve();
    const cleanupTree = this.router.createUrlTree([], { relativeTo: this.route, queryParams: { focus: null }, queryParamsHandling: 'merge' });
    try {
      const reconciled = await this.router.navigateByUrl(cleanupTree, { replaceUrl: true });
      if (!reconciled) clearNotificationFocusFromUrl(this.location);
    } catch {
      clearNotificationFocusFromUrl(this.location);
    }
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      APPLIED: 'success',
      PENDING: 'warn',
      CANCELLED: 'danger',
      REJECTED: 'danger',
    };
    return map[status] ?? 'info';
  }

  parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
