import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';

// ─── Ticket generation ───────────────────────────────────────────────────────

const SERVICE_PREFIXES: Record<string, string> = {
  'visita':         'V',
  'ricetta':        'R',
  'certificato':    'C',
  'controllo':      'K',
  'ritiro referti': 'P',
  'altro':          'A',
};

// In-memory counter per session (resets on page refresh — fine for demo)
const _counters: Record<string, number> = {};

function generateCode(serviceType: string): string {
  const prefix = SERVICE_PREFIXES[serviceType] ?? 'X';
  _counters[prefix] = (_counters[prefix] ?? 0) + 1;
  return `${prefix}${String(_counters[prefix]).padStart(2, '0')}`;
}

// ─── Totem queue entry (anonymous) ──────────────────────────────────────────

interface TotemTicket {
  code:        string;
  serviceType: string;
  serviceLabel: string;
  phone?:      string;
  issuedAt:    Date;
}

type TotemStep = 'display' | 'service' | 'phone' | 'ticket';

const SERVICES = [
  { type: 'visita',         label: 'Visita',         icon: '🩺', color: 'from-tc-500 to-tc-700' },
  { type: 'ricetta',        label: 'Ricetta',         icon: '📋', color: 'from-emerald-500 to-emerald-700' },
  { type: 'certificato',    label: 'Certificato',     icon: '📄', color: 'from-sky-500 to-sky-700' },
  { type: 'controllo',      label: 'Controllo',       icon: '🔍', color: 'from-amber-500 to-amber-700' },
  { type: 'ritiro referti', label: 'Ritiro referti',  icon: '📁', color: 'from-violet-500 to-violet-700' },
  { type: 'altro',          label: 'Altro',           icon: '💬', color: 'from-slate-500 to-slate-700' },
];

@Component({
  selector: 'app-totem',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="h-[calc(100dvh-2.25rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
                flex flex-col overflow-hidden text-white select-none"
         style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif">

      <!-- ── Header ─────────────────────────────────────────────────────────── -->
      <header class="flex-shrink-0 flex items-center justify-between
                     px-6 sm:px-10 py-4 sm:py-5 border-b border-white/10
                     bg-gradient-to-r from-tc-900/60 to-slate-900/60">
        <div class="flex items-center gap-4 sm:gap-5">
          <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-tc-500 shadow-xl
                      flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              Studio Medico Dott. Rossi
            </h1>
            <p class="text-xs sm:text-sm text-tc-300/80 font-medium mt-0.5">
              Sala d'attesa digitale — turnoclick.it
            </p>
          </div>
        </div>

        <div class="text-right flex-shrink-0">
          <div class="text-2xl sm:text-4xl lg:text-5xl font-black text-tc-300 tabular-nums leading-none">
            {{ currentTime() }}
          </div>
          <div class="text-xs sm:text-sm text-white/50 mt-1 capitalize">
            {{ currentDate() }}
          </div>
        </div>
      </header>

      <!-- ── Stats bar ────────────────────────────────────────────────────── -->
      <div class="flex-shrink-0 flex items-center border-b border-white/10 bg-white/5">
        <div class="flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 border-r border-white/10">
          <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></div>
          <span class="text-white/60 text-xs sm:text-sm font-medium">In attesa:</span>
          <span class="text-xl sm:text-3xl font-black text-amber-300 tabular-nums">{{ inAttesa().length + totemQueue().length }}</span>
        </div>
        <div class="flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 border-r border-white/10">
          <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-tc-400 animate-pulse flex-shrink-0"></div>
          <span class="text-white/60 text-xs sm:text-sm font-medium">In visita:</span>
          <span class="text-xl sm:text-3xl font-black text-tc-300 tabular-nums">{{ inCorso().length }}</span>
        </div>
        <div class="flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-white/60 text-xs sm:text-sm font-medium">Attesa:</span>
          <span class="text-xl sm:text-3xl font-black text-slate-300 tabular-nums">~{{ estimatedWait() }}'</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- DISPLAY MODE (main queue screen)                                    -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (step() === 'display') {
        <div class="flex-1 flex overflow-hidden min-h-0">

          <!-- Left: In visita (anonymous codes + room) -->
          <div class="flex flex-col flex-1 border-r border-white/10 overflow-hidden">
            <div class="flex-shrink-0 flex items-center gap-3 px-5 sm:px-8 py-3.5
                        border-b border-white/10 bg-tc-900/40">
              <div class="w-2.5 h-2.5 rounded-full bg-tc-400 animate-pulse flex-shrink-0"></div>
              <h2 class="text-xs sm:text-sm font-black text-white/70 uppercase tracking-[0.15em]">
                In Visita Ora
              </h2>
            </div>

            <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar">
              @if (inCorso().length === 0) {
                <div class="flex flex-col items-center justify-center h-full text-white/20 py-8 text-center">
                  <svg class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm font-semibold">Nessuna visita in corso</p>
                </div>
              }
              @for (b of inCorso(); track b.id; let i = $index) {
                <div class="relative overflow-hidden rounded-2xl border border-tc-500/30
                            bg-gradient-to-br from-tc-900/70 to-tc-800/30 p-4 sm:p-5">
                  <div class="absolute top-0 left-0 w-1 h-full bg-tc-400 rounded-l-2xl"></div>
                  <div class="pl-3">
                    <!-- Anonymous code — BIG -->
                    <div class="text-4xl sm:text-5xl font-black text-tc-300 tabular-nums leading-none mb-1.5">
                      {{ anonymousCode(b.id, i) }}
                    </div>
                    <!-- Room only — no name, no service -->
                    <div class="text-sm text-white/50 font-semibold">
                      {{ roomForDoctor(b.doctorId) }}
                    </div>
                    <span class="inline-flex mt-2 px-2.5 py-1 rounded-full bg-emerald-500/15
                                 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      IN CORSO
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right: In attesa (anonymous codes only) -->
          <div class="flex flex-col flex-1 overflow-hidden">
            <div class="flex-shrink-0 flex items-center justify-between px-5 sm:px-8 py-3.5
                        border-b border-white/10 bg-amber-900/20">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0"></div>
                <h2 class="text-xs sm:text-sm font-black text-white/70 uppercase tracking-[0.15em]">
                  In Attesa
                </h2>
              </div>
              <span class="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
                {{ inAttesa().length + totemQueue().length }}
              </span>
            </div>

            <div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar">
              @if ((inAttesa().length + totemQueue().length) === 0) {
                <div class="flex flex-col items-center justify-center h-full text-white/20 py-8 text-center">
                  <svg class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  <p class="text-sm font-semibold">Nessuno in coda</p>
                </div>
              }

              <!-- Existing queue (from mockData) — show only code + position -->
              @for (b of inAttesa(); track b.id; let i = $index) {
                <div class="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl"
                     [class]="i === 0
                       ? 'bg-amber-500/20 border border-amber-500/40'
                       : i < 3 ? 'bg-white/8 border border-white/15' : 'bg-white/4 border border-white/8'">
                  <!-- Position badge -->
                  <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg tabular-nums"
                       [class]="i === 0 ? 'bg-amber-400 text-slate-900' : i < 3 ? 'bg-white/15 text-white/80' : 'bg-white/8 text-white/40'">
                    {{ i + 1 }}
                  </div>
                  <!-- Anonymous code -->
                  <div class="flex-1 min-w-0">
                    <div class="font-black text-base sm:text-xl tabular-nums"
                         [class]="i === 0 ? 'text-amber-300' : i < 3 ? 'text-white/80' : 'text-white/40'">
                      {{ anonymousCode(b.id, i) }}
                    </div>
                  </div>
                  <!-- Estimated wait -->
                  <div class="text-xs font-bold tabular-nums flex-shrink-0"
                       [class]="i === 0 ? 'text-amber-400/80' : 'text-white/30'">
                    ~{{ (i + 1) * 15 }}'
                  </div>
                </div>
              }

              <!-- Totem-generated tickets -->
              @for (t of totemQueue(); track t.code; let i = $index) {
                <div class="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl bg-white/4 border border-white/8">
                  <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0 font-black text-lg text-white/40 tabular-nums">
                    {{ inAttesa().length + i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-black text-base sm:text-xl tabular-nums text-white/40">{{ t.code }}</div>
                  </div>
                  <div class="text-xs font-bold text-white/30 tabular-nums">~{{ (inAttesa().length + i + 1) * 15 }}'</div>
                </div>
              }
            </div>

            <!-- CTA: Prendi il tuo biglietto -->
            <div class="flex-shrink-0 p-4 border-t border-white/10 bg-white/5">
              <button (click)="startQueueFlow()"
                      class="w-full py-4 rounded-2xl font-extrabold text-base sm:text-lg
                             bg-gradient-to-r from-tc-500 to-tc-600 text-white
                             hover:from-tc-400 hover:to-tc-500 active:scale-98
                             transition-all shadow-xl shadow-tc-900/40 flex items-center justify-center gap-3">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                </svg>
                PRENDI IL TUO BIGLIETTO
              </button>
            </div>
          </div>

        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- STEP 1: Service selection                                           -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (step() === 'service') {
        <div class="flex-1 flex flex-col overflow-y-auto">
          <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
            <h2 class="text-2xl sm:text-3xl font-black text-white text-center mb-2">
              Che cosa hai bisogno?
            </h2>
            <p class="text-white/50 text-sm sm:text-base text-center mb-8">
              Seleziona il tipo di servizio per ricevere il tuo numero
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              @for (svc of services; track svc.type) {
                <button (click)="selectService(svc)"
                        class="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-3xl
                               border border-white/15 bg-white/8 hover:bg-white/15
                               active:scale-95 transition-all duration-150 text-center">
                  <span class="text-3xl sm:text-4xl">{{ svc.icon }}</span>
                  <span class="font-extrabold text-sm sm:text-base text-white leading-tight">{{ svc.label }}</span>
                </button>
              }
            </div>
            <button (click)="step.set('display')"
                    class="mt-8 text-sm text-white/40 hover:text-white/70 transition-colors">
              ← Torna alla sala d'attesa
            </button>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- STEP 2: Phone number (optional)                                     -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (step() === 'phone') {
        <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
          <div class="w-full max-w-sm text-center">
            <div class="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl
                        bg-white/10 border border-white/20">
              {{ selectedService()?.icon }}
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-white mb-1">
              Quasi pronto!
            </h2>
            <p class="text-white/60 text-sm mb-8">
              Servizio: <strong class="text-white">{{ selectedService()?.label }}</strong>
            </p>

            <div class="bg-white/8 border border-white/15 rounded-3xl p-6 text-left mb-6">
              <label class="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
                Numero di telefono
              </label>
              <input [(ngModel)]="phoneInput"
                     type="tel"
                     inputmode="numeric"
                     class="w-full bg-white/10 border border-white/20 rounded-2xl
                            px-4 py-4 text-white text-xl font-bold placeholder-white/30
                            focus:outline-none focus:border-tc-400 transition-colors"
                     placeholder="+39 333 0000000">
              <p class="text-xs text-white/40 mt-3 leading-relaxed">
                📱 Inserisci il numero se desideri ricevere un SMS di notifica quando è il tuo turno.
              </p>
            </div>

            <div class="space-y-3">
              <button (click)="confirmPhone()"
                      class="w-full py-4 rounded-2xl font-extrabold text-base text-white
                             bg-gradient-to-r from-tc-500 to-tc-600
                             hover:from-tc-400 hover:to-tc-500 active:scale-98
                             transition-all shadow-xl shadow-tc-900/40">
                Conferma e prendi biglietto
              </button>
              <button (click)="confirmPhone(true)"
                      class="w-full py-3 rounded-2xl font-semibold text-sm text-white/60
                             border border-white/15 hover:bg-white/8 hover:text-white/80
                             transition-all">
                Salta — Procedi senza numero
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- STEP 3: Ticket issued                                               -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (step() === 'ticket') {
        <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
          @if (currentTicket()) {
            <div class="w-full max-w-sm text-center">
              <!-- Ticket card (printable) -->
              <div class="bg-white rounded-3xl p-8 mb-6 shadow-2xl shadow-black/50 text-slate-900">
                <div class="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Il tuo numero
                </div>
                <div class="text-8xl sm:text-9xl font-black tabular-nums leading-none mb-4"
                     style="color: var(--brand)">
                  {{ currentTicket()!.code }}
                </div>
                <div class="border-t border-slate-100 pt-4 mt-2 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400 font-medium">Servizio</span>
                    <span class="font-extrabold text-slate-700">{{ currentTicket()!.serviceLabel }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400 font-medium">Persone davanti</span>
                    <span class="font-extrabold text-slate-700">{{ inAttesa().length + totemQueue().length - 1 }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400 font-medium">Attesa stimata</span>
                    <span class="font-extrabold text-slate-700">~{{ estimatedWait() }}'</span>
                  </div>
                  @if (currentTicket()!.phone) {
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-400 font-medium">SMS a</span>
                      <span class="font-extrabold text-slate-700">{{ currentTicket()!.phone }}</span>
                    </div>
                  }
                  <div class="flex justify-between text-xs text-slate-300">
                    <span>Studio Medico Dott. Rossi</span>
                    <span>{{ currentTime() }}</span>
                  </div>
                </div>
              </div>

              @if (currentTicket()!.phone) {
                <div class="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl px-4 py-3 mb-6">
                  <p class="text-sm text-emerald-300 font-semibold">
                    ✅ Riceverai un SMS al numero indicato quando è il tuo turno!
                  </p>
                </div>
              }

              <p class="text-white/50 text-sm mb-6">
                Siediti comodamente. Ti chiameremo quando è il tuo turno.
              </p>

              <div class="space-y-3">
                <button (click)="printTicket()"
                        class="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white/80
                               border border-white/20 hover:bg-white/8 transition-all flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Stampa biglietto
                </button>
                <button (click)="returnToDisplay()"
                        class="w-full py-3.5 rounded-2xl font-extrabold text-base text-white
                               bg-gradient-to-r from-tc-500 to-tc-600
                               hover:from-tc-400 hover:to-tc-500 active:scale-98 transition-all">
                  Torna alla sala d'attesa
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── Footer ─────────────────────────────────────────────────────────── -->
      <footer class="flex-shrink-0 flex items-center justify-between
                     px-6 sm:px-10 py-2.5 border-t border-white/10 bg-white/5">
        <div class="flex items-center gap-4 text-xs sm:text-sm">
          <div class="flex items-center gap-2 text-white/50">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            Sistema operativo
          </div>
        </div>
        <div class="text-xs sm:text-sm text-white/30 font-medium">
          Powered by <span class="font-extrabold text-tc-400">TurnoClick</span>
        </div>
      </footer>

    </div>
  `,
})
export class TotemComponent implements OnDestroy {
  private mockData = inject(MockDataService);
  private route   = inject(ActivatedRoute);
  private clockInterval: ReturnType<typeof setInterval>;
  private autoReturnTimer: ReturnType<typeof setTimeout> | null = null;

  readonly currentTime = signal('');
  readonly currentDate = signal('');

  readonly inCorso  = computed(() => this.mockData.inCorsoQueue());
  readonly inAttesa = computed(() => this.mockData.waitingQueue());
  readonly estimatedWait = computed(() => {
    const n = this.inAttesa().length + this.totemQueue().length;
    return n === 0 ? 0 : n * 15 + 5;
  });

  readonly step             = signal<TotemStep>('display');
  readonly selectedService  = signal<typeof SERVICES[0] | null>(null);
  readonly currentTicket    = signal<TotemTicket | null>(null);
  readonly totemQueue       = signal<TotemTicket[]>([]);
  phoneInput                = '';

  readonly services = SERVICES;

  // Room mapping (mock — in production: from config)
  private readonly roomMap: Record<string, string> = {
    'dr-rossi':   'Ambulatorio 1',
    'dr-bianchi': 'Ambulatorio 2',
    'dr-ferrari': 'Ambulatorio 3',
    'dr-romano':  'Ambulatorio 4',
    'dr-esposito':'Ambulatorio 5',
  };

  get slug(): string {
    return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo';
  }

  constructor() {
    this.tick();
    this.clockInterval = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
    if (this.autoReturnTimer) clearTimeout(this.autoReturnTimer);
  }

  private tick(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    this.currentDate.set(now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }

  /** Derives a short anonymous display code from booking ID and index */
  anonymousCode(bookingId: string, index: number): string {
    // Use the last chars of the ID as a readable anonymous code
    const suffix = bookingId.replace('TC-', '').slice(-4);
    return suffix || `Q${String(index + 1).padStart(2, '0')}`;
  }

  roomForDoctor(doctorId: string): string {
    return this.roomMap[doctorId] ?? 'Ambulatorio';
  }

  // ── Queue flow ────────────────────────────────────────────────────────────

  startQueueFlow(): void {
    this.selectedService.set(null);
    this.phoneInput = '';
    this.step.set('service');
  }

  selectService(svc: typeof SERVICES[0]): void {
    this.selectedService.set(svc);
    this.step.set('phone');
  }

  confirmPhone(skip = false): void {
    const svc = this.selectedService();
    if (!svc) return;

    const ticket: TotemTicket = {
      code:         generateCode(svc.type),
      serviceType:  svc.type,
      serviceLabel: svc.label,
      phone:        skip ? undefined : (this.phoneInput || undefined),
      issuedAt:     new Date(),
    };

    this.totemQueue.update(q => [...q, ticket]);
    this.currentTicket.set(ticket);
    this.step.set('ticket');

    // Auto-return to display after 30s
    if (this.autoReturnTimer) clearTimeout(this.autoReturnTimer);
    this.autoReturnTimer = setTimeout(() => this.returnToDisplay(), 30_000);
  }

  returnToDisplay(): void {
    this.step.set('display');
    this.currentTicket.set(null);
    if (this.autoReturnTimer) {
      clearTimeout(this.autoReturnTimer);
      this.autoReturnTimer = null;
    }
  }

  printTicket(): void {
    window.print();
  }
}
