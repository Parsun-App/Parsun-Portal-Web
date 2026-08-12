import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProfileService } from '@features/profile/services/application/profile.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '@shared/components/ui';
import { ChangePasswordDialogComponent } from '@features/profile/components/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CurrencyPipe, CardModule, TagModule, ButtonModule, ProgressSpinnerModule, ChangePasswordDialogComponent, EmptyStateComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly profileService = inject(ProfileService);

  readonly loading = this.profileService.loading;
  readonly profile = this.profileService.profile;

  readonly showChangePasswordDialog = signal(false);
  constructor() {
    this.profileService.load();
  }

  openChangePasswordDialog(): void {
    this.showChangePasswordDialog.set(true);
  }
}
