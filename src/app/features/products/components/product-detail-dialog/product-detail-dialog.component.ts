import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalProduct } from '@features/products/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';

export interface ProductCreationRequest {
  product: PortalProduct;
  quantity: number;
}

@Component({
  selector: 'app-product-detail-dialog',
  standalone: true,
  imports: [ButtonModule, CurrencyPipe, DialogModule, FormsModule, ImageModule, InputNumberModule],
  templateUrl: './product-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailDialogComponent {
  readonly visible = model(false);
  readonly product = input<PortalProduct | null>(null);
  readonly createOrder = output<ProductCreationRequest>();
  readonly createQuote = output<ProductCreationRequest>();
  readonly quantity = signal(1);

  constructor() {
    effect(() => {
      this.product();
      this.quantity.set(1);
    });
  }

  buildPhotoUrl(photo: string | null): string | null {
    return photo ? `/api/files/${photo}` : null;
  }

  requestOrder(): void {
    this.requestCreation(this.createOrder);
  }

  requestQuote(): void {
    this.requestCreation(this.createQuote);
  }

  private requestCreation(event: typeof this.createOrder): void {
    const product = this.product();
    if (!product || !product.active || product.availableStock < 1) return;
    event.emit({
      product,
      quantity: Math.min(Math.max(this.quantity(), 1), product.availableStock),
    });
    this.visible.set(false);
  }
}
