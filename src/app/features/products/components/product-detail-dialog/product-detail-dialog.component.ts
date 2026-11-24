import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { PortalProduct } from '@features/products/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-product-detail-dialog',
  standalone: true,
  imports: [ButtonModule, CurrencyPipe, DialogModule, ImageModule, TagModule],
  templateUrl: './product-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailDialogComponent {
  readonly visible = model(false);
  readonly product = input<PortalProduct | null>(null);

  buildPhotoUrl(photo: string | null): string | null {
    return photo ? `/api/files/${photo}` : null;
  }
}
