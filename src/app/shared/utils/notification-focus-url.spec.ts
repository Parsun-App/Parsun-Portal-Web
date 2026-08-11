import { Location } from '@angular/common';
import { clearNotificationFocusFromUrl } from './notification-focus-url';

describe('clearNotificationFocusFromUrl', () => {
  it.each([
    ['/quotes?focus=q1&source=notification', '/quotes', 'source=notification'],
    ['/orders?campaign=spring&focus=o1', '/orders', 'campaign=spring'],
    ['/payments?focus=p1&tab=pending', '/payments', 'tab=pending'],
  ])('should remove focus and preserve other parameters for %s', (url, path, query) => {
    let currentUrl = url;
    const location = {
      path: vi.fn(() => currentUrl),
      replaceState: vi.fn((nextPath: string, nextQuery: string) => {
        currentUrl = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
      }),
    } as unknown as Location;

    clearNotificationFocusFromUrl(location);

    expect(location.replaceState).toHaveBeenCalledWith(path, query);
    expect(location.path()).toBe(query ? `${path}?${query}` : path);
  });
});
