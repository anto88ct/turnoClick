import { Component } from '@angular/core';
import { PLANS } from '../../core/models/plan.model';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [TcButtonComponent],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <div class="mb-6">
        <h1 class="page-header">Piani di abbonamento</h1>
        <p class="page-subheader">Configurazione e prezzi dei piani TurnoClick</p>
      </div>

      <!-- Annual vs Monthly -->
      <div class="flex items-center justify-center gap-3 mb-8">
        <span class="text-sm font-semibold text-slate-600">Mensile</span>
        <div class="relative w-12 h-6 bg-tc-500 rounded-full cursor-pointer">
          <div class="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
        </div>
        <span class="text-sm font-semibold text-tc-700">
          Annuale
          <span class="ml-1.5 text-xs bg-tc-100 text-tc-700 px-2 py-0.5 rounded-full font-bold">-17%</span>
        </span>
      </div>

      <!-- Plan cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        @for (plan of plans; track plan.id) {
          <div
            [class]="plan.highlighted
              ? 'border-2 border-tc-500 bg-white shadow-tc-lg relative'
              : 'border border-tc-border bg-white shadow-card'"
            class="rounded-3xl p-6 flex flex-col gap-4 hover:shadow-card-hover transition-all duration-200"
          >
            @if (plan.badge) {
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span class="px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap"
                      [class]="plan.highlighted
                        ? 'bg-tc-500 text-white shadow-tc'
                        : 'bg-slate-800 text-white'">
                  {{ plan.badge }}
                </span>
              </div>
            }

            <!-- Plan header -->
            <div>
              <p class="font-extrabold text-slate-900 text-lg">{{ plan.name }}</p>
              <div class="flex items-baseline gap-1 mt-2">
                @if (plan.priceYearly === 0) {
                  <span class="text-4xl font-extrabold text-slate-900">Gratis</span>
                } @else {
                  <span class="text-4xl font-extrabold"
                        [class]="plan.highlighted ? 'text-tc-600' : 'text-slate-900'">
                    €{{ (plan.priceYearly / 12).toFixed(0) }}
                  </span>
                  <span class="text-slate-400 font-semibold text-sm">/mese</span>
                }
              </div>
              @if (plan.priceYearly > 0) {
                <p class="text-xs text-slate-400 mt-0.5">
                  €{{ plan.priceYearly }} fatturato annualmente
                </p>
              }
            </div>

            <!-- Divider -->
            <div class="h-px" [class]="plan.highlighted ? 'bg-tc-200' : 'bg-tc-border'"></div>

            <!-- Features -->
            <ul class="flex flex-col gap-2.5 flex-1">
              @for (feature of plan.features; track feature) {
                <li class="flex items-start gap-2.5 text-sm">
                  <svg class="w-4 h-4 flex-shrink-0 mt-0.5"
                       [class]="plan.highlighted ? 'text-tc-500' : 'text-slate-400'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span [class]="plan.highlighted ? 'text-tc-900 font-medium' : 'text-slate-600'">
                    {{ feature }}
                  </span>
                </li>
              }
            </ul>

            <!-- CTA -->
            <tc-button
              [variant]="plan.highlighted ? 'primary' : 'outline'"
              [fullWidth]="true"
            >
              {{ plan.priceYearly === 0 ? 'Piano attuale' : 'Modifica piano' }}
            </tc-button>
          </div>
        }
      </div>

      <!-- Plan comparison table -->
      <div class="dashboard-card overflow-hidden">
        <h2 class="font-extrabold text-slate-900 mb-4">Confronto dettagliato piani</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-tc-border">
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Funzionalità</th>
                @for (plan of plans; track plan.id) {
                  <th class="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider"
                      [class]="plan.highlighted ? 'text-tc-600' : 'text-slate-400'">
                    {{ plan.name }}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of comparisonRows; track row.feature) {
                <tr class="border-b border-tc-border/50">
                  <td class="py-3 px-4 font-semibold text-slate-700">{{ row.feature }}</td>
                  @for (val of row.values; track $index) {
                    <td class="py-3 px-4 text-center">
                      @if (val === true) {
                        <svg class="w-5 h-5 text-tc-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      } @else if (val === false) {
                        <svg class="w-5 h-5 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      } @else {
                        <span class="font-semibold text-slate-700">{{ val }}</span>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PlansComponent {
  readonly plans = PLANS;

  readonly comparisonRows: { feature: string; values: (string | boolean)[] }[] = [
    { feature: 'Medici inclusi',        values: ['1', '3', '10', 'Illimitati'] },
    { feature: 'SMS/mese',              values: ['20', '200', '1.000', '3.000'] },
    { feature: 'Gestione coda live',    values: [true, true, true, true] },
    { feature: 'QR code personalizzato',values: [true, true, true, true] },
    { feature: 'Prenotazioni programmate',values: [true, true, true, true] },
    { feature: 'Report avanzati',       values: [false, true, true, true] },
    { feature: 'Personalizzazione SMS', values: [false, false, true, true] },
    { feature: 'Modulo ecommerce',      values: [false, false, false, true] },
    { feature: 'API e integrazioni',    values: [false, false, false, true] },
    { feature: 'Assistenza prioritaria',values: [false, false, false, true] },
    { feature: 'Prezzo/mese (annuale)', values: ['€0', '€24', '€66', '€124'] },
  ];
}
