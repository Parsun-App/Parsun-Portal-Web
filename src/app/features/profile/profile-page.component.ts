import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ProfileApiService } from './services/api/profile-api.service';
import { PortalProfile } from '@shared/models';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CurrencyPipe, CardModule, TagModule, ButtonModule, ToastModule, ProgressSpinnerModule, EmptyStateComponent],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly api = inject(ProfileApiService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);
  readonly profile = signal<PortalProfile | null>(null);

  constructor() {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.api.getProfile().pipe(
      tap(p => {
        this.profile.set(p);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el perfil' });
        return of(null as unknown as PortalProfile);
      }),
    ).subscribe();
  }
}
