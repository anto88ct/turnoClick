import { Component, input } from '@angular/core';
import { BookingStatus } from '../../core/models/booking.model';
import { PlanType } from '../../core/models/plan.model';
import { StudioStatus } from '../../core/models/studio.model';

export type BadgeVariant =
  | BookingStatus
  | PlanType
  | StudioStatus
  | 'neutral'
  | 'info'
  | 'warning'
  | 'success'
  | 'urgent';

const VARIANT_CLASSES: Record<string, string> = {
  in_attesa:     'bg-amber-100 text-amber-800 border border-amber-200',
  in_corso:      'bg-blue-100  text-blue-800  border border-blue-200',
  completata:    'bg-tc-100    text-tc-800    border border-tc-200',
  annullata:     'bg-slate-100 text-slate-600 border border-slate-200',
  no_show:       'bg-rose-100  text-rose-700  border border-rose-200',
  free:          'bg-slate-100 text-slate-600 border border-slate-200',
  starter:       'bg-tc-50     text-tc-700    border border-tc-200',
  professional:  'bg-tc-100    text-tc-800    border border-tc-200',
  business:      'bg-slate-900 text-white      border border-slate-700',
  attivo:        'bg-tc-100    text-tc-800    border border-tc-200',
  sospeso:       'bg-rose-100  text-rose-700  border border-rose-200',
  prova:         'bg-amber-100 text-amber-800 border border-amber-200',
  neutral:       'bg-slate-100 text-slate-600 border border-slate-200',
  info:          'bg-blue-100  text-blue-800  border border-blue-200',
  warning:       'bg-amber-100 text-amber-800 border border-amber-200',
  success:       'bg-tc-100    text-tc-800    border border-tc-200',
  urgent:        'bg-rose-100  text-rose-700  border border-rose-200 animate-pulse',
};

const STATUS_LABELS: Record<string, string> = {
  in_attesa:    'In attesa',
  in_corso:     'In visita',
  completata:   'Completata',
  annullata:    'Annullata',
  no_show:      'No-show',
  free:         'Free',
  starter:      'Starter',
  professional: 'Professional',
  business:     'Business',
  attivo:       'Attivo',
  sospeso:      'Sospeso',
  prova:        'In prova',
};

@Component({
  selector: 'tc-badge',
  standalone: true,
  template: `
    <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ' + variantClass">
      {{ label() || statusLabel }}
    </span>
  `,
})
export class TcBadgeComponent {
  variant = input.required<BadgeVariant>();
  label = input<string>('');

  get variantClass(): string {
    return VARIANT_CLASSES[this.variant()] ?? VARIANT_CLASSES['neutral'];
  }

  get statusLabel(): string {
    return STATUS_LABELS[this.variant()] ?? this.variant();
  }
}
