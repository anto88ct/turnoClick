import { Component, input } from '@angular/core';

@Component({
  selector: 'tc-stat-card',
  standalone: true,
  template: `
    <div class="dashboard-card flex flex-col gap-3 hover:shadow-card-hover transition-shadow duration-200">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ label() }}</p>
          <p class="text-3xl font-extrabold mt-1 leading-none" [class]="valueColor()">
            {{ value() }}
          </p>
          @if (sub()) {
            <p class="text-xs text-slate-400 mt-1">{{ sub() }}</p>
          }
        </div>
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
             [class]="iconBg()">
          <ng-content select="[icon]" />
        </div>
      </div>
      @if (trend() !== null) {
        <div class="flex items-center gap-1.5 text-xs font-semibold"
             [class]="(trend() ?? 0) >= 0 ? 'text-tc-600' : 'text-rose-500'">
          @if ((trend() ?? 0) >= 0) {
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            +{{ trend() }}% rispetto a ieri
          } @else {
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
            {{ trend() }}% rispetto a ieri
          }
        </div>
      }
    </div>
  `,
})
export class TcStatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  sub = input<string>('');
  iconBg = input<string>('bg-tc-50');
  valueColor = input<string>('text-slate-900');
  trend = input<number | null>(null);
}
