import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { MetricCardComponent } from '@shared/components/ui/metric-card/metric-card.component';

describe('MetricCardComponent', () => {
  let fixture: ComponentFixture<MetricCardComponent>;
  let componentRef: ComponentRef<MetricCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MetricCardComponent] });
    fixture = TestBed.createComponent(MetricCardComponent);
    componentRef = fixture.componentRef;
  });

  it('renders a numeric metric and its visual identity', () => {
    componentRef.setInput('label', 'Pedidos pendientes');
    componentRef.setInput('value', 12);
    componentRef.setInput('icon', 'pi pi-clock');
    componentRef.setInput('gradient', 'linear-gradient(red, blue)');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('12');
    expect(element.textContent).toContain('Pedidos pendientes');
    expect(element.querySelector('i')?.className).toContain('pi-clock');
  });

  it('formats currency values when requested', () => {
    componentRef.setInput('label', 'Importe total');
    componentRef.setInput('value', 1250);
    componentRef.setInput('icon', 'pi pi-dollar');
    componentRef.setInput('gradient', 'linear-gradient(red, blue)');
    componentRef.setInput('currency', true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('$1,250.00');
  });
});
