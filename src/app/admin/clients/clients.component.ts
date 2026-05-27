import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { Studio } from '../../core/models/studio.model';

const PLAN_COLORS: Record<string, string> = {
  free:         'bg-slate-100 text-slate-600',
  starter:      'bg-sky-100 text-sky-700',
  professional: 'bg-tc-100 text-tc-700',
  business:     'bg-violet-100 text-violet-700',
};

const STATUS_COLORS: Record<string, string> = {
  attivo:  'bg-emerald-100 text-emerald-700',
  sospeso: 'bg-rose-100 text-rose-700',
  prova:   'bg-amber-100 text-amber-700',
};

// Private notes — stored in memory (admin-only, never shown to client)
const adminNotes: Record<string, string> = {};

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">Studi clienti</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ filtered().length }} studi su {{ studios().length }} totali</p>
        </div>
        <a routerLink="/admin/nuovo-studio"
           class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all hover:opacity-90"
           style="background-color: var(--brand)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Crea studio
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" class="tc-input-sm pl-9 w-full" placeholder="Cerca studio..." [(ngModel)]="searchQuery">
          </div>
          <select class="tc-select" [(ngModel)]="filterStatus">
            <option value="">Tutti gli stati</option>
            <option value="attivo">Attivi</option>
            <option value="sospeso">Sospesi</option>
            <option value="prova">In prova</option>
          </select>
          <select class="tc-select" [(ngModel)]="filterPlan">
            <option value="">Tutti i piani</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <!-- Studios list -->
      <div class="space-y-3">
        @for (s of filtered(); track s.id) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

            <!-- Row -->
            <div class="flex items-center gap-4 p-4 sm:p-5">
              <!-- Avatar -->
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                   [style.background-color]="s.primaryColor">
                {{ s.name.charAt(0) }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-0.5">
                  <p class="font-extrabold text-slate-900 text-sm truncate">{{ s.name }}</p>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full" [class]="planColor(s.plan)">
                    {{ s.plan.toUpperCase() }}
                  </span>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full" [class]="statusColor(s.status)">
                    {{ s.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 truncate">{{ s.address }} · {{ s.phone }}</p>

                <!-- SMS usage bar -->
                <div class="mt-2 hidden sm:block">
                  <div class="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>SMS: {{ s.smsUsedThisMonth }}/{{ s.smsLimit }}</span>
                    <span>{{ smsPercent(s) }}%</span>
                  </div>
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                         [class]="smsPercent(s) > 80 ? 'bg-rose-400' : smsPercent(s) > 60 ? 'bg-amber-400' : 'bg-emerald-400'"
                         [style.width]="smsPercent(s) + '%'"></div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <!-- Impersonate -->
                <button (click)="impersonate(s)"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                               bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                        title="Accedi come questo studio">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  <span class="hidden sm:inline">Entra</span>
                </button>
                <!-- Expand -->
                <button (click)="toggleExpand(s.id)"
                        class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4 text-slate-500 transition-transform"
                       [class]="expanded() === s.id ? 'rotate-180' : ''"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Expanded detail -->
            @if (expanded() === s.id) {
              <div class="border-t border-slate-100 p-5 bg-slate-50 space-y-5">

                <!-- Stats row -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Medici</p>
                    <p class="text-lg font-extrabold text-slate-900">{{ s.doctorCount }}</p>
                  </div>
                  <div class="bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Creato</p>
                    <p class="text-xs font-extrabold text-slate-700">{{ formatDate(s.createdAt) }}</p>
                  </div>
                  <div class="bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Scadenza piano</p>
                    <p class="text-xs font-extrabold text-slate-700">{{ formatDate(s.planExpiry) }}</p>
                  </div>
                  <div class="bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Slug</p>
                    <p class="text-xs font-mono font-extrabold text-slate-700">{{ s.slug }}</p>
                  </div>
                </div>

                <!-- Analytics mock -->
                <div class="bg-white rounded-2xl border border-slate-200 p-4">
                  <p class="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-3">Attività ultimi 7 giorni</p>
                  <div class="flex items-end gap-1 h-16">
                    @for (v of activityData(s); track $index) {
                      <div class="flex-1 rounded-t-sm transition-all" [style.height]="v + '%'"
                           style="background-color: var(--brand); opacity: 0.7"></div>
                    }
                  </div>
                  <div class="flex justify-between text-[9px] text-slate-300 mt-1">
                    <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
                  </div>
                </div>

                <!-- Private notes (admin only) -->
                <div>
                  <label class="block text-xs font-extrabold text-slate-500 mb-1.5">
                    🔒 Note private (visibili solo all'Admin)
                  </label>
                  <textarea [value]="getNotes(s.id)"
                            (blur)="saveNotes(s.id, $any($event.target).value)"
                            rows="3" placeholder="Aggiungi note interne su questo cliente..."
                            class="tc-input-sm w-full resize-none text-xs"></textarea>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 flex-wrap">
                  <button (click)="impersonate(s)"
                          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    Accedi come studio (Manutenzione)
                  </button>
                  <a [href]="'/p/' + s.slug" target="_blank"
                     class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Visita sito paziente
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>

    </div>

    <!-- Impersonate confirmation modal -->
    @if (impersonateTarget()) {
      <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
           (click)="impersonateTarget.set(null)">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" (click)="$event.stopPropagation()">
          <div class="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 class="font-extrabold text-slate-900 text-lg mb-1">Accesso manutenzione</h2>
          <p class="text-sm text-slate-500 mb-2">
            Stai per accedere all'ambiente di <strong>{{ impersonateTarget()?.name }}</strong>.
          </p>
          <div class="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5">
            <p class="text-xs font-semibold text-amber-700">
              ⚠️ Verrà inviata automaticamente un'email al cliente per notificare l'accesso di manutenzione.
            </p>
          </div>
          <div class="bg-slate-50 rounded-xl px-4 py-3 mb-5 text-xs font-mono text-slate-600">
            Email automatica → <strong>info&#64;{{ impersonateTarget()?.slug }}.it</strong><br>
            "Il servizio assistenza è entrato nel vostro ambiente per fare manutenzione.
            In questi minuti non si garantisce il corretto funzionamento della piattaforma."
          </div>
          <div class="flex gap-3">
            <button (click)="impersonateTarget.set(null)"
                    class="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Annulla
            </button>
            <button (click)="confirmImpersonate()"
                    class="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white"
                    style="background-color: var(--brand)">
              Conferma accesso
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ClientsComponent {
  private mockData = inject(MockDataService);

  searchQuery  = '';
  filterStatus = '';
  filterPlan   = '';

  readonly studios  = this.mockData.studios;
  readonly expanded = signal<string | null>(null);
  readonly impersonateTarget = signal<Studio | null>(null);

  readonly filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.studios().filter(s => {
      const matchQuery  = !q || s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || s.status === this.filterStatus;
      const matchPlan   = !this.filterPlan   || s.plan   === this.filterPlan;
      return matchQuery && matchStatus && matchPlan;
    });
  });

  planColor(plan: string): string   { return PLAN_COLORS[plan]   ?? 'bg-slate-100 text-slate-600'; }
  statusColor(status: string): string { return STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'; }
  smsPercent(s: Studio): number { return Math.round((s.smsUsedThisMonth / s.smsLimit) * 100); }

  toggleExpand(id: string): void {
    this.expanded.update(v => v === id ? null : id);
  }

  formatDate(d: Date): string {
    return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  activityData(s: Studio): number[] {
    // Deterministic mock based on studio id
    const seed = s.id.charCodeAt(0);
    return Array.from({ length: 7 }, (_, i) => Math.round(30 + ((seed * (i + 1) * 17) % 70)));
  }

  getNotes(id: string): string { return adminNotes[id] ?? ''; }
  saveNotes(id: string, text: string): void { adminNotes[id] = text; }

  impersonate(s: Studio): void { this.impersonateTarget.set(s); }

  confirmImpersonate(): void {
    // In production: send notification email + switch session
    alert(`✅ Email di notifica inviata a ${this.impersonateTarget()?.name}. Reindirizzamento all'ambiente studio... (Demo)`);
    this.impersonateTarget.set(null);
  }
}
