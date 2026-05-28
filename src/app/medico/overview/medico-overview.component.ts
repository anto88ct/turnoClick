import { Component, inject, computed, signal } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';
import { DoctorStatusType } from '../../core/models/doctor-hub.model';
import { REQUEST_TYPE_LABELS } from '../../core/models/booking.model';

@Component({
  selector: 'app-medico-overview',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col min-h-[calc(100dvh-6.5rem)] bg-slate-50">

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- TOP AREA — azioni + paziente corrente (sempre visibile)       -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm px-4 pt-4 pb-5 max-w-xl mx-auto w-full">

        <!-- Paziente in corso (se in visita) -->
        @if (activePatient()) {
          <div class="mb-4 rounded-2xl overflow-hidden border-2 border-amber-200"
               style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)">
            <div class="px-4 py-3 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider leading-none">Paziente in visita</p>
                <p class="text-base font-extrabold text-amber-900 leading-tight truncate mt-0.5">{{ activePatient()!.patientName }}</p>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                    {{ getLabel(activePatient()!.requestType) }}
                  </span>
                  @if (myRoom()) {
                    <span class="text-xs text-amber-700 font-semibold flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      {{ myRoom() }}
                    </span>
                  }
                  <span class="text-xs text-amber-500 font-semibold">{{ getVisitElapsed() }}</span>
                </div>
              </div>
              <div class="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            </div>
          </div>
        } @else {
          <!-- No active visit — next patient preview -->
          @if (nextPatient()) {
            <div class="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Prossimo paziente</p>
                <p class="text-sm font-extrabold text-slate-800 truncate mt-0.5">{{ nextPatient()!.patientName }}</p>
                <p class="text-xs text-slate-500">{{ getLabel(nextPatient()!.requestType) }} · {{ formatTime(nextPatient()!.estimatedStartAt) }}</p>
              </div>
            </div>
          }
        }

        <!-- "Avanti il prossimo" — CTA principale -->
        <button (click)="callNext()"
                class="w-full py-4 rounded-2xl font-extrabold text-base text-white
                       flex items-center justify-center gap-2.5 mb-3
                       transition-all duration-200 active:scale-95 select-none"
                style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                       box-shadow: 0 6px 20px rgba(34,197,94,0.30)">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
          Avanti il prossimo
        </button>

        <!-- Status macro-buttons grid -->
        <div class="grid grid-cols-2 gap-2.5">

          <!-- Disponibile -->
          <button (click)="setStatus('disponibile')"
                  class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'disponibile'
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                 [class]="currentStatus()?.status === 'disponibile' ? 'bg-emerald-200' : 'bg-slate-100'">
              <svg class="w-5 h-5" [class]="currentStatus()?.status === 'disponibile' ? 'text-emerald-700' : 'text-slate-400'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold"
                  [class]="currentStatus()?.status === 'disponibile' ? 'text-emerald-700' : 'text-slate-600'">
              Disponibile
            </span>
          </button>

          <!-- In visita -->
          <button (click)="setStatus('in_visita')"
                  class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'in_visita'
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40'">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                 [class]="currentStatus()?.status === 'in_visita' ? 'bg-amber-200' : 'bg-slate-100'">
              <svg class="w-5 h-5" [class]="currentStatus()?.status === 'in_visita' ? 'text-amber-700' : 'text-slate-400'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold"
                  [class]="currentStatus()?.status === 'in_visita' ? 'text-amber-700' : 'text-slate-600'">
              In visita
            </span>
          </button>

          <!-- Sto per finire -->
          <button (click)="setStatus('quasi_finito')"
                  class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'quasi_finito'
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                 [class]="currentStatus()?.status === 'quasi_finito' ? 'bg-orange-200' : 'bg-slate-100'">
              <svg class="w-5 h-5" [class]="currentStatus()?.status === 'quasi_finito' ? 'text-orange-700' : 'text-slate-400'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold"
                  [class]="currentStatus()?.status === 'quasi_finito' ? 'text-orange-700' : 'text-slate-600'">
              Sto per finire
            </span>
          </button>

          <!-- Ho terminato -->
          <button (click)="setStatus('terminato')"
                  class="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'terminato'
                    ? 'border-slate-400 bg-slate-100'
                    : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                 [class]="currentStatus()?.status === 'terminato' ? 'bg-slate-300' : 'bg-slate-100'">
              <svg class="w-5 h-5" [class]="currentStatus()?.status === 'terminato' ? 'text-slate-700' : 'text-slate-400'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold"
                  [class]="currentStatus()?.status === 'terminato' ? 'text-slate-700' : 'text-slate-600'">
              Ho terminato
            </span>
          </button>
        </div>

        <!-- Feedback toast -->
        @if (calledNext()) {
          <div class="mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
            <p class="text-xs font-bold text-emerald-700">
              Prossimo paziente chiamato — notifica inviata alla segreteria ✓
            </p>
          </div>
        }
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- BOTTOM AREA — statistiche + colleghi (scrollabile)            -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4 max-w-xl mx-auto w-full">

        <!-- Queue summary chips -->
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-3 py-3 text-center">
            <p class="text-2xl font-extrabold text-amber-500">{{ myWaiting() }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">In attesa</p>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-3 py-3 text-center">
            <p class="text-2xl font-extrabold text-slate-900">{{ myCompleted() }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Completate</p>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-3 py-3 text-center">
            <p class="text-2xl font-extrabold text-indigo-600">~{{ avgWaitMin() }}'</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Media/visita</p>
          </div>
        </div>

        <!-- Pazienti in coda per questo medico -->
        @if (myQueue().length > 0) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p class="text-xs font-extrabold text-slate-600 uppercase tracking-wide">La mia coda</p>
              <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold">
                {{ myWaiting() }}
              </span>
            </div>
            <div class="divide-y divide-slate-100">
              @for (b of myQueue(); track b.id; let i = $index) {
                @if (b.status === 'in_attesa') {
                  <div class="flex items-center gap-3 px-4 py-3">
                    <div class="w-6 h-6 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-700 text-[10px] font-extrabold
                                flex items-center justify-center flex-shrink-0">
                      {{ i + 1 }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800 truncate">{{ b.patientName }}</p>
                      <p class="text-xs text-slate-400">{{ getLabel(b.requestType) }} · {{ formatTime(b.estimatedStartAt) }}</p>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- Colleghi in studio -->
        @if (colleagues().length > 0) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p class="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Colleghi in studio</p>
            <div class="space-y-3">
              @for (doc of colleagues(); track doc.id) {
                <div class="flex items-center gap-3">
                  <div class="relative flex-shrink-0">
                    <img [src]="doc.photoUrl" [alt]="doc.name" class="w-9 h-9 rounded-xl object-cover">
                    <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                          [class]="getDoctorStatusDot(doc.id)"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-800 truncate">{{ doc.name }}</p>
                    <p class="text-[10px] text-slate-400">{{ doc.room ?? '' }}</p>
                  </div>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0" [class]="getDoctorStatusBadge(doc.id)">
                    {{ getDoctorStatusShort(doc.id) }}
                  </span>
                </div>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `,
})
export class MedicoOverviewComponent {
  private readonly mockData = inject(MockDataService);

  readonly doctors        = this.mockData.doctors;
  readonly activeDoctorId = this.mockData.activeDoctorId;
  readonly calledNext     = signal(false);

  readonly currentStatus = computed(() =>
    this.mockData.getDoctorStatus(this.activeDoctorId())
  );

  readonly myQueue = computed(() =>
    this.mockData.activeQueue()
      .filter(b => b.doctorId === this.activeDoctorId())
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  );

  readonly activePatient = computed(() =>
    this.myQueue().find(b => b.status === 'in_corso')
  );

  readonly nextPatient = computed(() =>
    this.myQueue().find(b => b.status === 'in_attesa')
  );

  readonly colleagues = computed(() =>
    this.doctors().filter(d => d.id !== this.activeDoctorId())
  );

  readonly myRoom = computed(() =>
    this.doctors().find(d => d.id === this.activeDoctorId())?.room ?? null
  );

  readonly myWaiting   = computed(() => this.myQueue().filter(b => b.status === 'in_attesa').length);
  readonly myCompleted = computed(() =>
    this.mockData.historyBookings().filter((b: any) =>
      b.doctorId === this.activeDoctorId() && b.status === 'completata'
    ).length
  );
  readonly avgWaitMin = computed(() => {
    const doc = this.doctors().find(d => d.id === this.activeDoctorId());
    return doc?.avgVisitMinutes ?? 15;
  });

  // ── Status actions ─────────────────────────────────────────────────────────

  setStatus(status: DoctorStatusType): void {
    const active = this.myQueue().find(b => b.status === 'in_corso');
    this.mockData.setDoctorStatus(this.activeDoctorId(), status, active?.patientName);
  }

  callNext(): void {
    this.setStatus('disponibile');
    this.calledNext.set(true);
    setTimeout(() => this.calledNext.set(false), 3000);
  }

  // ── Helper: visit elapsed time ──────────────────────────────────────────────

  getVisitElapsed(): string {
    const st = this.currentStatus();
    if (!st?.updatedAt) return '';
    const mins = Math.floor((Date.now() - st.updatedAt.getTime()) / 60000);
    if (mins < 1) return 'appena iniziata';
    return `${mins} min in corso`;
  }

  // ── Colleague status helpers ────────────────────────────────────────────────

  getDoctorStatusDot(docId: string): string {
    const s = this.mockData.getDoctorStatus(docId)?.status;
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-400', in_visita: 'bg-amber-400',
      quasi_finito: 'bg-orange-400', terminato: 'bg-slate-300', assente: 'bg-rose-400',
    };
    return map[s ?? ''] ?? 'bg-slate-300';
  }

  getDoctorStatusBadge(docId: string): string {
    const s = this.mockData.getDoctorStatus(docId)?.status;
    const map: Record<string, string> = {
      disponibile: 'bg-emerald-100 text-emerald-700', in_visita: 'bg-amber-100 text-amber-700',
      quasi_finito: 'bg-orange-100 text-orange-700', terminato: 'bg-slate-100 text-slate-600',
      assente: 'bg-rose-100 text-rose-700',
    };
    return map[s ?? ''] ?? 'bg-slate-100 text-slate-600';
  }

  getDoctorStatusShort(docId: string): string {
    const s = this.mockData.getDoctorStatus(docId)?.status;
    const map: Record<string, string> = {
      disponibile: 'Libero', in_visita: 'In visita',
      quasi_finito: 'Quasi finito', terminato: 'Terminato', assente: 'Assente',
    };
    return map[s ?? ''] ?? 'N/D';
  }

  // ── Formatting ──────────────────────────────────────────────────────────────

  getLabel(type: string): string {
    return (REQUEST_TYPE_LABELS as Record<string, string>)[type] ?? type;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
}
