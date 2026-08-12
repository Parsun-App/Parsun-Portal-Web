import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { PortalInvoiceDetail } from '@features/invoices/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { getStatusLabel } from '@shared/utils/status-labels';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-invoice-detail-dialog',
  standalone: true,
  imports: [ButtonModule, CurrencyPipe, DatePipe, DialogModule, TableModule, TagModule],
  templateUrl: './invoice-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailDialogComponent {
  readonly visible = model(false);
  readonly detail = input<PortalInvoiceDetail | null>(null);
  readonly getStatusLabel = getStatusLabel;

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = { PAID: 'success', PENDING_PAYMENT: 'warn', PARTIALLY_PAID: 'info', CANCELLED: 'danger', OVERDUE: 'danger' };
    return map[status] ?? 'info';
  }
}
