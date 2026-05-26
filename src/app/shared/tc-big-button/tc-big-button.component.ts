import { Component, input, output } from '@angular/core';

export type BigButtonVariant = 'green' | 'outline' | 'white';

@Component({
  selector: 'tc-big-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="computedClass"
      (click)="clicked.emit()"
    >
      <span class="flex flex-col items-center gap-1.5">
        <ng-content />
      </span>
    </button>
  `,
})
export class TcBigButtonComponent {
  variant = input<BigButtonVariant>('green');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  clicked = output<void>();

  get computedClass(): string {
    const base =
      'w-full min-h-[80px] flex items-center justify-center rounded-2xl ' +
      'font-bold text-2xl transition-all duration-200 select-none ' +
      'focus:outline-none focus:ring-4 active:scale-[0.98] ' +
      'disabled:opacity-50 disabled:cursor-not-allowed ';

    const variants: Record<BigButtonVariant, string> = {
      green:
        'bg-tc-500 text-white shadow-tc-lg hover:bg-tc-600 active:bg-tc-700 ' +
        'focus:ring-tc-300 focus:ring-offset-2',
      outline:
        'bg-white text-tc-600 border-3 border-tc-500 hover:bg-tc-50 ' +
        'focus:ring-tc-200 focus:ring-offset-2 shadow-card',
      white:
        'bg-white text-slate-800 shadow-card hover:shadow-card-hover ' +
        'focus:ring-slate-200 focus:ring-offset-2',
    };

    return base + variants[this.variant()];
  }
}
