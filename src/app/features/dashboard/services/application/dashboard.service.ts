import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DashboardApiService } from '@features/dashboard/services/api/dashboard-api.service';
import { PortalDashboard } from '@features/dashboard/models';
import { DASHBOARD_MESSAGES } from '@features/dashboard/messages/dashboard.messages';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(DashboardApiService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);
  readonly dashboard = signal<PortalDashboard | null>(null);

  load(): void {
    this.dashboard.set(null);
    this.loading.set(true);
    this.api.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add(DASHBOARD_MESSAGES.loadError);
      },
    });
  }
}
