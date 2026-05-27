import { Component, signal } from '@angular/core';
import { PLANS, Plan, PlanType } from '../../core/models/plan.model';

// Mock current subscription (in production: from backend)
const CURRENT_PLAN: PlanType = 'professional';
const MOCK_SUBSCRIPTION = {
  plan: CURRENT_PLAN,
  startDate: '2026-01-15',
  nextRenewal: '2026-07-15',
  billing: 'yearly' as 'monthly' | 'yearly',
  paymentMethod: { type: 'card', last4: '4242', brand: 'Visa', expiry: '12/27' },
  autoRenew: true,
  invoiceEmail: 'info@studiorossi.it',
  invoices: [
    { id: 'INV-2026-001', date: '2026-01-15', amount: 790, plan: 'Professional Annuale', status: 'pagata' },
    { id: 'INV-2025-012', date: '2025-01-15', amount: 790, plan: 'Professional Annuale', status: 'pagata' },
  ],
};

@Component({
  selector: 'app-subscription-status',
  standalone: true,
  template: `
    <div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

      <!-- Page header -->
      <div>
        <h1 class="text-xl font-extrabold text-slate-900">Stato Abbonamento</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gestisci il tuo piano, metodo di pagamento e fatture.</p>
      </div>

      <!-- Plan card -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Piano attivo</p>
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-black text-slate-900">{{ currentPlan().name }}</h2>
              <span class="px-2.5 py-1 rounded-full text-xs font-extrabold text-white"
                    style="background-color: var(--brand)">
                ATTIVO
              </span>
            </div>
          </div>
          <button (click)="showPlanPicker.set(true)"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all
                         hover:opacity-90 active:scale-95"
                  style="background-color: var(--brand)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Cambia piano
          </button>
        </div>

        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-50 rounded-2xl px-4 py-3">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prezzo</p>
            <p class="text-xl font-black text-slate-900">
              {{ sub.billing === 'yearly' ? currentPlan().priceYearly : currentPlan().priceMonthly }}€
              <span class="text-xs font-semibold text-slate-400">/ {{ sub.billing === 'yearly' ? 'anno' : 'mese' }}</span>
            </p>
          </div>
          <div class="bg-slate-50 rounded-2xl px-4 py-3">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rinnovo</p>
            <p class="text-sm font-extrabold text-slate-800">{{ formatDate(sub.nextRenewal) }}</p>
            <p class="text-xs text-slate-400">{{ sub.autoRenew ? 'Rinnovo automatico attivo' : 'Rinnovo manuale' }}</p>
          </div>
          <div class="bg-slate-50 rounded-2xl px-4 py-3">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attivo dal</p>
            <p class="text-sm font-extrabold text-slate-800">{{ formatDate(sub.startDate) }}</p>
          </div>
          <div class="bg-slate-50 rounded-2xl px-4 py-3">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medici inclusi</p>
            <p class="text-sm font-extrabold text-slate-800">
              {{ currentPlan().maxDoctors === null ? 'Illimitati' : 'Fino a ' + currentPlan().maxDoctors }}
            </p>
          </div>
        </div>

        <!-- Features -->
        <div class="px-6 pb-6">
          <p class="text-xs font-bold text-slate-500 mb-3">Funzionalità incluse nel piano:</p>
          <div class="flex flex-wrap gap-2">
            @for (f of currentPlan().features; track f) {
              <span class="flex items-center gap-1.5 px-3 py-1.5 bg-tc-50 text-tc-700 rounded-xl text-xs font-semibold">
                <svg class="w-3.5 h-3.5 text-tc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {{ f }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Payment method -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h3 class="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          Metodo di pagamento
        </h3>
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-white text-[9px] font-black tracking-widest">VISA</span>
          </div>
          <div>
            <p class="text-sm font-extrabold text-slate-800">•••• •••• •••• {{ sub.paymentMethod.last4 }}</p>
            <p class="text-xs text-slate-400">Scadenza {{ sub.paymentMethod.expiry }}</p>
          </div>
          <button class="ml-auto text-xs font-semibold text-tc-600 hover:underline flex-shrink-0">Modifica</button>
        </div>
        <p class="text-xs text-slate-400 mt-3">Fatture inviate a: <strong>{{ sub.invoiceEmail }}</strong></p>
      </div>

      <!-- Invoices -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="font-extrabold text-slate-800">Storico fatture</h3>
        </div>
        <div class="divide-y divide-slate-100">
          @for (inv of sub.invoices; track inv.id) {
            <div class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-800">{{ inv.plan }}</p>
                <p class="text-xs text-slate-400">{{ formatDate(inv.date) }} · {{ inv.id }}</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex-shrink-0">
                {{ inv.amount }}€
              </span>
              <button class="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0" title="Scarica PDF">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Plan picker modal -->
    @if (showPlanPicker()) {
      <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" (click)="showPlanPicker.set(false)">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h2 class="font-extrabold text-slate-900">Scegli il tuo piano</h2>
              <p class="text-xs text-slate-500 mt-0.5">Cambia in qualsiasi momento, senza penali</p>
            </div>
            <button (click)="showPlanPicker.set(false)"
                    class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Billing toggle -->
          <div class="flex items-center justify-center gap-3 pt-5 pb-2">
            <span class="text-sm font-semibold" [class]="billing() === 'monthly' ? 'text-slate-900' : 'text-slate-400'">Mensile</span>
            <button (click)="toggleBilling()"
                    class="relative w-12 h-6 rounded-full transition-colors duration-300"
                    [class]="billing() === 'yearly' ? 'bg-tc-500' : 'bg-slate-300'">
              <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
                    [class]="billing() === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'"></span>
            </button>
            <span class="text-sm font-semibold" [class]="billing() === 'yearly' ? 'text-slate-900' : 'text-slate-400'">Annuale</span>
            <span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Risparmia 2 mesi!</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
            @for (plan of plans; track plan.id) {
              <div class="relative rounded-2xl border-2 p-5 transition-all cursor-pointer"
                   [class]="plan.id === sub.plan
                     ? 'border-tc-400 bg-tc-50'
                     : selectedPlan() === plan.id
                       ? 'border-indigo-400 bg-indigo-50'
                       : 'border-slate-200 hover:border-tc-300'"
                   (click)="selectedPlan.set(plan.id)">
                @if (plan.badge) {
                  <span class="absolute -top-2.5 left-4 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white"
                        style="background-color: var(--brand)">{{ plan.badge }}</span>
                }
                <div class="flex items-start justify-between mb-3">
                  <h3 class="font-extrabold text-slate-900">{{ plan.name }}</h3>
                  @if (plan.id === sub.plan) {
                    <span class="text-[10px] font-bold bg-tc-100 text-tc-700 px-2 py-0.5 rounded-full">Attuale</span>
                  }
                </div>
                <div class="mb-4">
                  <span class="text-3xl font-black text-slate-900">
                    {{ billing() === 'yearly' ? plan.priceYearly : plan.priceMonthly }}€
                  </span>
                  <span class="text-xs text-slate-400 ml-1">/ {{ billing() === 'yearly' ? 'anno' : 'mese' }}</span>
                </div>
                <ul class="space-y-1.5">
                  @for (f of plan.features; track f) {
                    <li class="flex items-center gap-2 text-xs text-slate-600">
                      <svg class="w-3.5 h-3.5 text-tc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      {{ f }}
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <div class="px-6 pb-6 flex gap-3">
            <button (click)="showPlanPicker.set(false)"
                    class="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Annulla
            </button>
            <button (click)="confirmPlanChange()"
                    class="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white transition-all hover:opacity-90"
                    style="background-color: var(--brand)"
                    [disabled]="selectedPlan() === sub.plan || !selectedPlan()">
              {{ selectedPlan() && selectedPlan() !== sub.plan ? 'Conferma cambio piano' : 'Piano già selezionato' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SubscriptionStatusComponent {
  readonly plans = PLANS;
  readonly sub = MOCK_SUBSCRIPTION;
  readonly showPlanPicker = signal(false);
  readonly billing = signal<'monthly' | 'yearly'>(this.sub.billing);
  readonly selectedPlan = signal<PlanType | null>(null);

  readonly currentPlan = () => PLANS.find(p => p.id === this.sub.plan) ?? PLANS[2];

  toggleBilling(): void { this.billing.update(b => b === 'monthly' ? 'yearly' : 'monthly'); }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  confirmPlanChange(): void {
    if (!this.selectedPlan() || this.selectedPlan() === this.sub.plan) return;
    // In production: call API
    alert(`Cambio piano a "${PLANS.find(p => p.id === this.selectedPlan())?.name}" confermato! (Demo: nessuna modifica reale)`);
    this.showPlanPicker.set(false);
  }
}
