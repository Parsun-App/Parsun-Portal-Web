import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchFieldComponent } from './search-field.component';

describe('SearchFieldComponent', () => {
  let fixture: ComponentFixture<SearchFieldComponent>;
  let component: SearchFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SearchFieldComponent] });
    fixture = TestBed.createComponent(SearchFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'inicial');
    fixture.detectChanges();
  });

  it('does not search while typing and searches with the button', () => {
    const listener = vi.fn();
    component.search.subscribe(listener);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'factura';
    input.dispatchEvent(new Event('input'));

    expect(listener).not.toHaveBeenCalled();

    const searchButton = fixture.nativeElement.querySelector(
      'button[aria-label="Buscar"]',
    ) as HTMLButtonElement;
    searchButton.click();

    expect(listener).toHaveBeenCalledWith('factura');
  });

  it('searches when Enter is pressed', () => {
    const listener = vi.fn();
    component.search.subscribe(listener);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'pedido';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(listener).toHaveBeenCalledWith('pedido');
  });

  it('clears the field and restores the default search', () => {
    const listener = vi.fn();
    component.search.subscribe(listener);
    const clearButton = fixture.nativeElement.querySelector(
      'button[aria-label="Limpiar búsqueda"]',
    ) as HTMLButtonElement;

    clearButton.click();
    fixture.detectChanges();

    expect(component.draft()).toBe('');
    expect(listener).toHaveBeenCalledWith('');
    expect(fixture.nativeElement.querySelector('button[aria-label="Limpiar búsqueda"]')).toBeNull();
  });
});
