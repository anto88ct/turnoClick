import {
  Component, inject, signal, computed, HostListener,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { HelpTicketService } from '../../core/services/help-ticket.service';

type WidgetTab = 'home' | 'ticket' | 'urgente' | 'bot';

interface BotMessage { role: 'bot' | 'user'; text: string; }

const BOT_FAQ: { q: string; steps: string[] }[] = [
  {
    q: 'Come vedo tutti gli appuntamenti di un paziente?',
    steps: [
      'Vai su <strong>Dashboard Segreteria</strong> dal menu principale.',
      'Clicca su <strong>Clienti</strong> nella barra laterale.',
      'Cerca il paziente per nome o numero di telefono nel campo di ricerca.',
      'Clicca sul nominativo per aprire il profilo: trovi lì tutto lo storico.',
    ],
  },
  {
    q: 'Come aggiungo un nuovo medico?',
    steps: [
      'Accedi alla <strong>Dashboard Admin Studio</strong>.',
      'Vai su <strong>Medici & Operatori</strong> nelle impostazioni.',
      'Clicca <strong>Aggiungi medico</strong> e compila nome, specialità e orari.',
      'Salva: il medico è subito attivo e visibile nelle prenotazioni.',
    ],
  },
  {
    q: 'Come esporto il report statistico?',
    steps: [
      'Apri la sezione <strong>Statistiche</strong> nel menu laterale.',
      'Seleziona il periodo desiderato con il filtro date.',
      'Clicca <strong>Esporta</strong> in alto a destra per scaricare il CSV.',
    ],
  },
  {
    q: 'Come cambio il piano abbonamento?',
    steps: [
      'Vai su <strong>Stato Abbonamento</strong> nel menu.',
      'Clicca il pulsante <strong>Cambia piano</strong>.',
      'Scegli il nuovo piano dalla lista e conferma: il cambio è immediato.',
    ],
  },
  {
    q: 'Come configuro il Totem per la sala d\'attesa?',
    steps: [
      'Apri la Dashboard Admin Studio → scheda <strong>Sito Vetrina</strong>.',
      'Attiva il toggle <strong>Totem</strong> dalla sezione "Vista pubblica".',
      'Vai all\'URL <strong>/p/[tuo-slug]/totem</strong> sul tablet della sala d\'attesa.',
    ],
  },
];

@Component({
  selector: 'app-help-widget',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (visible()) {
      <!-- Floating Button -->
      @if (!open()) {
        <button
          (click)="toggleOpen()"
          class="fixed bottom-6 right-6 z-[200] flex items-center justify-center gap-2.5
                p-3 sm:px-5 sm:py-3.5 rounded-full sm:rounded-2xl shadow-2xl
                text-white text-sm font-extrabold tracking-wide
                transition-all duration-200 hover:scale-105 active:scale-95"
          style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                box-shadow: 0 8px 32px rgba(99,102,241,0.45)">
          <svg class="w-6 h-6 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="hidden sm:inline">HAI BISOGNO D'AIUTO?</span>
        </button>
      }

      <!-- Panel -->
      @if (open()) {
        <!-- Backdrop -->
        <div class="fixed inset-0 z-[198]" (click)="toggleOpen()"></div>

        <div class="fixed bottom-6 right-6 z-[199] w-[360px] max-w-[calc(100vw-2rem)]
                    bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden
                    border border-slate-200/80 animate-slide-up"
             style="max-height: min(600px, calc(100dvh - 5rem))">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 flex-shrink-0"
               style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
            <div class="flex items-center gap-3">
              @if (tab() !== 'home') {
                <button (click)="goHome()" class="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
              }
              <div>
                <p class="text-white font-extrabold text-sm">TurnoClick Support</p>
                <p class="text-white/70 text-xs">{{ tabLabel() }}</p>
              </div>
            </div>
            <button (click)="toggleOpen()"
                    class="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto">

            <!-- ── HOME ─────────────────────────────────────────────────── -->
            @if (tab() === 'home') {
              <div class="p-5 space-y-3">
                <p class="text-sm text-slate-500 font-medium">Come possiamo aiutarti?</p>

                <!-- Ticket -->
                <button (click)="setTab('ticket')"
                        class="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200
                               hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-left">
                  <div class="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0
                               group-hover:bg-indigo-200 transition-colors">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Apri un ticket di supporto</p>
                    <p class="text-xs text-slate-400 mt-0.5">Descrivici il problema, ti ricontattiamo</p>
                  </div>
                  <svg class="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <!-- Bot -->
                <button (click)="setTab('bot')"
                        class="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200
                               hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group text-left">
                  <div class="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0
                               group-hover:bg-emerald-200 transition-colors">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Guida rapida & FAQ</p>
                    <p class="text-xs text-slate-400 mt-0.5">Risposte immediate alle domande frequenti</p>
                  </div>
                  <svg class="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <!-- Urgent -->
                <div class="w-full flex items-center gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <div class="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-rose-800">Hai bisogno di aiuto urgente?</p>
                    <p class="text-xs text-rose-600 mt-0.5">
                      <a href="mailto:supporto&#64;turnoclick.it" class="underline">supporto&#64;turnoclick.it</a>
                      &nbsp;·&nbsp;
                      <a href="tel:+390299999999" class="underline">+39 02 9999 9999</a>
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- ── TICKET FORM ─────────────────────────────────────────── -->
            @if (tab() === 'ticket') {
              <div class="p-5">
                @if (!ticketSent()) {
                  <p class="text-xs text-slate-500 mb-4">Compila il form: ti risponderemo entro poche ore.</p>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-600 mb-1">Descrizione problema *</label>
                      <textarea [(ngModel)]="ticketDesc" rows="3"
                                class="tc-input-sm w-full resize-none"
                                placeholder="Descrivi il problema nel dettaglio…"></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 mb-1">Email di riferimento</label>
                      <input [(ngModel)]="ticketEmail" type="email" class="tc-input-sm w-full"
                             placeholder="studio&#64;email.com">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 mb-1">Numero di telefono</label>
                      <input [(ngModel)]="ticketPhone" type="tel" class="tc-input-sm w-full"
                             placeholder="+39 02 1234567">
                      @if (!showExtraPhone()) {
                        <button (click)="toggleExtraPhone()" class="text-xs text-indigo-600 font-semibold mt-1 hover:underline">
                          + Aggiungi altro numero
                        </button>
                      } @else {
                        <input [(ngModel)]="ticketExtraPhone" type="tel" class="tc-input-sm w-full mt-2"
                               placeholder="Numero alternativo">
                      }
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 mb-1">Nome e Cognome <span class="text-slate-400 font-normal">(opzionale)</span></label>
                      <input [(ngModel)]="ticketName" class="tc-input-sm w-full" placeholder="Mario Rossi">
                    </div>
                    @if (ticketError()) {
                      <p class="text-xs text-rose-600 font-semibold">{{ ticketError() }}</p>
                    }
                    <button (click)="submitTicket()"
                            class="w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-all
                                   hover:opacity-90 active:scale-95"
                            style="background: linear-gradient(135deg, #6366f1, #4f46e5)">
                      Invia ticket di supporto
                    </button>
                  </div>
                } @else {
                  <div class="flex flex-col items-center justify-center py-8 text-center">
                    <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <svg class="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <p class="text-sm font-extrabold text-slate-800 mb-1">Ticket inviato con successo!</p>
                    <p class="text-xs text-slate-500">Il nostro team ti contatterà entro poche ore. Puoi monitorare lo stato in <strong>I Miei Ticket</strong>.</p>
                    <p class="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg mt-3 text-slate-600">ID: {{ lastTicketId() }}</p>
                    <button (click)="resetTicket()" class="mt-4 text-xs text-indigo-600 font-semibold hover:underline">Apri un altro ticket</button>
                  </div>
                }
              </div>
            }

            <!-- ── BOT ────────────────────────────────────────────────── -->
            @if (tab() === 'bot') {
              <div class="flex flex-col h-full">
                <div class="flex-1 p-4 space-y-3 overflow-y-auto">
                  @for (msg of botMessages(); track $index) {
                    @if (msg.role === 'bot') {
                      <div class="flex items-start gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        </div>
                        <div class="bg-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                          <p class="text-xs text-slate-700 leading-relaxed" [innerHTML]="msg.text"></p>
                        </div>
                      </div>
                    } @else {
                      <div class="flex justify-end">
                        <div class="px-3.5 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%]"
                             style="background: linear-gradient(135deg, #6366f1, #4f46e5)">
                          <p class="text-xs text-white leading-relaxed">{{ msg.text }}</p>
                        </div>
                      </div>
                    }
                  }
                </div>
                <!-- FAQ Suggestions -->
                @if (showFaqSuggestions()) {
                  <div class="px-4 pb-4 space-y-2 flex-shrink-0">
                    <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Domande frequenti</p>
                    @for (faq of faqs; track faq.q) {
                      <button (click)="askFaq(faq)"
                              class="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-slate-200
                                     hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium text-slate-700">
                        {{ faq.q }}
                      </button>
                    }
                  </div>
                }
                <!-- Not helpful? -->
                @if (!showFaqSuggestions()) {
                  <div class="px-4 pb-4 flex-shrink-0">
                    <button (click)="resetBot()" class="w-full text-xs text-center text-slate-400 py-2 hover:text-slate-600 transition-colors">
                      ← Mostra tutte le domande
                    </button>
                    <button (click)="setTab('ticket')"
                            class="w-full mt-1 py-2.5 rounded-xl text-xs font-bold text-white text-center transition-all"
                            style="background: linear-gradient(135deg, #6366f1, #4f46e5)">
                      Non hai trovato risposta? Apri un ticket →
                    </button>
                  </div>
                }
              </div>
            }

          </div>
        </div>
      }
    }
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-slide-up { animation: slide-up 0.2s ease-out forwards; }
  `],
})
export class HelpWidgetComponent {
  private ticketSvc = inject(HelpTicketService);
  private router = inject(Router);

  readonly open = signal(false);
  readonly tab = signal<WidgetTab>('home');

  // Visibility: hide on totem route
  private currentUrl = signal(this.router.url);
  readonly visible = computed(() => !this.currentUrl().includes('/totem'));

  // Ticket form
  ticketDesc = '';
  ticketEmail = 'info@studiomedico.it';   // default pre-filled
  ticketPhone = '+39 02 1234567';
  ticketExtraPhone = '';
  ticketName = '';
  readonly showExtraPhone = signal(false);
  readonly ticketSent = signal(false);
  readonly ticketError = signal('');
  readonly lastTicketId = signal('');

  // Bot
  readonly faqs = BOT_FAQ;
  readonly botMessages = signal<BotMessage[]>([
    { role: 'bot', text: 'Ciao! 👋 Sono qui per aiutarti. Seleziona una domanda frequente qui sotto o dimmi cosa vuoi sapere sulla piattaforma TurnoClick.' },
  ]);
  readonly showFaqSuggestions = signal(true);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => this.currentUrl.set(e.urlAfterRedirects));
  }

  readonly tabLabel = computed(() => ({
    home:    'Come possiamo aiutarti?',
    ticket:  'Apri un ticket',
    urgente: 'Contatto urgente',
    bot:     'Guida & FAQ',
  }[this.tab()]));

  toggleOpen(): void { this.open.update(v => !v); }
  setTab(t: WidgetTab): void { this.tab.set(t); }
  goHome(): void { this.tab.set('home'); }
  toggleExtraPhone(): void { this.showExtraPhone.update(v => !v); }

  @HostListener('document:keydown.escape')
  onEsc(): void { if (this.open()) this.open.set(false); }

  submitTicket(): void {
    this.ticketError.set('');
    if (!this.ticketDesc.trim()) {
      this.ticketError.set('La descrizione del problema è obbligatoria.');
      return;
    }
    if (!this.ticketEmail.trim()) {
      this.ticketError.set('L\'email è obbligatoria.');
      return;
    }
    const t = this.ticketSvc.createTicket({
      studioId:    'studio-demo',
      studioName:  'Studio Medico Dott. Rossi',
      description: this.ticketDesc.trim(),
      email:       this.ticketEmail.trim(),
      phone:       this.ticketPhone.trim(),
      extraPhone:  this.ticketExtraPhone.trim() || undefined,
      contactName: this.ticketName.trim() || undefined,
    });
    this.lastTicketId.set(t.id);
    this.ticketSent.set(true);
  }

  resetTicket(): void {
    this.ticketDesc = '';
    this.ticketExtraPhone = '';
    this.ticketName = '';
    this.ticketError.set('');
    this.ticketSent.set(false);
    this.lastTicketId.set('');
    this.showExtraPhone.set(false);
  }

  askFaq(faq: { q: string; steps: string[] }): void {
    this.showFaqSuggestions.set(false);
    this.botMessages.update(msgs => [
      ...msgs,
      { role: 'user', text: faq.q },
    ]);
    // Simulate bot response with slight delay feel (synchronous for now)
    const stepsHtml = faq.steps
      .map((s, i) => `<span class="font-bold text-indigo-600">${i + 1}.</span> ${s}`)
      .join('<br/>');
    this.botMessages.update(msgs => [
      ...msgs,
      {
        role: 'bot',
        text: `Certo, eccoti la procedura passo-passo! 😊<br/><br/>${stepsHtml}<br/><br/>Hai bisogno di altro aiuto?`,
      },
    ]);
  }

  resetBot(): void {
    this.showFaqSuggestions.set(true);
    this.botMessages.set([
      { role: 'bot', text: 'Ciao! 👋 Sono qui per aiutarti. Seleziona una domanda frequente qui sotto o dimmi cosa vuoi sapere sulla piattaforma TurnoClick.' },
    ]);
  }
}
