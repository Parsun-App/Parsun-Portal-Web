import { describe, expect, it } from 'vitest';

import { environment } from './environment.prod';

describe('production environment', () => {
  it('targets the active Railway API domain', () => {
    expect(environment.apiUrl).toBe(
      'https://parsun-api-production-543c.up.railway.app/api',
    );
  });
});
