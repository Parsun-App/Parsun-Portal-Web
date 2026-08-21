import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentMethod } from '@features/payments/services/api/payments-api.service';
import { PortalPaymentList } from '@features/payments/models';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-invoice-payment-dialog',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    DatePickerModule,
    DatePipe,
    DialogModule,
    FileUploadModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './invoice-payment-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentDialogComponent {
  readonly visible = model(false);
  readonly amount = model(0);
  readonly methodId = model<string | null>(null);
  readonly paymentDate = model<Date | null>(new Date());
  readonly reference = model('');
  readonly fullAmount = input.required<number>();
  readonly paymentMethods = input.required<PaymentMethod[]>();
  readonly processing = input(false);
  readonly debtPayment = input(false);
  readonly valid = input(false);
  readonly pendingPayment = input<PortalPaymentList | null>(null);
  readonly fileSelected = output<{ files: File[] }>();
  readonly submitted = output<void>();

  readonly pendingPaymentMethodName = computed(() => {
    const pending = this.pendingPayment();
    if (!pending) return null;
    return this.paymentMethods().find((m) => m.id === pending.paymentMethodId)?.name ?? null;
  });

  openVoucher(): void {
    const url = this.pendingPayment()?.voucherUrl;
    if (url) {
      window.open(url, '_blank');
    }
  }
}
