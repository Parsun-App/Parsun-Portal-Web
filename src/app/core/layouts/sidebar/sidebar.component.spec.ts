import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { SidebarComponent } from '@core/layouts/sidebar/sidebar.component';

describe('SidebarComponent', () => {
  it('exposes the portal navigation', () => {
    TestBed.configureTestingModule({ imports: [SidebarComponent], providers: [provideRouter([])] });
    const component = TestBed.createComponent(SidebarComponent).componentInstance;
    expect(component.menuItems.length).toBe(7);
  });
});
