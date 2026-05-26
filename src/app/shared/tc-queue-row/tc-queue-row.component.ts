import { Component, input, output } from '@angular/core';
import { Booking, BookingStatus, REQUEST_TYPE_LABELS } from '../../core/models/booking.model';
import { TcBadgeComponent } from '../tc-badge/tc-badge.component';
import { TcButtonComponent } from '../tc-button/tc-button.component';

@Component({
  selector: 'tc-queue-row',
  standalone: true,
  imports: [TcBadgeComponent, TcButtonComponent],
  template: `
    <div class="tc-queue-row flex items-center gap-3 p-3 bg-white border border-tc-border/60
                rounded-xl hover:border-tc-200 transition-all duration-200 animate-slide-in-up"
         [class.border-l-4]="booking().status === 'in_corso'"
         [class.border-l-blue-400]="booking().status === 'in_corso'"
         [class.bg-blue-50]="booking().status === 'in_corso'">

      @if (draggable()) {
        <div class="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400
                    cdkDragHandle p-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
          </svg>
        </div>
      }

      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-tc-100 flex items-center justify-center
                  text-tc-700 text-xs font-extrabold">
        {{ booking().status === 'in_corso' ? '▶' : booking().position }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-sm text-slate-900 truncate">{{ booking().patientName }}</span>
          <tc-badge [variant]="booking().requestType === 'visita' ? 'info' : 'neutral'"
                   [label]="requestLabel" />
        </div>
        <div class="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
          <span>{{ booking().doctorName }}</span>
          <span class="hidden sm:inline">·</span>
          <span class="hidden sm:inline">
            @if (booking().status === 'in_corso') {
              In visita ora
            } @else {
              Stima: {{ estimatedTime }}
            }
          </span>
        </div>
        @if (booking().internalNote) {
          <div class="mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg inline-block">
            📝 {{ booking().internalNote }}
          </div>
        }
      </div>

      <div class="flex-shrink-0">
        <tc-badge [variant]="booking().status" />
      </div>

      @if (showActions()) {
        <div class="flex-shrink-0 flex gap-1.5 flex-wrap justify-end">
          @if (booking().status === 'in_attesa') {
            <tc-button size="sm" variant="primary" (clicked)="statusChange.emit({ id: booking().id, status: 'in_corso' })">
              In visita
            </tc-button>
          }
          @if (booking().status === 'in_corso') {
            <tc-button size="sm" variant="secondary" (clicked)="statusChange.emit({ id: booking().id, status: 'in_attesa' })">
              Sto finendo
            </tc-button>
            <tc-button size="sm" variant="primary" (clicked)="statusChange.emit({ id: booking().id, status: 'completata' })">
              Terminata
            </tc-button>
          }
          @if (booking().status === 'in_attesa') {
            <tc-button size="sm" variant="ghost" (clicked)="statusChange.emit({ id: booking().id, status: 'no_show' })">
              No-show
            </tc-button>
          }
        </div>
      }
    </div>
  `,
})
export class TcQueueRowComponent {
  booking = input.required<Booking>();
  draggable = input(false);
  showActions = input(false);
  statusChange = output<{ id: string; status: BookingStatus }>();

  get requestLabel(): string {
    return REQUEST_TYPE_LABELS[this.booking().requestType];
  }

  get estimatedTime(): string {
    const t = this.booking().estimatedStartAt;
    return t.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
}
