import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProfileService } from '@features/profile/services/application/profile.service';
import { AuthService } from '@features/auth/services/application/auth.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { passwordsMatchValidator } from '@features/auth/validators/password-match.validator';
import { passwordComplexityValidator } from '@features/auth/validators/password-complexity.validator';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CurrencyPipe, CardModule, TagModule, ButtonModule, DialogModule,
            PasswordModule, MessageModule, ReactiveFormsModule, ProgressSpinnerModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.profileService.loading;
  readonly profile = this.profileService.profile;

  readonly showChangePasswordDialog = signal(false);
  readonly changingPassword = this.authService.loading;
  readonly passwordError = this.authService.error;
  readonly passwordSuccess = signal(false);

  readonly passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: [
      '',
      [
        Validators.required,
        passwordComplexityValidator(() => this.profileService.profile()?.rif ?? null),
      ],
    ],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });

  constructor() {
    this.profileService.load();
  }

  openChangePasswordDialog(): void {
    this.passwordSuccess.set(false);
    this.passwordForm.reset();
    this.showChangePasswordDialog.set(true);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.passwordSuccess.set(false);

    this.authService.changePassword({
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    }).subscribe({
      next: () => {
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
      },
    });
  }
}
