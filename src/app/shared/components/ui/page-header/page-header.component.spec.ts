import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';

describe('PageHeaderComponent', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;
  let componentRef: ComponentRef<PageHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PageHeaderComponent] });
    fixture = TestBed.createComponent(PageHeaderComponent);
    componentRef = fixture.componentRef;
  });

  it('renders its title, subtitle and icon', () => {
    componentRef.setInput('title', 'Pedidos');
    componentRef.setInput('subtitle', 'Historial de pedidos');
    componentRef.setInput('icon', 'pi pi-shopping-cart');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Pedidos');
    expect(element.querySelector('p')?.textContent).toContain('Historial de pedidos');
    expect(element.querySelector('i')?.className).toContain('pi-shopping-cart');
  });
});
