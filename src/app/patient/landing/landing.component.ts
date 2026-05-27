import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { SiteBlockRendererComponent } from '../../shared/site-block-renderer/site-block-renderer.component';
import { SiteBlock } from '../../core/models/site-builder.model';
import { TcBigButtonComponent } from '../../shared/tc-big-button/tc-big-button.component';

@Component({
  selector: 'app-patient-landing',
  standalone: true,
  imports: [RouterLink, TcBigButtonComponent, SiteBlockRendererComponent],
  template: `
    <div class="min-h-[100dvh] bg-white flex flex-col">

      <!-- ── Sticky Header ────────────────────────────────────────────────── -->
      <header class="sticky top-9 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div class="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto w-full">
          <!-- Logo / name -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-tc flex-shrink-0"
                 style="background-color: var(--brand)">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="min-w-0">
              <h1 class="text-sm sm:text-base font-extrabold text-slate-900 truncate">{{ studioName }}</h1>
              <p class="text-xs text-slate-400 font-medium hidden sm:block">Sala d'attesa digitale</p>
            </div>
          </div>

          <!-- Queue pill -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full
                      border border-slate-200 flex-shrink-0 text-xs font-semibold text-slate-600">
            <div class="w-1.5 h-1.5 rounded-full animate-pulse"
                 [class]="queueEnabled() ? 'bg-amber-400' : 'bg-slate-300'"></div>
            {{ waitingCount() }} in attesa
          </div>

          <!-- CTA button -->
          @if (queueEnabled()) {
            <a [routerLink]="['/p', slug, 'coda']"
               class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-white
                      text-sm font-bold rounded-full shadow-tc hover:opacity-90
                      transition-all hover:scale-105 no-underline"
               style="background-color: var(--brand)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="hidden sm:inline">Prendi numero</span>
              <span class="sm:hidden">Numero</span>
            </a>
          } @else {
            <div class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-slate-100
                        text-slate-400 text-sm font-bold rounded-full cursor-not-allowed">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 115.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              <span class="hidden sm:inline">Coda chiusa</span>
            </div>
          }
        </div>
      </header>

      <!-- ── Site Builder Blocks (Vetrina) ─────────────────────────────────── -->
      @if (siteBlocks().length > 0) {
        <main class="flex-shrink-0 animate-fade-in">
          @for (block of siteBlocks(); track block.id) {
            <div class="w-full">
              <app-site-block-renderer [block]="block"></app-site-block-renderer>
            </div>
          }
        </main>
      }

      <!-- ── Queue Actions Section ─────────────────────────────────────────── -->
      <section id="prenota"
               class="flex-shrink-0 px-5 py-8 sm:py-12"
               style="background: linear-gradient(135deg, var(--brand-light) 0%, #f8f9ff 100%); border-top: 1px solid rgba(99,102,241,0.12)">
        <div class="max-w-md mx-auto">

          <!-- Queue status card -->
          <div class="bg-white/90 backdrop-blur rounded-2xl px-5 py-4 border shadow-card mb-6 animate-slide-in-up"
               style="border-color: rgba(99,102,241,0.15)">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-3">
              Situazione attuale
            </p>
            <div class="flex items-center justify-around">
              <div class="text-center">
                <div class="text-3xl font-extrabold" style="color: var(--brand)">{{ waitingCount() }}</div>
                <div class="text-xs font-semibold text-slate-500 mt-0.5">In attesa</div>
              </div>
              <div class="w-px h-10" style="background: var(--brand-light)"></div>
              <div class="text-center">
                <div class="text-3xl font-extrabold" style="color: var(--brand)">~{{ estimatedMinutes() }}'</div>
                <div class="text-xs font-semibold text-slate-500 mt-0.5">Tempo stimato</div>
              </div>
              <div class="w-px h-10" style="background: var(--brand-light)"></div>
              <div class="text-center">
                <div class="text-3xl font-extrabold" style="color: var(--brand)">{{ inCorsoCount() }}</div>
                <div class="text-xs font-semibold text-slate-500 mt-0.5">In visita</div>
              </div>
            </div>
          </div>

          <div class="mb-4 animate-slide-in-up" style="animation-delay: 0.05s">
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 text-balance text-center mb-1">
              @if (queueEnabled()) { Sei in fila senza aspettare in sala }
              @else { Coda digitale temporaneamente sospesa }
            </h2>
            <p class="text-slate-500 text-sm text-center leading-relaxed">
              @if (queueEnabled()) {
                Mettiti in coda adesso e aspetta dove vuoi. Ti avviseremo via SMS.
              } @else {
                Lo studio ha temporaneamente sospeso la coda digitale. Contatta lo studio per maggiori informazioni.
              }
            </p>
          </div>

          <div class="space-y-3 animate-slide-in-up" style="animation-delay: 0.1s">
            @if (queueEnabled()) {
              <a [routerLink]="['/p', slug, 'coda']">
                <tc-big-button variant="green">
                  <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                  <span class="text-xl sm:text-2xl">PRENDI NUMERO</span>
                </tc-big-button>
              </a>
            } @else {
              <div class="w-full py-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50
                          flex items-center justify-center gap-3 text-slate-400">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span class="font-semibold text-sm">Coda non disponibile</span>
              </div>
            }

            <a [routerLink]="['/p', slug, 'stato']">
              <tc-big-button variant="outline">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span class="text-xl sm:text-2xl">STATO ATTESA</span>
              </tc-big-button>
            </a>

            @if (bookingEnabled()) {
              <a [routerLink]="['/p', slug, 'prenota']"
                 class="flex items-center justify-center gap-2 py-4 font-bold text-base
                        transition-colors no-underline"
                 style="color: var(--brand)">
                <svg class="w-5 h-5" style="color: var(--brand)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Prenota un appuntamento
              </a>
            }
          </div>

        </div>
      </section>

      <!-- ── Footer ─────────────────────────────────────────────────────────── -->
      <footer class="flex-shrink-0 bg-slate-900 py-6 px-5">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-white/40 font-medium text-center sm:text-left">
            Powered by <span class="font-extrabold" style="color: var(--brand)">TurnoClick</span> — turnoclick.it
          </p>
          <a [routerLink]="['/p', slug, 'totem']"
             class="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors no-underline font-medium">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 17v4"/>
            </svg>
            Vista TOTEM sala d'attesa
          </a>
        </div>
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

  readonly waitingCount   = computed(() => this.mockData.waitingQueue().length);
  readonly inCorsoCount   = computed(() => this.mockData.inCorsoQueue().length);
  readonly estimatedMinutes = computed(() => this.mockData.waitingQueue().length * 15 + 5);
  readonly queueEnabled   = computed(() => this.mockData.queueEnabled());
  readonly bookingEnabled = computed(() => this.mockData.bookingEnabled());

  readonly siteBlocks = computed((): SiteBlock[] => {
    return this.mockData.getSitePage(this.slug).blocks
      .sort((a, b) => a.order - b.order);
  });
}
