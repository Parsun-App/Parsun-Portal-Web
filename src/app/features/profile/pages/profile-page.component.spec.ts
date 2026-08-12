import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ProfilePageComponent } from '@features/profile/pages/profile-page.component';
import { ProfileService } from '@features/profile/services/application/profile.service';
import { AuthService } from '@features/auth/services/application/auth.service';
import { PortalProfile } from '@features/profile/models';

const PROFILE: PortalProfile = {
  id: 'cust-1',
  legalName: 'Inversiones Global S.A.',
  rif: 'J-12345678-9',
  alias: null,
  type: 'JURIDICO',
  paymentType: 'CREDIT',
  creditDays: 30,
  creditLimit: 10000,
  currentBalance: 450,
  emails: ['contacto@inversiones.com'],
  phones: ['+58 412 123 4567'],
  addresses: [{ address: 'Av. Principal', billing: true, state: 'Caracas', municipality: 'Libertador' }],
};

const authServiceMock = {
  loading: signal(false),
  error: signal(null),
  login: vi.fn(),
  changePassword: vi.fn().mockReturnValue(of({} as PortalProfile)),
};

describe('ProfilePageComponent', () => {
  let fixture: ComponentFixture<ProfilePageComponent>;
  let component: ProfilePageComponent;
  let serviceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    profile: ReturnType<typeof signal<PortalProfile | null>>;
    load: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    serviceMock = {
      loading: signal(false),
      profile: signal<PortalProfile | null>(PROFILE),
      load: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        MessageService,
        { provide: ProfileService, useValue: serviceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should trigger a profile load on construction', () => {
    expect(serviceMock.load).toHaveBeenCalledTimes(1);
  });

  it('should forward the profile signal from the service', () => {
    expect(component.profile).toBe(serviceMock.profile);
  });

  it('should forward the loading signal from the service', () => {
    expect(component.loading).toBe(serviceMock.loading);
  });

  it('should render the legal name when the profile is loaded', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Inversiones Global S.A.');
  });

  it('should render the fallback empty state when the profile is not loaded', () => {
    serviceMock.profile.set(null);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h3');
    expect(title.textContent.trim()).toBe('No se pudo cargar el perfil');
  });

});
