import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PortalSidebarService {
  readonly mobileOpen = signal(false);

  open(): void {
    this.mobileOpen.set(true);
  }

  close(): void {
    this.mobileOpen.set(false);
  }
}
