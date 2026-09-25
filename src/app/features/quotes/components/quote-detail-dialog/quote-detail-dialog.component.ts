import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { PortalQuoteDetail } from '@features/quotes/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { getStatusLabel } from '@shared/utils/status-labels';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-quote-detail-dialog',
  standalone: true,
  imports: [ButtonModule, CurrencyPipe, DatePipe, DialogModule, TableModule, TagModule],
  templateUrl: './quote-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteDetailDialogComponent {
  readonly visible = model(false);
  readonly detail = input<PortalQuoteDetail | null>(null);
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
      CONVERTED_TO_ORDER: 'success',
      CONVERTED_TO_INVOICE: 'success',
      CONVERTED: 'success',
      EXPIRED: 'warn',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
