import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
  });

  it('should render the title', () => {
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h3');
    expect(title.textContent.trim()).toBe('No hay pedidos');
  });

  it('should render the message when provided', () => {
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.componentRef.setInput('message', 'Tus pedidos aparecerán aquí cuando los tengas.');
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('p');
    expect(message.textContent.trim()).toContain('Tus pedidos aparecerán aquí');
  });

  it('should not render the message when omitted', () => {
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('p');
    expect(message).toBeNull();
  });

  it('should use pi-inbox as default icon', () => {
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i');
    expect(icon.classList).toContain('pi-inbox');
  });

  it('should allow overriding the icon', () => {
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.componentRef.setInput('icon', 'pi pi-shopping-cart');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i');
    expect(icon.classList).toContain('pi-shopping-cart');
    expect(icon.classList).not.toContain('pi-inbox');
  });

  it('should render the action button and trigger the callback on click', () => {
    const action = vi.fn();
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.componentRef.setInput('actionLabel', 'Recargar');
    fixture.componentRef.setInput('action', action);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toContain('Recargar');

    button.click();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not render the action button when the action is missing', () => {
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.componentRef.setInput('actionLabel', 'Recargar');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeNull();
  });

  it('should not render the action button when the label is missing', () => {
    fixture.componentRef.setInput('title', 'No hay pedidos');
    fixture.componentRef.setInput('action', vi.fn());
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeNull();
  });

  it('should apply compact styling when compact is true', () => {
    fixture.componentRef.setInput('title', 'Sin actividad reciente');
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('div');
    expect(container.classList).toContain('py-10');
    expect(container.classList).not.toContain('h-64');
  });
});
