import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DashboardService } from '@features/dashboard/services/application/dashboard.service';
import { DashboardApiService } from '@features/dashboard/services/api/dashboard-api.service';
import { PortalDashboard } from '@features/dashboard/models';
import { DASHBOARD_MESSAGES } from '@features/dashboard/messages/dashboard.messages';

const DASHBOARD: PortalDashboard = {
  draftQuotes: 2,
  confirmedOrders: 1,
  pendingInvoices: 1,
  pendingAmount: 400,
  recentActivity: [
    { type: 'QUOTE', number: 'COT-0001', date: '2026-08-01', status: 'DRAFT', amount: 500 },
  ],
};

describe('DashboardService', () => {
  let apiMock: { getDashboard: ReturnType<typeof vi.fn> };
  let messageMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiMock = { getDashboard: vi.fn() };
    messageMock = { add: vi.fn() };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function createService(): DashboardService {
    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });
    return TestBed.inject(DashboardService);
  }

  it('should load the dashboard and update the loading state', () => {
    const pending = new Subject<PortalDashboard>();
    apiMock.getDashboard.mockReturnValue(pending.asObservable());
    const service = createService();
    service.load();
    expect(service.loading()).toBe(true);
    pending.next(DASHBOARD);
    pending.complete();
    expect(service.dashboard()).toEqual(DASHBOARD);
    expect(service.loading()).toBe(false);
  });

  it('should show an error toast and keep the dashboard null when loading fails', () => {
    apiMock.getDashboard.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    service.load();
    expect(messageMock.add).toHaveBeenCalledWith(DASHBOARD_MESSAGES.loadError);
    expect(service.loading()).toBe(false);
    expect(service.dashboard()).toBeNull();
  });
});
