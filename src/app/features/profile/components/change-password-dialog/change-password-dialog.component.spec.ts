import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@features/auth/services/application/auth.service';
import { ChangePasswordDialogComponent } from '@features/profile/components/change-password-dialog/change-password-dialog.component';

describe('ChangePasswordDialogComponent', () => {
  let fixture: ComponentFixture<ChangePasswordDialogComponent>;
  let component: ChangePasswordDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChangePasswordDialogComponent],
      providers: [{ provide: AuthService, useValue: { loading: signal(false), error: signal(null), changePassword: vi.fn().mockReturnValue(of({})) } }],
    });
    fixture = TestBed.createComponent(ChangePasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('rif', 'J-12345678-9');
    fixture.detectChanges();
  });

  it('accepts the customer rif as a valid new password', () => {
    component.passwordForm.patchValue({ currentPassword: 'OldPass@1', newPassword: 'J-12345678-9', confirmPassword: 'J-12345678-9' });
    expect(component.passwordForm.controls.newPassword.errors).toBeNull();
    expect(component.passwordForm.valid).toBe(true);
  });

  it('rejects a password that lacks complexity requirements', () => {
    component.passwordForm.patchValue({ currentPassword: 'OldPass@1', newPassword: 'simple', confirmPassword: 'simple' });
    expect(component.passwordForm.controls.newPassword.errors).not.toBeNull();
  });
});
