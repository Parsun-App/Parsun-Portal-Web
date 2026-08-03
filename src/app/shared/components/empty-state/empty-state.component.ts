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
  template: `
    <div [class]="compact() ? 'flex flex-col items-center justify-center py-10 text-surface-400 gap-3' : 'flex flex-col items-center justify-center h-64 text-surface-400 gap-3'">
      <div class="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
        <i [class]="icon()" class="text-3xl text-surface-400"></i>
      </div>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-300">{{ title() }}</h3>
      @if (message()) {
        <p class="text-sm text-surface-500 text-center px-4">{{ message() }}</p>
      }
      @if (actionLabel() && action()) {
        <p-button [label]="actionLabel()" size="small" (onClick)="action()!()" />
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('pi pi-inbox');
  readonly title = input.required<string>();
  readonly message = input<string>();
  readonly actionLabel = input<string>();
  readonly action = input<() => void>();
  readonly compact = input(false);
}
