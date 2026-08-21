import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { DashboardPageComponent } from '@features/dashboard/pages/dashboard-page.component';
import { DashboardService } from '@features/dashboard/services/application/dashboard.service';
import { AuthService } from '@features/auth/services/application/auth.service';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { OrdersService } from '@features/orders/services/application/orders.service';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalDashboard } from '@features/dashboard/models';

function createMockService() {
  return {
    loading: signal(false),
    creating: signal(false),
    quotes: signal([]),
    orders: signal([]),
    detail: signal(null),
    detailDialogVisible: signal(false),
    createDialogVisible: signal(false),
    searchTerm: signal(''),
    filterStatus: signal<string | undefined>(undefined),
    dateFrom: signal(''),
    dateTo: signal(''),
    openCreateDialog: vi.fn(),
    openDetail: vi.fn(),
    onSearch: vi.fn(),
    onStatusFilterChange: vi.fn(),
    onDateFilterChange: vi.fn(),
    clearFilters: vi.fn(),
    load: vi.fn(),
    cancelQuote: vi.fn(),
    cancelOrder: vi.fn(),
    createDialogRequested$: new Subject<void>(),
    created$: new Subject<void>(),
    requestCreateDialog: vi.fn(),
  };
}

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
    const authMock = {
      currentUser: vi.fn().mockReturnValue({ legalName: 'Inversiones Global S.A.' }),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: DashboardService, useValue: dashboardMock },
        { provide: AuthService, useValue: authMock },
        { provide: QuotesService, useValue: createMockService() },
        { provide: OrdersService, useValue: createMockService() },
        { provide: ProductsApiService, useValue: { downloadCatalogPdf: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the pending amount card with full amount when below one thousand', () => {
    const card = component.buildStats(PORTAL_DASHBOARD).find((c) => c.label === 'Monto Pendiente');
    expect(card?.value).toBe(400);
    expect(card?.isCurrency).toBe(true);
  });

  it('should render the pending amount card with full amount when at least one thousand', () => {
    const card = component
      .buildStats({ ...PORTAL_DASHBOARD, pendingAmount: 1200 })
      .find((c) => c.label === 'Monto Pendiente');
    expect(card?.value).toBe(1200);
    expect(card?.isCurrency).toBe(true);
  });

  it('should display the pending amount as $400.00 in the template', () => {
    const cards = fixture.nativeElement.querySelectorAll('a');
    const pendingCard = Array.from(cards).find((card: Element) =>
      card.textContent.includes('Monto Pendiente'),
    );
    expect(pendingCard.textContent).toContain('$400.00');
  });

  it('should display the full pending amount in the template', () => {
    component.dashboard.set({ ...PORTAL_DASHBOARD, pendingAmount: 1200 });
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('a');
    const pendingCard = Array.from(cards).find((card: Element) =>
      card.textContent.includes('Monto Pendiente'),
    );
    expect(pendingCard.textContent).toContain('$1,200.00');
  });
});
