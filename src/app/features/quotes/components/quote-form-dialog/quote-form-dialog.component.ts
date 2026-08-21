import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrderFormDialogComponent } from '@features/orders/components/order-form-dialog/order-form-dialog.component';

@Component({
  selector: 'app-quote-form-dialog',
  standalone: true,
  imports: [OrderFormDialogComponent],
  templateUrl: './quote-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteFormDialogComponent extends OrderFormDialogComponent {}
