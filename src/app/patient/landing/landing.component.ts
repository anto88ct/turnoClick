import { Component, inject, computed, signal, effect } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { SiteBlockRendererComponent } from '../../shared/site-block-renderer/site-block-renderer.component';
import { SiteBlock } from '../../core/models/site-builder.model';
import { TcBigButtonComponent } from '../../shared/tc-big-button/tc-big-button.component';
import { PatientAuthService } from '../auth/patient-auth.service';

type AuthModal = 'login' | 'register' | null;

@Component({
  selector: 'app-patient-landing',
  standalone: true,
  imports: [RouterLink, FormsModule, TcBigButtonComponent, SiteBlockRendererComponent],
  styles: [`
    /* Scrollbar elegante e sottile */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #94a3b8;
    }
  `],
  template: `
    <div class="min-h-[100dvh] bg-white flex flex-col">

      @if (modal()) {
        <div class="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
             (click)="modal.set(null)">

          <div class="relative bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full sm:max-w-xl max-h-[90dvh] flex flex-col animate-slide-in-up"
               (click)="$event.stopPropagation()">

            <button (click)="modal.set(null)"
                    class="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div class="p-6 sm:p-8 overflow-y-auto custom-scrollbar">

              @if (modal() === 'login') {
                <div class="max-w-md mx-auto">
                  <div class="text-center mb-6">
                    <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-xl font-extrabold shadow-tc"
                         style="background-color: var(--brand)">A</div>
                    <h2 class="text-2xl font-extrabold text-slate-900">Accedi al tuo account</h2>
                    <p class="text-slate-500 mt-1">Gestisci appuntamenti e documenti</p>
                  </div>
                  <form (submit)="doLogin(); $event.preventDefault()" class="space-y-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Email</label>
                      <input [(ngModel)]="loginEmail" name="email" type="email" required autocomplete="email"
                             class="tc-input-sm w-full py-2.5" placeholder="mario.rossi@email.com">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Password</label>
                      <input [(ngModel)]="loginPassword" name="password" type="password" required autocomplete="current-password"
                             class="tc-input-sm w-full py-2.5" placeholder="••••••••">
                    </div>
                    @if (authError()) {
                      <div class="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl">
                        {{ authError() }}
                      </div>
                    }
                    <button type="submit"
                            class="w-full py-3.5 rounded-2xl text-white font-bold text-base shadow-tc hover:scale-[1.02] transition-transform mt-2"
                            style="background-color: var(--brand)">
                      Accedi
                    </button>
                  </form>
                  <div class="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p class="text-slate-500">
                      Non hai un account?
                      <button (click)="switchModal('register')" class="font-bold ml-1 hover:underline" style="color: var(--brand)">Registrati</button>
                    </p>
                  </div>
                </div>
              }

              @if (modal() === 'register') {
                <div>
                  <div class="text-center mb-6">
                    <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-extrabold shadow-tc"
                         style="background-color: var(--brand)">+</div>
                    <h2 class="text-2xl font-extrabold text-slate-900">Crea il tuo account</h2>
                    <p class="text-slate-500 mt-1">Prenota, gestisci documenti e molto altro</p>
                  </div>
                  <form (submit)="doRegister(); $event.preventDefault()" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Nome completo *</label>
                        <input [(ngModel)]="regName" name="name" required autocomplete="name"
                               class="tc-input-sm w-full py-2.5" placeholder="Mario Rossi">
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Email *</label>
                        <input [(ngModel)]="regEmail" name="email" type="email" required autocomplete="email"
                               class="tc-input-sm w-full py-2.5" placeholder="mario.rossi@email.com">
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Password *</label>
                        <input [(ngModel)]="regPassword" name="password" type="password" required autocomplete="new-password"
                               class="tc-input-sm w-full py-2.5" placeholder="Minimo 6 caratteri">
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Telefono</label>
                        <input [(ngModel)]="regPhone" name="phone" type="tel" autocomplete="tel"
                               class="tc-input-sm w-full py-2.5" placeholder="+39 340 1234567">
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Data di nascita</label>
                        <input [(ngModel)]="regDob" name="dob" type="date" class="tc-input-sm w-full py-2.5">
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Codice fiscale</label>
                        <input [(ngModel)]="regFiscalCode" name="cf" class="tc-input-sm w-full py-2.5 font-mono uppercase" placeholder="RSSMRA80A01H501Z">
                      </div>
                    </div>
                    @if (authError()) {
                      <div class="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl mt-2">
                        {{ authError() }}
                      </div>
                    }
                    <button type="submit"
                            class="w-full py-3.5 rounded-2xl text-white font-bold text-base shadow-tc hover:scale-[1.02] transition-transform mt-4"
                            style="background-color: var(--brand)">
                      Crea account
                    </button>
                  </form>
                  <div class="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p class="text-slate-500">
                      Hai già un account?
                      <button (click)="switchModal('login')" class="font-bold ml-1 hover:underline" style="color: var(--brand)">Accedi</button>
                    </p>
                  </div>
                </div>
              }

            </div>
          </div>
        </div>
      }

      <header class="sticky top-9 z-40 bg-white border-b border-slate-200 shadow-sm relative">
        <div class="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto w-full">

          <div class="flex items-center gap-3 min-w-0">
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

          <div class="flex items-center gap-2 flex-shrink-0">

            <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full
                        border border-slate-200 flex-shrink-0 text-xs font-semibold text-slate-600">
              <div class="w-1.5 h-1.5 rounded-full animate-pulse"
                   [class]="queueEnabled() ? 'bg-amber-400' : 'bg-slate-300'"></div>
              {{ waitingCount() }} in attesa
            </div>

            <div class="hidden sm:flex items-center gap-1.5">
              @if (currentUser()) {
                <a [routerLink]="['/p', slug, 'area-personale']"
                   class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold no-underline transition-colors flex-shrink-0"
                   style="border-color: var(--brand); color: var(--brand)">
                  <div class="w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0"
                       style="background-color: var(--brand)">
                    {{ currentUser()!.name.charAt(0).toUpperCase() }}
                  </div>
                  <span>{{ currentUser()!.name.split(' ')[0] }}</span>
                </a>
              } @else {
                <button (click)="openModal('login')"
                        class="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Login
                </button>
                <button (click)="openModal('register')"
                        class="px-3 py-1.5 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-90"
                        style="background-color: var(--brand)">
                  Registrati
                </button>
              }
            </div>

            @if (queueEnabled()) {
              <a [routerLink]="['/p', slug, 'coda']"
                 class="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 text-white
                        text-xs sm:text-sm font-bold rounded-full shadow-tc hover:opacity-90
                        transition-all hover:scale-105 no-underline"
                 style="background-color: var(--brand)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                <span class="hidden sm:inline">Prendi numero</span>
                <span class="sm:hidden">Numero</span>
              </a>
            } @else {
              <div class="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-100
                          text-slate-400 text-xs sm:text-sm font-bold rounded-full cursor-not-allowed">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 115.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
                <span class="hidden sm:inline">Coda chiusa</span>
                <span class="sm:hidden">Chiusa</span>
              </div>
            }

            <button (click)="mobileMenuOpen.set(!mobileMenuOpen())"
                    class="sm:hidden p-1.5 -mr-1 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                @if (mobileMenuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>

          </div>
        </div>

        @if (mobileMenuOpen()) {
          <div class="sm:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-fade-in z-50">
            <div class="px-4 py-4 flex flex-col gap-3">

              <div class="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 w-full justify-center">
                <div class="w-1.5 h-1.5 rounded-full animate-pulse"
                     [class]="queueEnabled() ? 'bg-amber-400' : 'bg-slate-300'"></div>
                {{ waitingCount() }} persone in attesa
              </div>

              @if (currentUser()) {
                <a [routerLink]="['/p', slug, 'area-personale']"
                   (click)="mobileMenuOpen.set(false)"
                   class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border font-bold no-underline transition-colors"
                   style="border-color: var(--brand); color: var(--brand)">
                  <div class="w-6 h-6 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center"
                       style="background-color: var(--brand)">
                    {{ currentUser()!.name.charAt(0).toUpperCase() }}
                  </div>
                  <span>Area Personale ({{ currentUser()!.name.split(' ')[0] }})</span>
                </a>
              } @else {
                <div class="grid grid-cols-2 gap-2">
                  <button (click)="openModal('login'); mobileMenuOpen.set(false)"
                          class="px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    Accedi
                  </button>
                  <button (click)="openModal('register'); mobileMenuOpen.set(false)"
                          class="px-4 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                          style="background-color: var(--brand)">
                    Registrati
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </header>

      @if (siteBlocks().length > 0) {
        <main class="flex-shrink-0 animate-fade-in">
          @for (block of siteBlocks(); track block.id) {
            <div class="w-full">
              <app-site-block-renderer [block]="block"></app-site-block-renderer>
            </div>
          }
        </main>
      }

      <section id="prenota"
               class="flex-shrink-0 px-5 py-8 sm:py-12"
               style="background: linear-gradient(135deg, var(--brand-light) 0%, #f8f9ff 100%); border-top: 1px solid rgba(99,102,241,0.12)">
        <div class="max-w-md mx-auto">

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

            @if (currentUser()) {
              <a [routerLink]="['/p', slug, 'area-personale']"
                 class="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm
                        transition-colors no-underline border"
                 style="color: var(--brand); border-color: var(--brand)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Area personale di {{ currentUser()!.name.split(' ')[0] }}
              </a>
            } @else {
              <button (click)="openModal('register')"
                      class="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm
                             transition-colors border w-full"
                      style="color: var(--brand); border-color: var(--brand)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                Registrati per gestire appuntamenti e documenti
              </button>
            }
          </div>

        </div>
      </section>

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
  private router = inject(Router);
  readonly authService = inject(PatientAuthService);

  get slug(): string {
    return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo';
  }

  get studioName(): string { return 'Studio Medico Dott. Rossi'; }

  readonly currentUser = this.authService.currentUser;

  readonly waitingCount = computed(() => this.mockData.waitingQueue().length);
  readonly inCorsoCount = computed(() => this.mockData.inCorsoQueue().length);
  readonly estimatedMinutes = computed(() => this.mockData.waitingQueue().length * 15 + 5);
  readonly queueEnabled = computed(() => this.mockData.queueEnabled());
  readonly bookingEnabled = computed(() => this.mockData.bookingEnabled());

  readonly siteBlocks = computed((): SiteBlock[] => {
    return this.mockData.getSitePage(this.slug).blocks
      .filter(b => !b.disabled)
      .sort((a, b) => a.order - b.order);
  });

  // Mobile menu state
  readonly mobileMenuOpen = signal<boolean>(false);

  // Auth modal state
  readonly modal = signal<AuthModal>(null);
  readonly authError = signal('');

  // Login form
  loginEmail = '';
  loginPassword = '';

  // Register form
  regName = '';
  regEmail = '';
  regPassword = '';
  regPhone = '';
  regDob = '';
  regFiscalCode = '';

  constructor() {
    // Effetto reattivo per bloccare lo scorrimento del background quando il modale è aperto
    effect(() => {
      const isOpen = this.modal() !== null;
      if (typeof document !== 'undefined') {
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  openModal(m: AuthModal): void {
    this.authError.set('');
    this.modal.set(m);
  }

  switchModal(m: AuthModal): void {
    this.authError.set('');
    this.modal.set(m);
  }

  doLogin(): void {
    this.authError.set('');
    if (!this.loginEmail || !this.loginPassword) {
      this.authError.set('Compila tutti i campi.');
      return;
    }
    const result = this.authService.login(this.loginEmail, this.loginPassword);
    if (result.error) {
      this.authError.set(result.error);
      return;
    }
    this.modal.set(null);
    this.router.navigate(['/p', this.slug, 'area-personale']);
  }

  doRegister(): void {
    this.authError.set('');
    if (!this.regName || !this.regEmail || !this.regPassword) {
      this.authError.set('Nome, email e password sono obbligatori.');
      return;
    }
    if (this.regPassword.length < 6) {
      this.authError.set('La password deve essere di almeno 6 caratteri.');
      return;
    }
    const result = this.authService.register({
      name: this.regName,
      email: this.regEmail,
      password: this.regPassword,
      phone: this.regPhone,
      dateOfBirth: this.regDob,
      fiscalCode: this.regFiscalCode,
    });
    if (result.error) {
      this.authError.set(result.error);
      return;
    }
    this.modal.set(null);
    this.router.navigate(['/p', this.slug, 'area-personale']);
  }
}