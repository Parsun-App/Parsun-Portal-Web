import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationDestinationResolver } from './notification-destination.resolver';

describe('NotificationDestinationResolver', () => {
  let resolver: NotificationDestinationResolver;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    resolver = TestBed.inject(NotificationDestinationResolver);
    router = TestBed.inject(Router);
  });

  it.each([
    ['PAYMENT', 'payment-1', ['/payments']],
    ['QUOTE', 'quote-1', ['/quotes']],
    ['ORDER', 'order-1', ['/orders']],
  ])('should navigate a %s reference to its collection with focus', async (referenceType, referenceId, commands) => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await resolver.navigate(referenceType, referenceId);

    expect(navigate).toHaveBeenCalledWith(commands, { queryParams: { focus: referenceId } });
  });

  it('should fall back to a known collection when the id is absent', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await resolver.navigate('QUOTE', null);

    expect(navigate).toHaveBeenCalledWith(['/quotes']);
  });

  it('should fall back to the collection when focused navigation fails', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await resolver.navigate('ORDER', 'order-1');

    expect(navigate).toHaveBeenNthCalledWith(1, ['/orders'], { queryParams: { focus: 'order-1' } });
    expect(navigate).toHaveBeenNthCalledWith(2, ['/orders']);
  });

  it('should not navigate for null or unknown reference types', async () => {
    const navigate = vi.spyOn(router, 'navigate');

    await resolver.navigate(null, 'resource-1');
    await resolver.navigate('UNKNOWN', 'resource-1');

    expect(navigate).not.toHaveBeenCalled();
  });
});
