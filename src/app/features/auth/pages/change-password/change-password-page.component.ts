import { Component, signal, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/application/auth.service';
import { ProfileService } from '@features/profile/services/application/profile.service';
import { passwordsMatchValidator } from '../../validators/password-match.validator';
import { passwordComplexityValidator } from '../../validators/password-complexity.validator';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, PasswordModule, ButtonModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './change-password-page.component.html',
})
export class ChangePasswordPageComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);
  private valueChangesSub?: Subscription;

  readonly loading = this.authService.loading;
  readonly error = this.authService.error;
  readonly success = signal(false);

  readonly form: FormGroup = this.fb.group({
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

  ngOnInit(): void {
    this.valueChangesSub = this.form.valueChanges.subscribe(() => this.success.set(false));
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  changePassword(): void {
    if (this.form.invalid) return;

    this.success.set(false);
    this.authService.changePassword({
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword,
    }).subscribe({
      next: () => {
        this.success.set(true);
        this.form.reset();
      },
    });
  }
}
