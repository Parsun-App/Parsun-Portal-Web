import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ProfileService } from '@features/profile/services/application/profile.service';
import { ProfileApiService } from '@features/profile/services/api/profile-api.service';
import { PortalProfile } from '@features/profile/models';
import { PROFILE_MESSAGES } from '@features/profile/messages/profile.messages';

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

describe('ProfileService', () => {
  let apiMock: { getProfile: ReturnType<typeof vi.fn> };
  let messageMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiMock = { getProfile: vi.fn() };
    messageMock = { add: vi.fn() };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function createService(): ProfileService {
    TestBed.configureTestingModule({
      providers: [
        { provide: ProfileApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });
    return TestBed.inject(ProfileService);
  }

  it('should load the profile and update the loading state', () => {
    const pending = new Subject<PortalProfile>();
    apiMock.getProfile.mockReturnValue(pending.asObservable());
    const service = createService();
    service.load();
    expect(service.loading()).toBe(true);
    pending.next(PROFILE);
    pending.complete();
    expect(service.profile()).toEqual(PROFILE);
    expect(service.loading()).toBe(false);
  });

  it('should show an error toast and keep the profile null when loading fails', () => {
    apiMock.getProfile.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    service.load();
    expect(messageMock.add).toHaveBeenCalledWith(PROFILE_MESSAGES.loadError);
    expect(service.loading()).toBe(false);
    expect(service.profile()).toBeNull();
  });
});
