import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { PortalOrderDetail } from '@features/orders/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { getStatusLabel } from '@shared/utils/status-labels';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast' | undefined;

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [ButtonModule, CurrencyPipe, DatePipe, DialogModule, TableModule, TagModule],
  templateUrl: './order-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailDialogComponent {
  readonly visible = model(false);
  readonly detail = input<PortalOrderDetail | null>(null);
  readonly editRequested = output<string>();
  readonly cancelRequested = output<string>();
  readonly closed = output<void>();
  readonly getStatusLabel = getStatusLabel;

  isDraft(status: string): boolean {
    return status === 'DRAFT' || status === 'CUSTOMER_DRAFT';
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      DRAFT: 'secondary',
      CUSTOMER_DRAFT: 'warn',
      CONFIRMED: 'info',
      IN_PREPARATION: 'info',
      READY_FOR_DISPATCH: 'info',
      DISPATCHED: 'success',
      DELIVERED: 'success',
      INVOICED: 'success',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
