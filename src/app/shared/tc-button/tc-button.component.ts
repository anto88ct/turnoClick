import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'tc-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="computedClass"
      (click)="clicked.emit()"
    >
      <ng-content />
    </button>
  `,
})
export class TcButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  fullWidth = input(false);
  clicked = output<void>();

  get computedClass(): string {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed select-none ';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-tc-500 text-white hover:bg-tc-600 active:bg-tc-700 shadow-tc focus:ring-tc-300',
      secondary:
        'bg-tc-50 text-tc-700 hover:bg-tc-100 active:bg-tc-200 focus:ring-tc-200',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-200',
      danger:
        'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm focus:ring-rose-300',
      outline:
        'bg-white text-tc-600 border-2 border-tc-500 hover:bg-tc-50 focus:ring-tc-200',
    };

    const fw = this.fullWidth() ? 'w-full ' : '';
    return base + sizes[this.size()] + ' ' + variants[this.variant()] + ' ' + fw;
  }
}
