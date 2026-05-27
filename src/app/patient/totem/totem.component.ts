import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgStyle, NgClass } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-totem',
  standalone: true,
  imports: [NgStyle, NgClass],
  template: `
    <div class="h-[calc(100dvh-2.25rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-tc-950
                flex flex-col overflow-hidden text-white select-none"
         [ngStyle]="{'font-family': 'Plus Jakarta Sans, system-ui, sans-serif'}">

      <!-- ── Header ─────────────────────────────────────────────────────────── -->
      <header class="flex-shrink-0 flex items-center justify-between
                     px-6 sm:px-10 py-5 border-b border-white/10
                     bg-gradient-to-r from-tc-900/50 to-slate-900/50">
        <div class="flex items-center gap-4 sm:gap-5">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-tc-500 shadow-xl
                      flex items-center justify-center flex-shrink-0">
            <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              Studio Medico Dott. Rossi
            </h1>
            <p class="text-sm sm:text-base text-tc-300/80 font-medium mt-0.5">
              Sala d'attesa digitale — turnoclick.it
            </p>
          </div>
        </div>

        <div class="text-right flex-shrink-0">
          <div class="text-3xl sm:text-4xl lg:text-5xl font-black text-tc-300 tabular-nums leading-none">
            {{ currentTime() }}
          </div>
          <div class="text-sm sm:text-base text-white/50 mt-1 capitalize">
            {{ currentDate() }}
          </div>
        </div>
      </header>

      <!-- ── Stats bar ────────────────────────────────────────────────────── -->
      <div class="flex-shrink-0 flex items-center gap-0 border-b border-white/10 bg-white/5">
        <div class="flex-1 flex items-center justify-center gap-3 py-3 border-r border-white/10">
          <div class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></div>
          <span class="text-white/60 text-sm font-medium">In attesa:</span>
          <span class="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">{{ inAttesa().length }}</span>
        </div>
        <div class="flex-1 flex items-center justify-center gap-3 py-3 border-r border-white/10">
          <div class="w-2.5 h-2.5 rounded-full bg-tc-400 animate-pulse flex-shrink-0"></div>
          <span class="text-white/60 text-sm font-medium">In visita:</span>
          <span class="text-2xl sm:text-3xl font-black text-tc-300 tabular-nums">{{ inCorso().length }}</span>
        </div>
        <div class="flex-1 flex items-center justify-center gap-3 py-3">
          <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-white/60 text-sm font-medium">Attesa stimata:</span>
          <span class="text-2xl sm:text-3xl font-black text-slate-300 tabular-nums">~{{ estimatedWait() }}'</span>
        </div>
      </div>

      <!-- ── Main grid ─────────────────────────────────────────────────────── -->
      <div class="flex-1 flex overflow-hidden min-h-0">

        <!-- Left: In visita -->
        <div class="flex flex-col flex-1 border-r border-white/10 overflow-hidden">
          <div class="flex-shrink-0 flex items-center gap-3 px-6 sm:px-8 py-4
                      border-b border-white/10 bg-tc-900/30">
            <div class="w-3 h-3 rounded-full bg-tc-400 animate-pulse flex-shrink-0"></div>
            <h2 class="text-sm sm:text-base font-black text-white/70 uppercase tracking-[0.15em]">
              In Visita Ora
            </h2>
          </div>

          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar">
            @if (inCorso().length === 0) {
              <div class="flex flex-col items-center justify-center h-full text-white/25 py-8">
                <svg class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-base font-semibold">Nessuna visita in corso</p>
              </div>
            }
            @for (b of inCorso(); track b.id) {
              <div class="relative overflow-hidden rounded-2xl border border-tc-500/30
                          bg-gradient-to-br from-tc-900/60 to-tc-800/30
                          backdrop-blur-sm p-4 sm:p-5">
                <div class="absolute top-0 left-0 w-1 h-full bg-tc-400 rounded-l-2xl"></div>
                <div class="flex items-center gap-4 pl-3">
                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
                              bg-tc-500/20 border-2 border-tc-400/50
                              flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8 text-tc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-3xl sm:text-4xl font-black text-tc-300 tabular-nums leading-none mb-1">
                      {{ b.id }}
                    </div>
                    <div class="text-lg sm:text-xl font-bold text-white truncate">{{ b.patientName }}</div>
                    <div class="text-sm text-white/60 font-medium mt-0.5 truncate">{{ b.doctorName }}</div>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="px-2.5 py-1 rounded-full bg-tc-500/20 text-tc-300
                                   text-xs font-bold capitalize border border-tc-500/20">
                        {{ b.requestType }}
                      </span>
                      <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400
                                   text-xs font-bold border border-emerald-500/20">
                        IN CORSO
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right: In attesa -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <div class="flex-shrink-0 flex items-center justify-between px-6 sm:px-8 py-4
                      border-b border-white/10 bg-amber-900/20">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0"></div>
              <h2 class="text-sm sm:text-base font-black text-white/70 uppercase tracking-[0.15em]">
                In Attesa
              </h2>
            </div>
            <span class="text-3xl sm:text-4xl font-black text-amber-300 tabular-nums">
              {{ inAttesa().length }}
            </span>
          </div>

          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 no-scrollbar">
            @if (inAttesa().length === 0) {
              <div class="flex flex-col items-center justify-center h-full text-white/25 py-8">
                <svg class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                <p class="text-base font-semibold">Nessuno in coda al momento</p>
              </div>
            }
            @for (b of inAttesa(); track b.id; let i = $index) {
              <div class="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 rounded-xl transition-all"
                   [class]="i === 0
                     ? 'bg-amber-500/20 border border-amber-500/40'
                     : i < 3 ? 'bg-white/8 border border-white/15' : 'bg-white/4 border border-white/8'">

                <!-- Position number -->
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xl tabular-nums"
                     [class]="i === 0 ? 'bg-amber-400 text-slate-900' : i < 3 ? 'bg-white/15 text-white/80' : 'bg-white/8 text-white/40'">
                  {{ i + 1 }}
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-base sm:text-lg truncate"
                       [class]="i === 0 ? 'text-white' : i < 3 ? 'text-white/80' : 'text-white/50'">
                    {{ b.patientName }}
                  </div>
                  <div class="text-xs sm:text-sm font-medium truncate mt-0.5"
                       [class]="i === 0 ? 'text-amber-300/80' : 'text-white/40'">
                    {{ b.doctorName }}
                  </div>
                </div>

                <!-- Ticket ID + wait time -->
                <div class="text-right flex-shrink-0">
                  <div class="text-base sm:text-lg font-black tabular-nums"
                       [class]="i === 0 ? 'text-amber-300' : 'text-white/40'">
                    {{ b.id }}
                  </div>
                  <div class="text-xs font-bold tabular-nums mt-0.5"
                       [class]="i === 0 ? 'text-amber-400/70' : 'text-white/30'">
                    ~{{ (i + 1) * 15 }}'
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- ── Footer ─────────────────────────────────────────────────────────── -->
      <footer class="flex-shrink-0 flex items-center justify-between
                     px-6 sm:px-10 py-3 border-t border-white/10 bg-white/5">
        <div class="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div class="flex items-center gap-2 text-white/50">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            Sistema operativo
          </div>
          <div class="text-white/30 hidden sm:block">
            Aggiornato in tempo reale
          </div>
        </div>
        <div class="text-xs sm:text-sm text-white/30 font-medium">
          Powered by <span class="font-extrabold text-tc-400">TurnoClick</span>
        </div>
      </footer>

    </div>
  `
})
export class TotemComponent implements OnDestroy {
  private mockData = inject(MockDataService);
  private route = inject(ActivatedRoute);
  private clockInterval: ReturnType<typeof setInterval>;

  readonly currentTime = signal('');
  readonly currentDate = signal('');

  readonly inCorso = computed(() => this.mockData.inCorsoQueue());
  readonly inAttesa = computed(() => this.mockData.waitingQueue());
  readonly estimatedWait = computed(() => {
    const n = this.inAttesa().length;
    return n === 0 ? 0 : n * 15 + 5;
  });

  get slug(): string {
    return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo';
  }

  constructor() {
    this.tick();
    this.clockInterval = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
  }

  private tick(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    this.currentDate.set(now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }
}
