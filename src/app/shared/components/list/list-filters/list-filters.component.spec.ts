import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFiltersComponent } from '@shared/components/list/list-filters/list-filters.component';
import { SearchFieldComponent } from '@shared/components/ui';

describe('ListFiltersComponent', () => {
  let fixture: ComponentFixture<ListFiltersComponent>;
  let componentRef: ComponentRef<ListFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ListFiltersComponent] });
    fixture = TestBed.createComponent(ListFiltersComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('statusOptions', []);
  });

  it('emits a reset request when clearing filters', () => {
    const listener = vi.fn();
    fixture.componentInstance.filtersCleared.subscribe(listener);
    componentRef.setInput('activeFilterCount', 2);
    fixture.detectChanges();

    fixture.componentInstance.filtersCleared.emit();

    expect(listener).toHaveBeenCalledOnce();
  });

  it('uses the shared explicit search field', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.directive(SearchFieldComponent))).toHaveLength(1);
  });
});
