import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '@features/auth/services/application/auth.service';
import { ChangePasswordPageComponent } from '@features/auth/pages/change-password/change-password-page.component';
import { ProfileService } from '@features/profile/services/application/profile.service';

describe('ChangePasswordPageComponent', () => {
  it('creates its password form', () => {
    TestBed.configureTestingModule({
      imports: [ChangePasswordPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loading: signal(false),
            error: signal(null),
            changePassword: vi.fn(() => of({})),
          },
        },
        { provide: ProfileService, useValue: { profile: signal(null) } },
      ],
    });
    const component = TestBed.createComponent(ChangePasswordPageComponent).componentInstance;
    expect(component.form).toBeTruthy();
  });
});
