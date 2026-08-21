import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, of, tap } from 'rxjs';
import { ProfileApiService } from '@features/profile/services/api/profile-api.service';
import { PortalProfile } from '@features/profile/models';
import { PROFILE_MESSAGES } from '@features/profile/messages/profile.messages';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ProfileApiService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);
  readonly profile = signal<PortalProfile | null>(null);

  load(): void {
    this.loading.set(true);
    this.api
      .getProfile()
      .pipe(
        tap((profile) => {
          this.profile.set(profile);
          this.loading.set(false);
        }),
        catchError(() => {
          this.loading.set(false);
          this.messageService.add(PROFILE_MESSAGES.loadError);
          return of(null as unknown as PortalProfile);
        }),
      )
      .subscribe();
  }
}
