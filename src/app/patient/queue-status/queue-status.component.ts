import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-queue-status',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="tc-patient-bg min-h-[100dvh] flex flex-col">
      <!-- Header -->
      <header class="flex items-center gap-3 px-5 pt-6 pb-4">
        <a [routerLink]="['/p', slug]"
           class="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-card
                  text-tc-700 hover:bg-white transition-colors flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-lg font-extrabold text-tc-900">Il tuo turno</h1>
          <p class="text-xs text-tc-700/70">Studio Medico Dott. Rossi</p>
        </div>
      </header>

      <div class="flex-1 px-5 pb-8 flex flex-col gap-5">

        <!-- Status banner -->
        @if (isAlmostThere()) {
          <div class="bg-tc-500 text-white rounded-2xl px-5 py-4 flex items-center gap-3
                      animate-bounce-in shadow-tc-lg">
            <span class="text-3xl">🔔</span>
            <div>
              <p class="font-extrabold text-lg">Tocca quasi a te!</p>
              <p class="text-sm opacity-90">Presentati alla porta dello studio</p>
            </div>
          </div>
        } @else {
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3
                      border border-tc-200/60">
            <div class="w-2.5 h-2.5 rounded-full bg-tc-400 animate-pulse-slow flex-shrink-0"></div>
            <p class="text-sm font-semibold text-tc-800">Aspetta comodamente — ti avviseremo via SMS</p>
          </div>
        }

        <!-- Booking code card -->
        <div class="tc-card px-6 pt-6 pb-5 text-center animate-slide-in-up">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Il tuo codice</p>
          <div class="inline-flex items-center gap-3 bg-tc-50 rounded-2xl px-6 py-4 border-2 border-tc-200">
            <span class="font-mono text-4xl font-extrabold text-tc-700 tracking-widest">
              {{ bookingCode() }}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-3">
            Mostra questo codice allo sportello se richiesto
          </p>
        </div>

        <!-- People ahead + wait -->
        <div class="grid grid-cols-2 gap-3">
          <div class="tc-card px-4 py-5 text-center">
            <div class="text-5xl font-extrabold text-slate-900 number-update">
              {{ peopleAhead() }}
            </div>
            <p class="text-sm font-semibold text-slate-500 mt-1">
              {{ peopleAhead() === 1 ? 'persona davanti' : 'persone davanti' }}
            </p>
          </div>
          <div class="tc-card px-4 py-5 text-center">
            <div class="text-5xl font-extrabold text-tc-600">{{ minutesLeft() }}</div>
            <p class="text-sm font-semibold text-slate-500 mt-1">minuti stimati</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="tc-card px-5 py-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-bold text-slate-700">Avanzamento coda</span>
            <span class="text-sm font-extrabold text-tc-600">{{ progressPercent() }}%</span>
          </div>
          <div class="w-full bg-tc-100 rounded-full h-4 overflow-hidden">
            <div
              class="h-4 rounded-full bg-gradient-to-r from-tc-400 to-tc-600 progress-animated
                     transition-all duration-1000 ease-out"
              [style.width.%]="progressPercent()"
            ></div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-slate-400 font-medium">
            <span>Entrata in coda</span>
            <span>Il tuo turno</span>
          </div>
        </div>

        <!-- Doctor info -->
        <div class="tc-card px-5 py-4 flex items-center gap-4">
          <img
            src="https://i.pravatar.cc/80?img=12"
            alt="Medico"
            class="w-14 h-14 rounded-full object-cover border-2 border-tc-200 flex-shrink-0"
          />
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Il tuo medico</p>
            <p class="font-extrabold text-slate-900">Dott. Marco Rossi</p>
            <p class="text-sm text-slate-500">Medico di Base</p>
          </div>
        </div>

        <!-- SMS reminder info -->
        <div class="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div class="flex gap-3">
            <span class="text-xl flex-shrink-0">📱</span>
            <div class="text-sm text-amber-800">
              <p class="font-bold mb-1">Promemoria SMS automatici</p>
              <p>Riceverai un SMS <strong>10 minuti</strong> e <strong>1 minuto</strong> prima del tuo turno.</p>
            </div>
          </div>
        </div>

        <!-- Refresh hint -->
        <button
          (click)="refresh()"
          class="flex items-center justify-center gap-2 py-3 text-tc-600 font-semibold text-sm
                 hover:text-tc-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Aggiorna stato
        </button>
      </div>
    </div>
  `,
})
export class QueueStatusComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private mockData = inject(MockDataService);
  private cdr = inject(ChangeDetectorRef);

  readonly peopleAhead = signal(4);
  readonly minutesLeft = signal(22);
  readonly initialTotal = 5;

  private sub?: Subscription;

  get slug(): string {
    return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo';
  }

  bookingCode = signal('TC-A3K7');

  isAlmostThere = computed(() => this.peopleAhead() <= 1);

  progressPercent = computed(() => {
    const done = this.initialTotal - this.peopleAhead();
    return Math.round((done / this.initialTotal) * 100);
  });

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.bookingCode.set(code);
      this.peopleAhead.set(this.mockData.waitingQueue().length);
      this.minutesLeft.set(this.mockData.waitingQueue().length * 15 + 5);
    }

    this.sub = interval(8000).subscribe(() => {
      const current = this.peopleAhead();
      if (current > 0) {
        this.peopleAhead.set(current - 1);
        this.minutesLeft.update(m => Math.max(0, m - 5));
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  refresh(): void {
    const q = this.mockData.waitingQueue();
    this.peopleAhead.set(q.length);
    this.minutesLeft.set(q.length * 15 + 5);
  }
}
