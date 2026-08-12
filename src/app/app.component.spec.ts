import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { AppComponent } from '@app/app.component';

describe('AppComponent', () => {
  it('creates the application shell', () => {
    TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([])] });
    expect(TestBed.createComponent(AppComponent).componentInstance).toBeTruthy();
  });
});
