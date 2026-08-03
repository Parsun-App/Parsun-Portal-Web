import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardService } from '@features/dashboard/services/application/dashboard.service';
import { AuthService } from '@features/auth/services/application/auth.service';
import { PortalDashboard } from '@features/dashboard/models';

const PORTAL_DASHBOARD: PortalDashboard = {
  draftQuotes: 2,
  confirmedOrders: 1,
  pendingInvoices: 1,
  pendingAmount: 400,
  recentActivity: [],
};

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let component: DashboardPageComponent;

  beforeEach(async () => {
    const dashboardMock = {
      loading: signal(false),
      dashboard: signal<PortalDashboard | null>(PORTAL_DASHBOARD),
      load: vi.fn(),
    };
    const authMock = { currentUser: vi.fn().mockReturnValue({ legalName: 'Inversiones Global S.A.' }) };

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: DashboardService, useValue: dashboardMock },
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the pending amount card with full amount when below one thousand', () => {
    const card = component.buildStats(PORTAL_DASHBOARD).find((c) => c.label === 'Monto Pendiente');
    expect(card?.value).toBe(400);
    expect(card?.suffix).toBeUndefined();
  });

  it('should render the pending amount card in thousands when at least one thousand', () => {
    const card = component.buildStats({ ...PORTAL_DASHBOARD, pendingAmount: 1200 }).find((c) => c.label === 'Monto Pendiente');
    expect(card?.value).toBe(1.2);
    expect(card?.format).toBe('1.0-1');
    expect(card?.suffix).toBe('k');
  });

  it('should display the pending amount as $400 in the template', () => {
    const cards = fixture.nativeElement.querySelectorAll('a');
    const pendingCard = Array.from(cards).find((card: Element) => card.textContent.includes('Monto Pendiente'));
    expect(pendingCard.textContent).toContain('$400');
    expect(pendingCard.textContent).not.toContain('k');
  });

  it('should display the pending amount in thousands format in the template', () => {
    component.dashboard.set({ ...PORTAL_DASHBOARD, pendingAmount: 1200 });
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('a');
    const pendingCard = Array.from(cards).find((card: Element) => card.textContent.includes('Monto Pendiente'));
    expect(pendingCard.textContent).toContain('$1.2k');
  });
});
