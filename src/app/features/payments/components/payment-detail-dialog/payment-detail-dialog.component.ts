import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { PortalPaymentDetail } from '@features/payments/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { getStatusLabel } from '@shared/utils/status-labels';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-payment-detail-dialog',
  standalone: true,
  imports: [ButtonModule, CurrencyPipe, DatePipe, DialogModule, TagModule],
  templateUrl: './payment-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailDialogComponent {
  readonly visible = model(false);
  readonly detail = input<PortalPaymentDetail | null>(null);
  readonly closed = output<void>();
  readonly getStatusLabel = getStatusLabel;

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      APPLIED: 'success',
      PENDING: 'warn',
      REJECTED: 'danger',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
