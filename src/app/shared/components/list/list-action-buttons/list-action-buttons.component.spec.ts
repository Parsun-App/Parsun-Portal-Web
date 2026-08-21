import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListActionButtonsComponent } from './list-action-buttons.component';

describe('ListActionButtonsComponent', () => {
  let fixture: ComponentFixture<ListActionButtonsComponent>;
  let component: ListActionButtonsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ListActionButtonsComponent] });
    fixture = TestBed.createComponent(ListActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', [
      { label: 'Pagar', icon: 'pi pi-credit-card', command: vi.fn() },
      { label: 'Cancelar', icon: 'pi pi-trash', command: vi.fn(), danger: true },
      { label: 'Ver detalle', icon: 'pi pi-eye', command: vi.fn() },
      { label: 'Editar', icon: 'pi pi-pencil', command: vi.fn() },
    ]);
    fixture.detectChanges();
  });

  it('orders view, edit and cancellation before module-specific actions', () => {
    expect(component.orderedActions().map((action) => action.label)).toEqual([
      'Ver detalle',
      'Editar',
      'Cancelar',
      'Pagar',
    ]);
  });

  it('renders one centered three-dot trigger', () => {
    const trigger = fixture.nativeElement.querySelector(
      'button[aria-label="Abrir acciones del registro"]',
    ) as HTMLButtonElement;

    expect(trigger).toBeTruthy();
    expect(trigger.querySelector('.pi-ellipsis-v')).toBeTruthy();
    expect(fixture.nativeElement.classList).toContain('justify-center');
  });
});
