import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '@features/auth/services/application/auth.service';
import { LoginPageComponent } from '@features/auth/pages/login/login-page.component';

describe('LoginPageComponent', () => {
  it('does not submit empty credentials', async () => {
    const login = vi.fn();
    TestBed.configureTestingModule({ imports: [LoginPageComponent], providers: [provideRouter([]), { provide: AuthService, useValue: { loading: signal(false), error: signal(null), isAuthenticated: signal(false), login } }] });
    const component = TestBed.createComponent(LoginPageComponent).componentInstance;
    await component.login();
    expect(login).not.toHaveBeenCalled();
  });
});
