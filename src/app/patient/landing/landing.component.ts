import { Component, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcBigButtonComponent } from '../../shared/tc-big-button/tc-big-button.component';

@Component({
  selector: 'app-patient-landing',
  standalone: true,
  imports: [RouterLink, TcBigButtonComponent],
  template: `
    <div class="tc-patient-bg flex flex-col min-h-[100dvh]">
      <!-- Header -->
      <header class="px-6 pt-8 pb-4 flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-tc-500 flex items-center justify-center shadow-tc flex-shrink-0">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-extrabold text-tc-900 leading-tight">{{ studioName }}</h1>
          <p class="text-sm text-tc-700/70 font-medium">Sala d'attesa digitale</p>
        </div>
      </header>

      <!-- Queue status bar -->
      <div class="mx-6 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 border border-tc-200/60 shadow-card">
        <div class="flex items-center justify-between">
          <div class="text-center flex-1">
            <div class="text-3xl font-extrabold text-tc-600">{{ waitingCount() }}</div>
            <div class="text-xs font-semibold text-slate-500 mt-0.5">In attesa</div>
          </div>
          <div class="w-px h-10 bg-tc-100"></div>
          <div class="text-center flex-1">
            <div class="text-3xl font-extrabold text-tc-600">~{{ estimatedMinutes() }}'</div>
            <div class="text-xs font-semibold text-slate-500 mt-0.5">Tempo stimato</div>
          </div>
          <div class="w-px h-10 bg-tc-100"></div>
          <div class="text-center flex-1">
            <div class="text-3xl font-extrabold text-tc-600">{{ inCorsoCount() }}</div>
            <div class="text-xs font-semibold text-slate-500 mt-0.5">In visita</div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 px-6 flex flex-col justify-center gap-4 pb-8">
        <div class="mb-2">
          <h2 class="text-2xl font-extrabold text-slate-900 text-balance">
            Sei in fila senza aspettare in sala
          </h2>
          <p class="text-slate-600 mt-2 leading-relaxed">
            Mettiti in coda adesso e aspetta dove vuoi. Ti avviseremo via SMS quando è il tuo turno.
          </p>
        </div>

        <a [routerLink]="['/p', slug, 'coda']">
          <tc-big-button variant="green">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="text-2xl">PRENDI NUMERO</span>
          </tc-big-button>
        </a>

        <a [routerLink]="['/p', slug, 'stato']">
          <tc-big-button variant="outline">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span class="text-2xl">STATO ATTESA</span>
          </tc-big-button>
        </a>

        <a [routerLink]="['/p', slug, 'prenota']"
           class="flex items-center justify-center gap-2 py-4 text-tc-700 font-bold text-lg
                  underline underline-offset-4 decoration-tc-300 hover:text-tc-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Prenota un appuntamento
        </a>
      </div>

      <!-- Footer -->
      <footer class="text-center pb-6 px-6">
        <p class="text-xs text-tc-700/50 font-medium">
          Powered by
          <span class="font-extrabold text-tc-600">TurnoClick</span>
          — turnoclick.it
        </p>
      </footer>
    </div>
  `,
})
export class PatientLandingComponent {
  private mockData = inject(MockDataService);
  private route = inject(ActivatedRoute);

  get slug(): string {
    return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo';
  }

  get studioName(): string {
    return 'Studio Medico Dott. Rossi';
  }

  waitingCount = computed(() => this.mockData.waitingQueue().length);
  inCorsoCount = computed(() => this.mockData.inCorsoQueue().length);
  estimatedMinutes = computed(() => this.mockData.waitingQueue().length * 15 + 5);
}
