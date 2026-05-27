import { Component, inject, computed, signal } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';
import { DoctorStatusType } from '../../core/models/doctor-hub.model';

@Component({
  selector: 'app-medico-overview',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col min-h-[calc(100dvh-6.5rem)] bg-slate-50">

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- TOP AREA — Current status hero + colleague status             -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="flex-1 overflow-y-auto px-4 pt-5 pb-4 space-y-4 max-w-xl mx-auto w-full">

        <!-- Current status hero card -->
        <div class="rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-300"
             [class]="statusCardClass()">
          <div class="px-5 py-4 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                 [class]="statusIconBg()">
              {{ statusEmoji() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-extrabold text-slate-700 leading-tight">{{ currentStatusLabel() }}</p>
              @if (currentStatus()?.patientName) {
                <p class="text-xs text-slate-500 mt-0.5">👤 {{ currentStatus()?.patientName }}</p>
              }
              <p class="text-xs text-slate-400 mt-0.5">Aggiornato {{ formatRelative(currentStatus()?.updatedAt) }}</p>
            </div>
            <!-- Live indicator -->
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full animate-pulse" [class]="statusDot()"></div>
                <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">LIVE</span>
              </div>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full" [class]="statusBadgeClass()">
                {{ statusShort() }}
              </span>
            </div>
          </div>

          <!-- Waiting count bar -->
          @if (nextPatient()) {
            <div class="px-5 py-3 border-t flex items-center gap-3" [class]="statusSubBarClass()">
              <svg class="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-700">Prossimo: <strong>{{ nextPatient()?.patientName }}</strong></p>
                <p class="text-xs text-slate-400">{{ nextPatient()?.requestType }} · {{ formatTime(nextPatient()!.estimatedStartAt) }}</p>
              </div>
            </div>
          }
        </div>

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
            <p class="text-2xl font-extrabold text-tc-600">~{{ avgWaitMin() }}'</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Media/visita</p>
          </div>
        </div>

        <!-- Colleagues status (compact) -->
        @if (colleagues().length > 0) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Colleghi in studio</p>
            <div class="space-y-2">
              @for (doc of colleagues(); track doc.id) {
                <div class="flex items-center gap-3">
                  <div class="relative flex-shrink-0">
                    <img [src]="doc.photoUrl" [alt]="doc.name" class="w-8 h-8 rounded-full object-cover">
                    <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                          [class]="getDoctorStatusDot(doc.id)"></span>
                  </div>
                  <p class="text-xs font-semibold text-slate-700 flex-1 truncate">{{ doc.name }}</p>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full" [class]="getDoctorStatusBadge(doc.id)">
                    {{ getDoctorStatusLabel(doc.id) }}
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Spacer so content scrolls above the fixed buttons -->
        <div class="h-4"></div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- BOTTOM AREA — THUMB ZONE — action buttons                     -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="flex-shrink-0 bg-white border-t border-slate-200 px-4 pt-4 pb-6 max-w-xl mx-auto w-full">

        <!-- "Avanti il prossimo" — primary CTA (large, green) -->
        <button (click)="callNext()"
                class="w-full py-5 rounded-3xl font-extrabold text-lg text-white
                       flex items-center justify-center gap-3 mb-4
                       transition-all duration-200 active:scale-95 select-none"
                style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                       box-shadow: 0 8px 24px rgba(34,197,94,0.35)">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
          Avanti il prossimo
        </button>

        <!-- Status macro-buttons grid -->
        <div class="grid grid-cols-2 gap-3">

          <!-- Disponibile -->
          <button (click)="setStatus('disponibile')"
                  class="flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'disponibile'
                    ? 'border-emerald-400 bg-emerald-50 shadow-emerald-100 shadow-md'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                 [class]="currentStatus()?.status === 'disponibile' ? 'bg-emerald-100' : 'bg-slate-100'">
              <svg class="w-6 h-6" [class]="currentStatus()?.status === 'disponibile' ? 'text-emerald-600' : 'text-slate-500'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold leading-tight"
                  [class]="currentStatus()?.status === 'disponibile' ? 'text-emerald-700' : 'text-slate-600'">
              Disponibile
            </span>
          </button>

          <!-- In visita -->
          <button (click)="setStatus('in_visita')"
                  class="flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'in_visita'
                    ? 'border-amber-400 bg-amber-50 shadow-amber-100 shadow-md'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                 [class]="currentStatus()?.status === 'in_visita' ? 'bg-amber-100' : 'bg-slate-100'">
              <svg class="w-6 h-6" [class]="currentStatus()?.status === 'in_visita' ? 'text-amber-600' : 'text-slate-500'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold leading-tight"
                  [class]="currentStatus()?.status === 'in_visita' ? 'text-amber-700' : 'text-slate-600'">
              In visita
            </span>
          </button>

          <!-- Quasi finito -->
          <button (click)="setStatus('quasi_finito')"
                  class="flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'quasi_finito'
                    ? 'border-orange-400 bg-orange-50 shadow-orange-100 shadow-md'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                 [class]="currentStatus()?.status === 'quasi_finito' ? 'bg-orange-100' : 'bg-slate-100'">
              <svg class="w-6 h-6" [class]="currentStatus()?.status === 'quasi_finito' ? 'text-orange-600' : 'text-slate-500'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold leading-tight"
                  [class]="currentStatus()?.status === 'quasi_finito' ? 'text-orange-700' : 'text-slate-600'">
              Sto per finire
            </span>
          </button>

          <!-- Terminato -->
          <button (click)="setStatus('terminato')"
                  class="flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all duration-150 active:scale-95 select-none"
                  [class]="currentStatus()?.status === 'terminato'
                    ? 'border-slate-400 bg-slate-100 shadow-slate-200 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                 [class]="currentStatus()?.status === 'terminato' ? 'bg-slate-200' : 'bg-slate-100'">
              <svg class="w-6 h-6" [class]="currentStatus()?.status === 'terminato' ? 'text-slate-700' : 'text-slate-500'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-sm font-extrabold leading-tight"
                  [class]="currentStatus()?.status === 'terminato' ? 'text-slate-700' : 'text-slate-600'">
              Ho terminato
            </span>
          </button>
        </div>

        <!-- "Call next" feedback toast -->
        @if (calledNext()) {
          <div class="mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></div>
            <p class="text-xs font-bold text-emerald-700">
              Prossimo paziente chiamato — notifica inviata alla segreteria ✓
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class MedicoOverviewComponent {
  private readonly mockData = inject(MockDataService);

  readonly doctors         = this.mockData.doctors;
  readonly activeDoctorId  = this.mockData.activeDoctorId;
  readonly calledNext      = signal(false);

  readonly currentStatus = computed(() =>
    this.mockData.getDoctorStatus(this.activeDoctorId())
  );

  readonly myQueue = computed(() =>
    this.mockData.activeQueue()
      .filter(b => b.doctorId === this.activeDoctorId())
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  );

  readonly nextPatient = computed(() =>
    this.myQueue().find(b => b.status === 'in_attesa')
  );

  readonly colleagues = computed(() =>
    this.doctors().filter(d => d.id !== this.activeDoctorId())
  );

  readonly myWaiting   = computed(() => this.myQueue().filter(b => b.status === 'in_attesa').length);
  readonly myCompleted = computed(() => this.mockData.historyBookings().filter((b: any) => b.doctorId === this.activeDoctorId() && b.status === 'completata').length);
  readonly avgWaitMin  = computed(() => {
    const doc = this.doctors().find(d => d.id === this.activeDoctorId());
    return doc?.avgVisitMinutes ?? 15;
  });

  // ── Status actions ────────────────────────────────────────────────────────

  setStatus(status: DoctorStatusType): void {
    const active = this.myQueue().find(b => b.status === 'in_corso');
    this.mockData.setDoctorStatus(this.activeDoctorId(), status, active?.patientName);
  }

  callNext(): void {
    this.setStatus('disponibile');
    this.calledNext.set(true);
    // Auto-hide feedback after 3s
    setTimeout(() => this.calledNext.set(false), 3000);
  }

  // ── Computed style helpers ────────────────────────────────────────────────

  readonly statusCardClass = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return {
      disponibile:  'border-emerald-200 bg-emerald-50/60',
      in_visita:    'border-amber-200 bg-amber-50/60',
      quasi_finito: 'border-orange-200 bg-orange-50/60',
      terminato:    'border-slate-200 bg-slate-50/60',
      assente:      'border-rose-200 bg-rose-50/60',
    }[s] ?? 'border-slate-200 bg-white';
  });

  readonly statusSubBarClass = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return {
      disponibile:  'border-emerald-100 bg-emerald-50',
      in_visita:    'border-amber-100 bg-amber-50',
      quasi_finito: 'border-orange-100 bg-orange-50',
      terminato:    'border-slate-100 bg-slate-50',
      assente:      'border-rose-100 bg-rose-50',
    }[s] ?? 'border-slate-100 bg-slate-50';
  });

  readonly statusIconBg = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return {
      disponibile:  'bg-emerald-100',
      in_visita:    'bg-amber-100',
      quasi_finito: 'bg-orange-100',
      terminato:    'bg-slate-100',
      assente:      'bg-rose-100',
    }[s] ?? 'bg-slate-100';
  });

  readonly statusEmoji = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return { disponibile: '✅', in_visita: '👨‍⚕️', quasi_finito: '⏱️', terminato: '✔️', assente: '🔴' }[s] ?? '✅';
  });

  readonly statusDot = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return { disponibile: 'bg-emerald-500', in_visita: 'bg-amber-500', quasi_finito: 'bg-orange-500', terminato: 'bg-slate-400', assente: 'bg-rose-500' }[s] ?? 'bg-emerald-500';
  });

  readonly statusBadgeClass = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return { disponibile: 'bg-emerald-100 text-emerald-700', in_visita: 'bg-amber-100 text-amber-700', quasi_finito: 'bg-orange-100 text-orange-700', terminato: 'bg-slate-100 text-slate-600', assente: 'bg-rose-100 text-rose-700' }[s] ?? 'bg-slate-100 text-slate-600';
  });

  readonly statusShort = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return { disponibile: 'Libero', in_visita: 'In visita', quasi_finito: 'Quasi finito', terminato: 'Terminato', assente: 'Assente' }[s] ?? 'N/D';
  });

  readonly currentStatusLabel = computed(() => {
    const s = this.currentStatus()?.status ?? 'disponibile';
    return {
      disponibile:  'Sono disponibile per il prossimo paziente',
      in_visita:    'Visita in corso con paziente',
      quasi_finito: 'Sto per concludere — prepara il prossimo',
      terminato:    'Ho terminato la visita',
      assente:      'Non sono in studio',
    }[s] ?? 'Disponibile';
  });

  // ── Doctor status helpers ─────────────────────────────────────────────────

  getDoctorStatus(doctorId: string) { return this.mockData.getDoctorStatus(doctorId); }

  getDoctorStatusDot(doctorId: string): string {
    const s = this.mockData.getDoctorStatus(doctorId)?.status;
    return ({ disponibile: 'bg-emerald-400', in_visita: 'bg-amber-400', quasi_finito: 'bg-orange-400', terminato: 'bg-slate-300', assente: 'bg-rose-400' } as any)[s ?? ''] ?? 'bg-slate-300';
  }

  getDoctorStatusLabel(doctorId: string): string {
    const s = this.mockData.getDoctorStatus(doctorId)?.status;
    return ({ disponibile: 'Libero', in_visita: 'In visita', quasi_finito: 'Quasi finito', terminato: 'Terminato', assente: 'Assente' } as any)[s ?? ''] ?? 'N/D';
  }

  getDoctorStatusBadge(doctorId: string): string {
    const s = this.mockData.getDoctorStatus(doctorId)?.status;
    return ({ disponibile: 'bg-emerald-100 text-emerald-700', in_visita: 'bg-amber-100 text-amber-700', quasi_finito: 'bg-orange-100 text-orange-700', terminato: 'bg-slate-100 text-slate-600', assente: 'bg-rose-100 text-rose-700' } as any)[s ?? ''] ?? 'bg-slate-100 text-slate-600';
  }

  // ── Time formatting ───────────────────────────────────────────────────────

  formatTime(date: Date): string {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  formatRelative(date: Date | undefined): string {
    if (!date) return 'poco fa';
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'adesso';
    if (diff < 60) return `${diff} min fa`;
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
}
