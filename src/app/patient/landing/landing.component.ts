import { Component, inject, computed, signal, effect } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { SiteBlockRendererComponent } from '../../shared/site-block-renderer/site-block-renderer.component';
import { SiteBlock, SiteHeaderConfig, SiteFooterConfig } from '../../core/models/site-builder.model';
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

      <!-- ─────────────── DYNAMIC HEADER ─────────────────────── -->
      <header class="sticky top-0 z-40 border-b shadow-sm"
              [style.background-color]="header().bgColor || '#ffffff'"
              [style.border-color]="'rgba(0,0,0,0.08)'">
        <div class="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto w-full gap-3">

          <!-- Logo / brand -->
          <div class="flex items-center gap-2.5 min-w-0 flex-shrink-0">
            @if (header().logoUrl) {
              <img [src]="header().logoUrl" alt="Logo" class="h-9 w-auto object-contain max-w-[140px]">
            } @else {
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 text-white font-extrabold text-base"
                   style="background-color: var(--brand)">
                {{ (header().logoText || 'S').charAt(0).toUpperCase() }}
              </div>
            }
            <span class="text-sm sm:text-base font-extrabold truncate"
                  [style.color]="header().textColor || '#1e293b'">
              {{ header().logoText || studioName }}
            </span>
          </div>

          <!-- Desktop nav menu -->
          @if ((header().menuItems ?? []).length > 0) {
            <nav class="hidden md:flex items-center gap-1">
              @for (item of header().menuItems ?? []; track item.href) {
                <a [href]="item.href"
                   class="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-black/5 no-underline"
                   [style.color]="header().textColor || '#1e293b'">
                  {{ item.label }}
                </a>
              }
            </nav>
          }

          <!-- Right side -->
          <div class="flex items-center gap-2 flex-shrink-0">

            <!-- Queue pill -->
            @if (header().showQueuePill !== false) {
              <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-full
                          text-xs font-semibold"
                   [style.color]="header().textColor || '#1e293b'">
                <div class="w-1.5 h-1.5 rounded-full animate-pulse"
                     [class]="queueEnabled() ? 'bg-amber-400' : 'bg-slate-400'"></div>
                {{ waitingCount() }} in attesa
              </div>
            }

            <!-- Auth buttons (desktop) -->
            <div class="hidden sm:flex items-center gap-1.5">
              @if (currentUser()) {
                <a [routerLink]="['/p', slug, 'area-personale']"
                   class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold no-underline transition-colors"
                   style="border-color: var(--brand); color: var(--brand)">
                  <div class="w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center"
                       style="background-color: var(--brand)">
                    {{ currentUser()!.name.charAt(0).toUpperCase() }}
                  </div>
                  {{ currentUser()!.name.split(' ')[0] }}
                </a>
              } @else {
                <button (click)="openModal('login')"
                        class="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold transition-colors"
                        [style.color]="header().textColor || '#64748b'">Accedi</button>
                <button (click)="openModal('register')"
                        class="px-3 py-1.5 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-90"
                        style="background-color: var(--brand)">Registrati</button>
              }
            </div>

            <!-- CTA button -->
            @if (header().ctaLabel) {
              <a [href]="header().ctaLink || '#prenota'"
                 class="flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white
                        shadow-sm hover:opacity-90 transition-all no-underline"
                 style="background-color: var(--brand)">
                {{ header().ctaLabel }}
              </a>
            }

            <!-- Mobile hamburger -->
            <button (click)="mobileMenuOpen.set(!mobileMenuOpen())"
                    class="md:hidden p-1.5 rounded-full transition-colors hover:bg-black/5"
                    [style.color]="header().textColor || '#64748b'">
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

        <!-- Mobile menu drawer -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t border-black/10 animate-fade-in"
               [style.background-color]="header().bgColor || '#ffffff'">
            <div class="px-4 py-4 flex flex-col gap-3 max-w-5xl mx-auto">

              @for (item of header().menuItems ?? []; track item.href) {
                <a [href]="item.href" (click)="mobileMenuOpen.set(false)"
                   class="py-2 font-semibold text-sm no-underline"
                   [style.color]="header().textColor || '#1e293b'">
                  {{ item.label }}
                </a>
              }

              <div class="flex items-center gap-1.5 py-2 text-xs font-semibold"
                   [style.color]="header().textColor || '#64748b'">
                <div class="w-1.5 h-1.5 rounded-full animate-pulse"
                     [class]="queueEnabled() ? 'bg-amber-400' : 'bg-slate-400'"></div>
                {{ waitingCount() }} persone in attesa
              </div>

              @if (currentUser()) {
                <a [routerLink]="['/p', slug, 'area-personale']"
                   (click)="mobileMenuOpen.set(false)"
                   class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border font-bold no-underline"
                   style="border-color: var(--brand); color: var(--brand)">
                  Area Personale ({{ currentUser()!.name.split(' ')[0] }})
                </a>
              } @else {
                <div class="grid grid-cols-2 gap-2">
                  <button (click)="openModal('login'); mobileMenuOpen.set(false)"
                          class="px-4 py-3 rounded-xl border border-slate-200 font-bold transition-colors"
                          [style.color]="header().textColor || '#64748b'">Accedi</button>
                  <button (click)="openModal('register'); mobileMenuOpen.set(false)"
                          class="px-4 py-3 rounded-xl font-bold text-white hover:opacity-90"
                          style="background-color: var(--brand)">Registrati</button>
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
            <div class="space-y-5 flex flex-col w-full">
              @if (queueEnabled()) {
                <a [routerLink]="['/p', slug, 'coda']" class="w-full no-underline">
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

              <a [routerLink]="['/p', slug, 'stato']" class="w-full no-underline">
                <tc-big-button variant="outline">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span class="text-xl sm:text-2xl">STATO ATTESA</span>
                </tc-big-button>
              </a>

            </div>

            @if (bookingEnabled()) {
              <a [routerLink]="['/p', slug, 'prenota']"
                class="flex items-center justify-center gap-2 py-4 font-bold text-base
                        transition-colors no-underline mt-4"
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
                Registrati per gestire appuntamenti e documenti
              </button>
            }
          </div>
        </div>
      </section>

      <!-- ─────────────── INSTITUTIONAL FOOTER ──────────────── -->
      <footer class="flex-shrink-0"
              [style.background-color]="footer().bgColor || '#0f172a'"
              [style.color]="footer().textColor || '#f1f5f9'">

        <!-- Main footer content -->
        <div class="max-w-5xl mx-auto px-5 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          <!-- Studio brand + address -->
          <div>
            <p class="font-extrabold text-base mb-1 opacity-90">{{ header().logoText || studioName }}</p>
            @if (footer().address) {
              <p class="text-xs opacity-60 leading-relaxed mt-2">
                <svg class="w-3 h-3 inline-block mr-1 -mt-0.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ footer().address }}
              </p>
            }
            @if (footer().vatNumber) {
              <p class="text-[11px] opacity-50 mt-1">P.IVA {{ footer().vatNumber }}</p>
            }
            <!-- Social links -->
            @if (footer().instagramUrl || footer().facebookUrl) {
              <div class="flex gap-3 mt-4">
                @if (footer().instagramUrl) {
                  <a [href]="footer().instagramUrl" target="_blank" rel="noopener"
                     class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors no-underline opacity-80 hover:opacity-100">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                }
                @if (footer().facebookUrl) {
                  <a [href]="footer().facebookUrl" target="_blank" rel="noopener"
                     class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors no-underline opacity-80 hover:opacity-100">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                }
              </div>
            }
          </div>

          <!-- Contacts -->
          <div>
            <p class="font-extrabold text-xs uppercase tracking-wider opacity-50 mb-3">Contatti</p>
            <div class="space-y-2">
              @if (footer().email) {
                <a [href]="'mailto:' + footer().email"
                   class="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity no-underline"
                   [style.color]="footer().textColor || '#f1f5f9'">
                  <svg class="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  {{ footer().email }}
                </a>
              }
              @if (footer().phone) {
                <a [href]="'tel:' + footer().phone"
                   class="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity no-underline"
                   [style.color]="footer().textColor || '#f1f5f9'">
                  <svg class="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  {{ footer().phone }}
                </a>
              }
            </div>
          </div>

          <!-- Hours -->
          @if (footer().hours) {
            <div>
              <p class="font-extrabold text-xs uppercase tracking-wider opacity-50 mb-3">Orari</p>
              <p class="text-xs opacity-70 leading-relaxed whitespace-pre-line">{{ footer().hours }}</p>
            </div>
          }
        </div>

        <!-- Bottom bar -->
        <div class="border-t border-white/10">
          <div class="max-w-5xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p class="text-xs opacity-40 font-medium">
              Powered by <span class="font-extrabold opacity-70" style="color: var(--brand)">TurnoClick</span>
              <span class="opacity-40"> · turnoclick.it</span>
            </p>
            <a [routerLink]="['/p', slug, 'totem']"
               class="flex items-center gap-1.5 text-xs opacity-40 hover:opacity-70 transition-opacity no-underline font-medium"
               [style.color]="footer().textColor || '#f1f5f9'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 17v4"/>
              </svg>
              Vista TOTEM sala d'attesa
            </a>
          </div>
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

  get studioName(): string {
    const h = this.mockData.getHeaderConfig(this.slug);
    return h.logoText || 'Studio Medico';
  }

  // Initialized once at load — patched when admin saves (needs reload)
  private readonly _header = signal<SiteHeaderConfig>(this.mockData.getHeaderConfig(this.slug));
  private readonly _footer = signal<SiteFooterConfig>(this.mockData.getFooterConfig(this.slug));
  readonly header = this._header.asReadonly();
  readonly footer = this._footer.asReadonly();

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