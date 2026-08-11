import { Location } from '@angular/common';

export function clearNotificationFocusFromUrl(location: Location): void {
  const [path, query = ''] = location.path().split('?');
  const parameters = new URLSearchParams(query);

  if (!parameters.has('focus')) return;

  parameters.delete('focus');
  location.replaceState(path, parameters.toString());
}
