import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { SearchFieldComponent } from '@shared/components/ui';

export interface ListFilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-list-filters',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DatePickerModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    SearchFieldComponent,
  ],
  templateUrl: './list-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFiltersComponent {
  readonly searchTerm = input('');
  readonly status = input<string | null | undefined>(null);
  readonly dateFrom = input<Date | null>(null);
  readonly dateTo = input<Date | null>(null);
  readonly activeFilterCount = input(0);
  readonly statusOptions = input.required<ListFilterOption[]>();

  readonly searchChanged = output<string>();
  readonly statusChanged = output<string | null>();
  readonly dateFromChanged = output<Date | null>();
  readonly dateToChanged = output<Date | null>();
  readonly filtersCleared = output<void>();
}
