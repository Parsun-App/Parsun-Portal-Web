import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/application/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = this.authService.loading;
  readonly error = this.authService.error;

  readonly rif = signal('');
  readonly password = signal('');

  async login(): Promise<void> {
    if (!this.rif() || !this.password()) return;

    await this.authService.login(this.rif(), this.password());
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
