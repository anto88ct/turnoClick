import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PLANS, Plan } from '../../core/models/plan.model';

interface EditablePlan extends Plan {
  discountPct: number;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">

      <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">Piani di abbonamento</h1>
          <p class="text-sm text-slate-500 mt-0.5">Modifica prezzi e applica sconti ai piani</p>
        </div>
        <button (click)="saveAll()" class="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all hover:opacity-90"
                style="background-color: var(--brand)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Salva tutto
        </button>
      </div>

      @if (saved()) {
        <div class="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          <p class="text-sm font-semibold text-emerald-700">Modifiche salvate con successo.</p>
        </div>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        @for (plan of editablePlans(); track plan.id) {
          <div class="bg-white rounded-3xl border-2 shadow-sm overflow-hidden flex flex-col transition-all"
               [class]="plan.highlighted ? 'border-tc-400' : 'border-slate-200'">

            <div class="px-5 pt-5 pb-4 border-b border-slate-100">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-extrabold text-slate-900 text-lg">{{ plan.name }}</h3>
                @if (plan.badge) {
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                        style="background-color: var(--brand)">{{ plan.badge }}</span>
                }
              </div>
              <p class="text-xs text-slate-400">{{ plan.maxDoctors === null ? 'Medici illimitati' : 'Max ' + plan.maxDoctors + ' medici' }}</p>
            </div>

            <div class="p-5 space-y-4 flex-1">
              <div class="space-y-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prezzo mensile (€)</label>
                  <input type="number" [(ngModel)]="plan.priceMonthly" min="0" step="1"
                         class="tc-input-sm w-full font-mono font-extrabold text-lg"
                         [disabled]="plan.id === 'free'">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prezzo annuale (€)</label>
                  <input type="number" [(ngModel)]="plan.priceYearly" min="0" step="1"
                         class="tc-input-sm w-full font-mono"
                         [disabled]="plan.id === 'free'">
                </div>
              </div>

              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <div class="flex items-center justify-between mb-2">
                  <label class="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Sconto promo (%)</label>
                  @if (plan.discountPct > 0) {
                    <span class="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">-{{ plan.discountPct }}%</span>
                  }
                </div>
                <input type="range" [(ngModel)]="plan.discountPct" min="0" max="50" step="5" class="w-full accent-amber-500">
                <div class="flex justify-between text-[9px] text-amber-600/60 font-semibold mt-0.5">
                  <span>0%</span><span>25%</span><span>50%</span>
                </div>
                @if (plan.discountPct > 0 && plan.id !== 'free') {
                  <div class="mt-2 pt-2 border-t border-amber-200 text-xs font-semibold text-amber-800">
                    Finale: <strong>€{{ discountedPrice(plan.priceMonthly, plan.discountPct) }}/mese</strong>
                    · <strong>€{{ discountedPrice(plan.priceYearly, plan.discountPct) }}/anno</strong>
                  </div>
                }
              </div>

              <ul class="space-y-1.5">
                @for (f of plan.features; track f) {
                  <li class="flex items-center gap-1.5 text-xs text-slate-600">
                    <svg class="w-3 h-3 text-tc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>{{ f }}
                  </li>
                }
              </ul>
            </div>

            <div class="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Studi</p>
                  <p class="text-sm font-extrabold text-slate-800">{{ studioCountForPlan(plan.id) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">SMS/mese</p>
                  <p class="text-sm font-extrabold text-slate-800">{{ plan.smsPerMonth.toLocaleString('it-IT') }}</p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Revenue summary -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 class="font-extrabold text-slate-800 mb-4">Riepilogo ricavi stimati (mensile)</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          @for (plan of editablePlans(); track plan.id) {
            <div class="bg-slate-50 rounded-2xl px-4 py-3">
              <p class="text-xs font-bold text-slate-400 mb-0.5">{{ plan.name }}</p>
              <p class="text-lg font-extrabold text-slate-900">
                €{{ (discountedPrice(plan.priceMonthly, plan.discountPct) * studioCountForPlan(plan.id)).toLocaleString('it-IT') }}
              </p>
              <p class="text-xs text-slate-400">{{ studioCountForPlan(plan.id) }} studi</p>
            </div>
          }
        </div>
        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p class="text-sm font-bold text-slate-600">Totale stimato mensile</p>
          <p class="text-xl font-extrabold text-slate-900">€{{ totalRevenue().toLocaleString('it-IT') }}</p>
        </div>
      </div>
    </div>
  `,
})
export class PlansComponent {
  readonly saved = signal(false);
  private _plans = signal<EditablePlan[]>(
    PLANS.map(p => ({ ...p, discountPct: 0 }))
  );
  readonly editablePlans = this._plans.asReadonly();

  private readonly studioCounts: Record<string, number> = {
    free: 14, starter: 32, professional: 67, business: 14,
  };

  studioCountForPlan(planId: string): number { return this.studioCounts[planId] ?? 0; }

  discountedPrice(price: number, pct: number): number {
    return pct === 0 ? price : Math.round(price * (1 - pct / 100));
  }

  readonly totalRevenue = computed(() =>
    this.editablePlans().reduce((sum, p) =>
      sum + this.discountedPrice(p.priceMonthly, p.discountPct) * this.studioCountForPlan(p.id), 0
    )
  );

  saveAll(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
