import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiUrlInterceptor } from './api-url.interceptor';

describe('apiUrlInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
  });

  afterEach(() => http.verify());

  it('keeps the api path for relative requests', () => {
    client.get('/api/portal/notifications').subscribe();

    http.expectOne('/api/portal/notifications');
  });

  it('does not rewrite absolute urls', () => {
    client.get('https://example.com/api/portal/notifications').subscribe();

    http.expectOne('https://example.com/api/portal/notifications');
  });

  it('does not rewrite urls outside the api path', () => {
    client.get('/assets/data.json').subscribe();

    http.expectOne('/assets/data.json');
  });
});
