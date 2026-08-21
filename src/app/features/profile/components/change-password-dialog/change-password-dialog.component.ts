import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordComplexityValidator } from '@features/auth/validators/password-complexity.validator';
import { passwordsMatchValidator } from '@features/auth/validators/password-match.validator';
import { getPasswordError } from '@features/auth/validators/password-validation.helper';
import { AuthService } from '@features/auth/services/application/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule, MessageModule, PasswordModule, ReactiveFormsModule],
  templateUrl: './change-password-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordDialogComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = model(false);
  readonly rif = input<string | null>(null);
  readonly changingPassword = this.authService.loading;
  readonly passwordError = this.authService.error;
  readonly passwordSuccess = signal(false);
  private readonly newPasswordValue = signal('');

  readonly passwordForm = this.formBuilder.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, passwordComplexityValidator(() => this.rif())]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  readonly newPasswordError = computed(() => getPasswordError(this.newPasswordValue(), this.rif()));

  constructor() {
    this.passwordForm.controls.newPassword.valueChanges.subscribe((value) =>
      this.newPasswordValue.set(value ?? ''),
    );
  }

  reset(): void {
    this.passwordSuccess.set(false);
    this.passwordForm.reset();
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const currentPassword = this.passwordForm.controls.currentPassword.value;
    const newPassword = this.passwordForm.controls.newPassword.value;
    if (!currentPassword || !newPassword) return;
    this.passwordSuccess.set(false);
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
      },
    });
  }
}
