import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalProduct } from '@features/products/models';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

export interface OrderFormLine {
  product: PortalProduct | null;
  quantity: number;
  unitPrice: number;
}
export interface ProductSearchRequest {
  event: { query: string };
  lineIndex: number;
}
export interface ProductSelectionChange {
  lineIndex: number;
  product: PortalProduct | null;
}
export interface QuantityChange {
  lineIndex: number;
  quantity: number;
}

@Component({
  selector: 'app-order-form-dialog',
  standalone: true,
  imports: [
    AutoCompleteModule,
    ButtonModule,
    CurrencyPipe,
    DialogModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './order-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormDialogComponent {
  readonly visible = model(false);
  readonly notes = model('');
  readonly editing = input(false);
  readonly entityLabel = input('pedido');
  readonly creating = input(false);
  readonly lines = input.required<OrderFormLine[]>();
  readonly suggestions = input.required<PortalProduct[]>();
  readonly total = input.required<number>();
  readonly valid = input(false);
  readonly lineAdded = output<void>();
  readonly lineRemoved = output<number>();
  readonly productChanged = output<ProductSelectionChange>();
  readonly quantityChanged = output<QuantityChange>();
  readonly productsSearched = output<ProductSearchRequest>();
  readonly submitted = output<void>();

  buildPhotoUrl(photo: string | null): string | null {
    return photo ? `/api/files/${photo}` : null;
  }
}
