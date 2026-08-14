import {
  Component,
  inject,
  computed,
  signal,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { PopoverModule } from 'primeng/popover';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { InvoicesService } from '@features/invoices/services/application/invoices.service';
import { InvoicesApiService } from '@features/invoices/services/api/invoices-api.service';
import {
  PaymentsApiService,
  PaymentMethod,
} from '@features/payments/services/api/payments-api.service';
import { PortalInvoiceList } from '@features/invoices/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MetricCardComponent, PageHeaderComponent } from '@shared/components/ui';
import { ListFiltersComponent } from '@shared/components/list';
import { InvoiceDetailDialogComponent } from '@features/invoices/components/invoice-detail-dialog/invoice-detail-dialog.component';
import { InvoicePaymentDialogComponent } from '@features/invoices/components/invoice-payment-dialog/invoice-payment-dialog.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    TableModule,
    TagModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    FileUploadModule,
    PopoverModule,
    SkeletonModule,
    PaginatorModule,
    EmptyStateComponent,
    InvoiceDetailDialogComponent,
    InvoicePaymentDialogComponent,
    ListFiltersComponent,
    MetricCardComponent,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoices-page.component.html',
})
export class InvoicesPageComponent implements OnInit {
  private readonly invoicesService = inject(InvoicesService);
  private readonly invoicesApi = inject(InvoicesApiService);
  private readonly paymentsApi = inject(PaymentsApiService);
  private readonly messageService = inject(MessageService);

  readonly loading = this.invoicesService.loading;
  readonly invoices = this.invoicesService.invoices;
  readonly detail = this.invoicesService.detail;
  readonly detailDialogVisible = this.invoicesService.detailDialogVisible;
  readonly searchTerm = this.invoicesService.searchTerm;
  readonly filterStatus = this.invoicesService.filterStatus;
  readonly dateFrom = this.invoicesService.dateFrom;
  readonly dateTo = this.invoicesService.dateTo;
  readonly dateFromDate = signal<Date | null>(null);
  readonly dateToDate = signal<Date | null>(null);

  readonly mobileFirst = signal(0);
  readonly mobileRows = 10;
  readonly mobileInvoices = computed(() => {
    const start = this.mobileFirst();
    return this.invoices().slice(start, start + this.mobileRows);
  });

  readonly summaryLoading = signal(false);
  readonly totalDebt = signal(0);
  readonly pendingCount = signal(0);
  readonly paidThisMonth = signal(0);
  readonly pendingApprovalAmount = signal(0);

  readonly payDialogVisible = signal(false);
  readonly paying = signal(false);
  readonly payInvoiceId = signal<string | null>(null);
  readonly payAmount = signal(0);
  readonly payFullAmount = signal(0);
  readonly payMethodId = signal<string | null>(null);
  readonly payDate = signal<Date | null>(new Date());
  readonly payReference = signal('');
  readonly payFile = signal<File | null>(null);
  readonly paymentMethods = signal<PaymentMethod[]>([]);

  readonly payAllDialogVisible = signal(false);
  readonly payingAll = signal(false);
  readonly payAllAmount = signal(0);
  readonly payAllMethodId = signal<string | null>(null);
  readonly payAllDate = signal<Date | null>(new Date());
  readonly payAllReference = signal('');
  readonly payAllFile = signal<File | null>(null);

  readonly canSubmitPayAll = computed(
    () =>
      this.payAllAmount() > 0 &&
      this.payAllMethodId() !== null &&
      this.payAllDate() !== null &&
      (this.payAllReference().trim().length > 0 || this.payAllFile() !== null),
  );

  readonly isPayPartial = computed(() => this.payAmount() < this.payFullAmount());

  readonly canSubmitPay = computed(
    () =>
      this.payAmount() > 0 &&
      this.payMethodId() !== null &&
      (this.payReference().trim().length > 0 || this.payFile() !== null),
  );

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.filterStatus()) count++;
    if (this.dateFrom() || this.dateTo()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(
    () =>
      Boolean(this.searchTerm()) ||
      Boolean(this.filterStatus()) ||
      Boolean(this.dateFrom()) ||
      Boolean(this.dateTo()),
  );

  readonly emptyConfig = computed(() => {
    if (this.hasActiveFilters())
      return {
        icon: 'pi pi-receipt',
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda o filtros actuales.',
      };
    return {
      icon: 'pi pi-receipt',
      title: 'No hay facturas',
      message: 'Tus facturas aparecerán aquí cuando los tengas.',
    };
  });

  readonly statusOptions = [
    { label: 'Pendiente de Pago', value: 'PENDING_PAYMENT' },
    { label: 'Parcialmente Pagada', value: 'PARTIALLY_PAID' },
    { label: 'Pagada', value: 'PAID' },
    { label: 'Vencida', value: 'OVERDUE' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  readonly getStatusLabel = getStatusLabel;

  ngOnInit(): void {
    this.loadSummary();
    this.loadPaymentMethods();
  }

  loadSummary(): void {
    this.summaryLoading.set(true);
    this.invoicesApi.getSummary().subscribe({
      next: (s) => {
        this.totalDebt.set(s.totalDebt);
        this.pendingCount.set(s.pendingCount);
        this.paidThisMonth.set(s.paidThisMonth);
        this.pendingApprovalAmount.set(s.pendingApprovalAmount);
        this.summaryLoading.set(false);
      },
      error: () => this.summaryLoading.set(false),
    });
  }

  loadPaymentMethods(): void {
    this.paymentsApi.getPaymentMethods().subscribe({
      next: (methods) => this.paymentMethods.set(methods),
    });
  }

  openPayDialog(invoice: PortalInvoiceList): void {
    this.payInvoiceId.set(invoice.id);
    const remaining = invoice.total - invoice.paidAmount;
    this.payFullAmount.set(remaining);
    this.payAmount.set(remaining);
    this.payMethodId.set(null);
    this.payDate.set(new Date());
    this.payReference.set('');
    this.payFile.set(null);
    this.payDialogVisible.set(true);
  }

  onPayFileSelected(event: { files: File[] }): void {
    this.payFile.set(event.files[0] ?? null);
  }

  submitPay(): void {
    if (!this.canSubmitPay() || !this.payInvoiceId()) return;
    this.paying.set(true);
    this.paymentsApi
      .payInvoice(this.payInvoiceId()!, {
        amount: this.payAmount(),
        paymentMethodId: this.payMethodId()!,
        paymentDate: this.formatDate(this.payDate()!),
        referenceNumber: this.payReference().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.paying.set(false);
          this.payDialogVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Pago realizado',
            detail: 'La factura se pagó correctamente.',
          });
          this.invoicesService.load();
          this.loadSummary();
        },
        error: () => {
          this.paying.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo procesar el pago.',
          });
        },
      });
  }

  openPayAll(): void {
    this.payAllAmount.set(this.totalDebt());
    this.payAllMethodId.set(null);
    this.payAllDate.set(new Date());
    this.payAllReference.set('');
    this.payAllFile.set(null);
    this.payAllDialogVisible.set(true);
  }

  onPayAllFileSelected(event: { files: File[] }): void {
    this.payAllFile.set(event.files[0] ?? null);
  }

  submitPayAll(): void {
    if (!this.canSubmitPayAll()) return;
    this.payingAll.set(true);
    const useFull = this.payAllAmount() >= this.totalDebt();
    const req = {
      paymentMethodId: this.payAllMethodId()!,
      referenceNumber: this.payAllReference().trim() || undefined,
      paymentDate: this.formatDate(this.payAllDate()!),
    };
    const apiCall = useFull
      ? this.paymentsApi.payAllDebt(req)
      : this.paymentsApi.payPartialDebt({ ...req, amount: this.payAllAmount() });
    apiCall.subscribe({
      next: () => {
        this.payingAll.set(false);
        this.payAllDialogVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Pago realizado',
          detail: 'El pago se registró correctamente.',
        });
        this.invoicesService.load();
        this.loadSummary();
      },
      error: () => {
        this.payingAll.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo procesar el pago.',
        });
      },
    });
  }

  onSearch(value: string): void {
    this.invoicesService.onSearch(value);
  }
  onStatusFilterChange(value: string | null): void {
    this.invoicesService.onStatusFilterChange(value);
  }

  onDateFromChange(value: Date | null): void {
    this.dateFromDate.set(value);
    this.invoicesService.onDateFilterChange(value ? this.formatDate(value) : '', this.dateTo());
  }
  onDateToChange(value: Date | null): void {
    this.dateToDate.set(value);
    this.invoicesService.onDateFilterChange(this.dateFrom(), value ? this.formatDate(value) : '');
  }
  clearFilters(): void {
    this.dateFromDate.set(null);
    this.dateToDate.set(null);
    this.invoicesService.clearFilters();
  }

  onMobilePageChange(event: PaginatorState): void {
    this.mobileFirst.set(event.first ?? 0);
  }

  openDetail(id: string): void {
    this.invoicesService.openDetail(id);
  }
  parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
  }

  isPending(invoice: PortalInvoiceList): boolean {
    return (
      invoice.status === 'PENDING_PAYMENT' ||
      invoice.status === 'PARTIALLY_PAID' ||
      invoice.status === 'OVERDUE'
    );
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      PAID: 'success',
      PENDING_PAYMENT: 'warn',
      PARTIALLY_PAID: 'info',
      CANCELLED: 'danger',
      OVERDUE: 'danger',
    };
    return map[status] ?? 'info';
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
