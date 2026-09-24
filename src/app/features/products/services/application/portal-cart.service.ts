import { computed, Injectable, signal } from '@angular/core';
import { PortalProduct } from '@features/products/models';

export type PortalCartMode = 'order' | 'quote';

export interface PortalCartLine {
  product: PortalProduct;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class PortalCartService {
  readonly visible = signal(false);
  readonly mode = signal<PortalCartMode>('order');
  readonly orderLines = signal<PortalCartLine[]>([]);
  readonly quoteLines = signal<PortalCartLine[]>([]);
  readonly orderNotes = signal('');
  readonly quoteNotes = signal('');
  readonly lines = computed(() =>
    this.mode() === 'order' ? this.orderLines() : this.quoteLines(),
  );
  readonly orderCount = computed(() =>
    this.orderLines().reduce((sum, line) => sum + line.quantity, 0),
  );
  readonly quoteCount = computed(() =>
    this.quoteLines().reduce((sum, line) => sum + line.quantity, 0),
  );

  add(product: PortalProduct, quantity: number, mode: PortalCartMode): void {
    if (!product.active || product.availableStock < 1) return;
    this.mode.set(mode);
    const cart = mode === 'order' ? this.orderLines : this.quoteLines;
    cart.update((lines) => {
      const existing = lines.find((line) => line.product.id === product.id);
      if (!existing) {
        return [
          ...lines,
          { product, quantity: Math.min(Math.max(quantity, 1), product.availableStock) },
        ];
      }
      return lines.map((line) =>
        line.product.id === product.id
          ? { ...line, quantity: Math.min(line.quantity + quantity, product.availableStock) }
          : line,
      );
    });
  }

  open(mode: PortalCartMode): void {
    this.mode.set(mode);
    this.visible.set(true);
  }

  updateQuantity(productId: string, quantity: number): void {
    const cart = this.mode() === 'order' ? this.orderLines : this.quoteLines;
    const line = cart().find((item) => item.product.id === productId);
    if (!line) return;
    const nextQuantity = Math.max(1, Math.min(quantity || 1, line.product.availableStock));
    cart.update((lines) =>
      lines.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  }

  remove(productId: string): void {
    const cart = this.mode() === 'order' ? this.orderLines : this.quoteLines;
    cart.update((lines) => lines.filter((item) => item.product.id !== productId));
  }

  clear(mode: PortalCartMode): void {
    (mode === 'order' ? this.orderLines : this.quoteLines).set([]);
    (mode === 'order' ? this.orderNotes : this.quoteNotes).set('');
  }

  notes(): string {
    return this.mode() === 'order' ? this.orderNotes() : this.quoteNotes();
  }

  updateNotes(notes: string): void {
    (this.mode() === 'order' ? this.orderNotes : this.quoteNotes).set(notes);
  }

  total(): number {
    return this.lines().reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  }
}
