import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

export interface EmptyStateConfig {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  action?: () => void;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly icon = input('pi pi-inbox');
  readonly title = input.required<string>();
  readonly message = input<string>();
  readonly actionLabel = input<string>();
  readonly action = input<() => void>();
  readonly compact = input(false);
}
