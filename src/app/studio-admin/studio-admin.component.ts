import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TcButtonComponent } from '../shared/tc-button/tc-button.component';
import { SiteBuilderComponent } from './site-builder/site-builder.component';
import { MockDataService } from '../core/services/mock-data.service';
import { SubscriptionStatusComponent } from '../shared/subscription-status/subscription-status.component';
import { MyTicketsComponent } from '../shared/my-tickets/my-tickets.component';

type TabId = 'identita' | 'medici' | 'stanze' | 'richieste' | 'orari' | 'sms' | 'qrcode' | 'prenotazione' | 'sito-vetrina' | 'abbonamento' | 'ticket';

const DAYS_IT = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const TIPI_NOMI = ['Visita', 'Ricetta', 'Certificato', 'Controllo', 'Ritiro referti', 'Altro'];

interface MedicoAvailability { day: string; open: boolean; from: string; to: string; }
interface MedicoAvgType { tipo: string; min: number; }
interface Medico {
  id: number; nome: string; cognome: string; specialty: string;
  active: boolean; expanded: boolean;
  availability: MedicoAvailability[];
  avgPerType: MedicoAvgType[];
}
interface Stanza { id: number; nome: string; mediciIds: number[]; active: boolean; }
interface TipoRichiesta { id: number; nome: string; avgMin: number; active: boolean; isPredefined: boolean; }
interface Chiusura { id: number; date: string; note: string; }
interface Orario { day: string; open: boolean; from: string; to: string; }
interface FasciaOraria { from: string; to: string; }
interface SmsTemplate { text: string; active: boolean; }

interface Tab { id: TabId; label: string; shortLabel: string; }

const TABS: Tab[] = [
  { id: 'identita',     label: 'Identità & Branding',  shortLabel: 'Brand'     },
  { id: 'sito-vetrina', label: 'Sito Vetrina',          shortLabel: 'Sito'      },
  { id: 'medici',       label: 'Medici & Operatori',    shortLabel: 'Medici'    },
  { id: 'stanze',       label: 'Stanze & Ambulatori',   shortLabel: 'Stanze'    },
  { id: 'richieste',    label: 'Tipi di Richiesta',     shortLabel: 'Richieste' },
  { id: 'orari',        label: 'Orari & Calendario',    shortLabel: 'Orari'     },
  { id: 'sms',          label: 'Personalizzazione SMS', shortLabel: 'SMS'       },
  { id: 'qrcode',       label: 'QR Code & Pagina',      shortLabel: 'QR Code'   },
  { id: 'prenotazione', label: 'Prenotazione Online',   shortLabel: 'Prenota'   },
  { id: 'abbonamento',  label: 'Stato Abbonamento',     shortLabel: 'Piano'     },
  { id: 'ticket',       label: 'I Miei Ticket',         shortLabel: 'Ticket'    },
];

const buildMedico = (id: number, nome: string, cognome: string, specialty: string, morningShift: boolean): Medico => ({
  id, nome, cognome, specialty, active: true, expanded: false,
  availability: DAYS_IT.map((day, i) => ({
    day,
    open: i < 5,
    from: morningShift ? '09:00' : '14:00',
    to:   morningShift ? '13:00' : '18:00',
  })),
  avgPerType: TIPI_NOMI.map(tipo => ({ tipo, min: specialty === 'Fisioterapista' ? 45 : tipo === 'Ricetta' ? 5 : 15 })),
});

const INIT_MEDICI: Medico[] = [
  buildMedico(1, 'Marco',   'Rossi',    'Medico di Base',  true),
  buildMedico(2, 'Giulia',  'Bianchi',  'Fisioterapista',  true),
  buildMedico(3, 'Antonio', 'Ferrari',  'Internista',      false),
  buildMedico(4, 'Luca',    'Esposito', 'Cardiologo',      true),
];

const INIT_STANZE: Stanza[] = [
  { id: 1, nome: 'Ambulatorio 1', mediciIds: [1], active: true  },
  { id: 2, nome: 'Ambulatorio 2', mediciIds: [2], active: true  },
  { id: 3, nome: 'Ambulatorio 3', mediciIds: [3], active: true  },
  { id: 4, nome: 'Sala ECG',      mediciIds: [4], active: false },
];

const INIT_TIPI: TipoRichiesta[] = [
  { id: 1, nome: 'Visita',         avgMin: 15, active: true, isPredefined: true  },
  { id: 2, nome: 'Ricetta',        avgMin: 5,  active: true, isPredefined: true  },
  { id: 3, nome: 'Certificato',    avgMin: 10, active: true, isPredefined: true  },
  { id: 4, nome: 'Controllo',      avgMin: 20, active: true, isPredefined: true  },
  { id: 5, nome: 'Ritiro referti', avgMin: 5,  active: true, isPredefined: true  },
  { id: 6, nome: 'Altro',          avgMin: 15, active: true, isPredefined: true  },
];

const INIT_CHIUSURE: Chiusura[] = [
  { id: 1, date: '2026-08-15', note: 'Ferragosto' },
  { id: 2, date: '2026-12-25', note: 'Natale'     },
  { id: 3, date: '2026-12-26', note: 'Santo Stefano' },
];

const SMS_VARS = ['{codice}', '{nome_studio}', '{persone_attesa}', '{tempo_stimato}', '{nome_paziente}'];

@Component({
  selector: 'app-studio-admin',
  standalone: true,
  imports: [FormsModule, RouterLink, TcButtonComponent, SiteBuilderComponent, SubscriptionStatusComponent, MyTicketsComponent],
  template: `
<div class="flex h-[calc(100dvh-2.25rem)] bg-slate-50 overflow-hidden">

  <!-- ── Desktop sidebar ─────────────────────────────────────────────── -->
  <aside class="hidden lg:flex flex-col w-64 bg-tc-900 flex-shrink-0 overflow-y-auto no-scrollbar">
    <!-- Logo -->
    <div class="px-5 pt-6 pb-5 border-b border-white/10 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-tc-500 flex items-center justify-center shadow-tc flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <span class="font-extrabold text-white text-base">TurnoClick</span>
          <p class="text-xs text-white/50 font-medium">Admin Studio</p>
        </div>
      </div>
    </div>

    <!-- Studio pill -->
    <div class="mx-4 mt-4 px-3 py-2.5 bg-white/10 rounded-xl flex-shrink-0">
      <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-0.5">Studio attivo</p>
      <p class="text-sm font-bold text-white truncate">Studio Medico Dott. Rossi</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 flex flex-col gap-0.5">
      @for (tab of tabs; track tab.id) {
        <button
          type="button"
          (click)="setTab(tab.id)"
          [class]="activeTab() === tab.id
            ? 'bg-white/15 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/8'"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left w-full"
        >
          <span class="w-5 h-5 flex-shrink-0" [innerHTML]="getIcon(tab.id)"></span>
          {{ tab.label }}
        </button>
      }
    </nav>

    <!-- Bottom -->
    <div class="px-4 py-4 border-t border-white/10 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-tc-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">MR</div>
        <div class="min-w-0">
          <p class="text-sm font-bold text-white">Dott. Rossi</p>
          <p class="text-xs text-white/40">Piano Professional</p>
        </div>
      </div>
    </div>
  </aside>

  <!-- ── Main area ───────────────────────────────────────────────────── -->
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Top bar -->
    <div class="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
      <div class="flex-1 min-w-0">
        <p class="font-extrabold text-slate-900 text-sm lg:text-base truncate">{{ getActiveLabel() }}</p>
        <p class="text-xs text-slate-400 hidden sm:block">Studio Medico Dott. Rossi</p>
      </div>
      <tc-button variant="primary" size="sm">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        Salva
      </tc-button>
    </div>

    <!-- Mobile tab bar -->
    <div class="lg:hidden bg-white border-b border-slate-200 overflow-x-auto no-scrollbar flex-shrink-0">
      <div class="flex px-2 py-2 gap-1 min-w-max">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            (click)="setTab(tab.id)"
            [class]="activeTab() === tab.id
              ? 'bg-tc-500 text-white shadow-tc'
              : 'text-slate-500 hover:bg-slate-100'"
            class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 min-w-[58px]"
          >
            <span class="w-4 h-4 flex-shrink-0" [innerHTML]="getIcon(tab.id)"></span>
            <span class="text-[9px] font-bold whitespace-nowrap leading-none">{{ tab.shortLabel }}</span>
          </button>
        }
      </div>
    </div>

    <!-- Site Builder (full-height, no scroll wrapper) -->
    @if (activeTab() === 'sito-vetrina') {
      <div class="flex-1 overflow-hidden">
        <app-site-builder></app-site-builder>
      </div>
    }

    <!-- Abbonamento / Ticket (scrollable full-width) -->
    @if (activeTab() === 'abbonamento') {
      <div class="flex-1 overflow-y-auto">
        <app-subscription-status></app-subscription-status>
      </div>
    }
    @if (activeTab() === 'ticket') {
      <div class="flex-1 overflow-y-auto">
        <app-my-tickets></app-my-tickets>
      </div>
    }

    <!-- Scrollable content (all other tabs) -->
    @if (activeTab() !== 'sito-vetrina' && activeTab() !== 'abbonamento' && activeTab() !== 'ticket') {
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-3xl mx-auto px-4 py-5 lg:px-6 lg:py-6 space-y-5">

        <!-- ══ IDENTITÀ ══════════════════════════════════════════════ -->
        @if (activeTab() === 'identita') {
          <div class="space-y-5 animate-slide-in-up">

            <!-- Logo -->
            <div class="dashboard-card">
              <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-4">Logo studio</h3>
              <div class="flex items-start gap-5 flex-col sm:flex-row">
                <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-tc-300 bg-tc-50
                            flex items-center justify-center overflow-hidden flex-shrink-0">
                  @if (logoPreview()) {
                    <img [src]="logoPreview()!" class="w-full h-full object-cover" alt="Logo"/>
                  } @else {
                    <svg class="w-8 h-8 text-tc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  }
                </div>
                <div class="flex-1">
                  <p class="text-sm text-slate-500 mb-3">JPG, PNG o SVG. Max 2 MB. Dimensione consigliata: 400×400px.</p>
                  <div class="flex items-center gap-3 flex-wrap">
                    <label class="cursor-pointer">
                      <input type="file" accept=".jpg,.jpeg,.png,.svg" class="sr-only" (change)="onLogoUpload($event)"/>
                      <span class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl
                                   border-2 border-tc-500 text-tc-600 bg-white hover:bg-tc-50 transition-all">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        Carica logo
                      </span>
                    </label>
                    @if (logoPreview()) {
                      <button type="button" (click)="logoPreview.set(null)"
                              class="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                        Rimuovi
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Info base -->
            <div class="dashboard-card">
              <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-4">Informazioni studio</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Nome studio</label>
                  <input type="text" class="tc-input-sm" value="Studio Medico Dott. Rossi"/>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Telefono</label>
                  <input type="tel" class="tc-input-sm" value="+39 02 1234567"/>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Colore brand</label>
                  <div class="flex items-center gap-2">
                    <input type="color" [value]="mockData.brandColor()"
                           (input)="onBrandColorInput($event)"
                           (change)="onBrandColorChange($event)"
                           class="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1"/>
                    <input type="text" class="tc-input-sm flex-1 font-mono"
                           [value]="mockData.brandColor()"
                           (change)="onBrandColorChange($event)"/>
                  </div>
                  <!-- Color presets -->
                  <div class="flex gap-2 mt-2 flex-wrap">
                    @for (preset of brandPresets; track preset.hex) {
                      <button type="button"
                              (click)="mockData.setBrandColor(preset.hex)"
                              class="w-7 h-7 rounded-full border-2 border-white shadow transition-transform hover:scale-110 flex-shrink-0"
                              [style.background]="preset.hex"
                              [title]="preset.name"></button>
                    }
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Slug URL</label>
                  <div class="flex items-center">
                    <span class="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-l-xl text-xs font-mono
                                 text-slate-500 border-r-0 whitespace-nowrap flex-shrink-0">turnoclick.it/</span>
                    <input type="text" class="tc-input-sm rounded-l-none flex-1 font-mono" value="studio-rossi"/>
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Indirizzo fisico</label>
                  <input type="text" class="tc-input-sm" value="Via Roma 15, 20121 Milano"/>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Descrizione breve</label>
                  <textarea class="tc-input-sm min-h-[80px] resize-none" rows="3"
                  >Studio medico di medicina generale e specialistica. Attivo dal 2005.</textarea>
                </div>
              </div>
            </div>

            <!-- Link rapido al Sito Vetrina -->
            <div class="dashboard-card bg-gradient-to-r from-tc-50 to-indigo-50 border-tc-200">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-tc-500 flex items-center justify-center flex-shrink-0 shadow-tc">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-900 text-sm">Sito Vetrina</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Personalizza la pagina pubblica del tuo studio dal tab dedicato.</p>
                </div>
                <button type="button" (click)="setTab('sito-vetrina')"
                        class="flex-shrink-0 px-4 py-2 bg-tc-500 text-white text-xs font-bold rounded-xl shadow-tc
                               hover:bg-tc-600 transition-colors">
                  Vai al Sito
                </button>
              </div>
            </div>

          </div>
        }

        <!-- ══ MEDICI ════════════════════════════════════════════════ -->
        @if (activeTab() === 'medici') {
          <div class="space-y-5 animate-slide-in-up">

            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Medici & Operatori</h3>
                  <p class="text-xs text-slate-400 mt-0.5">{{ activeMediciCount() }} attivi su {{ medici().length }}</p>
                </div>
                <tc-button variant="primary" size="sm" (clicked)="showAddMedico.set(true)">
                  + Aggiungi medico
                </tc-button>
              </div>

              <!-- Add medico form -->
              @if (showAddMedico()) {
                <div class="mb-5 p-4 bg-tc-50 border border-tc-200 rounded-2xl animate-slide-in-up">
                  <p class="text-xs font-extrabold text-tc-700 uppercase tracking-widest mb-3">Nuovo medico</p>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Nome</label>
                      <input type="text" class="tc-input-sm" placeholder="Nome"/>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Cognome</label>
                      <input type="text" class="tc-input-sm" placeholder="Cognome"/>
                    </div>
                    <div class="col-span-2">
                      <label class="block text-xs font-bold text-slate-500 mb-1">Specializzazione</label>
                      <input type="text" class="tc-input-sm" placeholder="es. Medico di Base"/>
                    </div>
                    <div class="col-span-2">
                      <label class="block text-xs font-bold text-slate-500 mb-1">Foto (opzionale)</label>
                      <input type="file" accept="image/*" class="tc-input-sm text-sm"/>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <tc-button variant="primary" size="sm">Aggiungi</tc-button>
                    <tc-button variant="ghost" size="sm" (clicked)="showAddMedico.set(false)">Annulla</tc-button>
                  </div>
                </div>
              }

              <!-- Medici list -->
              <div class="flex flex-col gap-3">
                @for (m of medici(); track m.id) {
                  <div class="border border-slate-200 rounded-2xl overflow-hidden hover:border-tc-200 transition-colors">
                    <!-- Card header -->
                    <div class="flex items-center gap-3 p-4">
                      <div class="w-10 h-10 rounded-full bg-tc-100 flex items-center justify-center
                                  text-tc-700 font-extrabold text-sm flex-shrink-0">
                        {{ m.nome.charAt(0) }}{{ m.cognome.charAt(0) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-slate-900 text-sm">Dott. {{ m.nome }} {{ m.cognome }}</p>
                        <p class="text-xs text-slate-500">{{ m.specialty }}</p>
                      </div>
                      <!-- Toggle active -->
                      <label class="flex items-center gap-2 cursor-pointer flex-shrink-0">
                        <div class="relative">
                          <input type="checkbox" [checked]="m.active" (change)="toggleMedicoActive(m.id)" class="sr-only peer"/>
                          <div class="w-9 h-5 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                          <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                        </div>
                      </label>
                      <!-- Expand -->
                      <button type="button" (click)="toggleMedicoExpanded(m.id)"
                              class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center
                                     text-slate-500 transition-all flex-shrink-0"
                              [class]="m.expanded ? 'rotate-180' : ''">
                        <svg class="w-4 h-4 transition-transform duration-200" [class]="m.expanded ? 'rotate-180' : ''"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>

                    <!-- Expanded detail -->
                    @if (m.expanded) {
                      <div class="border-t border-slate-100 p-4 bg-slate-50 space-y-4 animate-slide-in-up">
                        <!-- Availability -->
                        <div>
                          <p class="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-3">Disponibilità settimanale</p>
                          <div class="space-y-2">
                            @for (avail of m.availability; track avail.day) {
                              <div class="flex items-center gap-3">
                                <span class="text-xs font-bold text-slate-600 w-20 flex-shrink-0">{{ avail.day }}</span>
                                <label class="relative cursor-pointer flex-shrink-0">
                                  <input type="checkbox" [checked]="avail.open" class="sr-only peer"/>
                                  <div class="w-8 h-4 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                                  <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                                </label>
                                @if (avail.open) {
                                  <div class="flex items-center gap-1.5 text-xs">
                                    <input type="time" [value]="avail.from" class="tc-input-sm !py-1 !px-2 w-auto text-xs"/>
                                    <span class="text-slate-400">–</span>
                                    <input type="time" [value]="avail.to" class="tc-input-sm !py-1 !px-2 w-auto text-xs"/>
                                  </div>
                                } @else {
                                  <span class="text-xs text-slate-400 font-semibold">Chiuso</span>
                                }
                              </div>
                            }
                          </div>
                        </div>
                        <!-- Avg per type -->
                        <div>
                          <p class="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-3">Tempo medio per tipo visita (minuti)</p>
                          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            @for (t of m.avgPerType; track t.tipo) {
                              <div class="bg-white rounded-xl border border-slate-200 p-2.5">
                                <p class="text-[10px] text-slate-500 font-bold mb-1">{{ t.tipo }}</p>
                                <input type="number" [value]="t.min" min="1" max="180"
                                       class="tc-input-sm !py-1 !px-2 text-sm font-bold text-slate-900"/>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- ══ STANZE ════════════════════════════════════════════════ -->
        @if (activeTab() === 'stanze') {
          <div class="space-y-5 animate-slide-in-up">
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Stanze & Ambulatori</h3>
                  <p class="text-xs text-slate-400 mt-0.5">{{ activeStanzeCount() }} attive</p>
                </div>
                <tc-button variant="primary" size="sm">+ Aggiungi stanza</tc-button>
              </div>

              <div class="flex flex-col gap-3">
                @for (s of stanze(); track s.id) {
                  <div class="p-4 border border-slate-200 rounded-2xl hover:border-tc-200 transition-colors">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl">🚪</div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-slate-900 text-sm">{{ s.nome }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ getMediciNomi(s.mediciIds) }}</p>
                      </div>
                      <!-- QR button -->
                      <button type="button"
                              class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center
                                     text-slate-500 transition-colors flex-shrink-0"
                              title="Visualizza QR Code stanza">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="7" height="7" rx="1"/>
                          <rect x="14" y="3" width="7" height="7" rx="1"/>
                          <rect x="3" y="14" width="7" height="7" rx="1"/>
                          <rect x="14" y="14" width="3" height="3" rx="0.5"/>
                          <rect x="19" y="14" width="2" height="3" rx="0.5"/>
                          <rect x="14" y="19" width="3" height="2" rx="0.5"/>
                          <rect x="19" y="19" width="2" height="2" rx="0.5"/>
                        </svg>
                      </button>
                      <!-- Toggle -->
                      <label class="relative cursor-pointer flex-shrink-0">
                        <input type="checkbox" [checked]="s.active" (change)="toggleStanzaActive(s.id)" class="sr-only peer"/>
                        <div class="w-9 h-5 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                        <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                      </label>
                      <tc-button variant="ghost" size="sm">Modifica</tc-button>
                    </div>
                    <!-- Medici assignment -->
                    <div class="mt-3 pt-3 border-t border-slate-100">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medici assegnati</p>
                      <div class="flex flex-wrap gap-1.5">
                        @for (m of medici(); track m.id) {
                          <label class="cursor-pointer">
                            <input type="checkbox" [checked]="s.mediciIds.includes(m.id)" class="sr-only peer"/>
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
                                         border border-slate-200 peer-checked:border-tc-400 peer-checked:bg-tc-50
                                         peer-checked:text-tc-700 text-slate-500 transition-all cursor-pointer">
                              Dott. {{ m.cognome }}
                            </span>
                          </label>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- ══ RICHIESTE ═════════════════════════════════════════════ -->
        @if (activeTab() === 'richieste') {
          <div class="space-y-5 animate-slide-in-up">
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Tipi di Richiesta</h3>
                  <p class="text-xs text-slate-400 mt-0.5">Motivi visita disponibili ai pazienti</p>
                </div>
                <tc-button variant="primary" size="sm">+ Aggiungi tipo</tc-button>
              </div>

              <div class="flex flex-col gap-2">
                @for (t of tipi(); track t.id) {
                  <div class="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl hover:border-tc-200 transition-colors">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="font-bold text-slate-900 text-sm">{{ t.nome }}</p>
                        @if (t.isPredefined) {
                          <span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">
                            predefinito
                          </span>
                        }
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                      <input type="number" [value]="t.avgMin" min="1" max="180"
                             class="tc-input-sm !py-1 !px-2 w-16 text-sm text-center font-bold"/>
                      <span class="text-xs text-slate-400">min</span>
                    </div>
                    <label class="relative cursor-pointer flex-shrink-0">
                      <input type="checkbox" [checked]="t.active" (change)="toggleTipoActive(t.id)" class="sr-only peer"/>
                      <div class="w-9 h-5 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                      <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </label>
                    @if (!t.isPredefined) {
                      <tc-button variant="ghost" size="sm">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </tc-button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- ══ ORARI ══════════════════════════════════════════════════ -->
        @if (activeTab() === 'orari') {
          <div class="space-y-5 animate-slide-in-up">

            <!-- Orari settimanali -->
            <div class="dashboard-card">
              <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-4">Orari di apertura settimanali</h3>
              <div class="flex flex-col gap-2">
                @for (o of orari(); track o.day; let i = $index) {
                  <div class="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <span class="text-sm font-bold text-slate-700 w-24 flex-shrink-0">{{ o.day }}</span>
                    <label class="relative cursor-pointer flex-shrink-0">
                      <input type="checkbox" [checked]="o.open" (change)="toggleOrarioDay(i)" class="sr-only peer"/>
                      <div class="w-9 h-5 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                      <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </label>
                    @if (o.open) {
                      <div class="flex items-center gap-2 flex-1">
                        <input type="time" [value]="o.from" class="tc-input-sm !py-1.5 w-auto flex-1"/>
                        <span class="text-slate-400 font-semibold text-sm">–</span>
                        <input type="time" [value]="o.to" class="tc-input-sm !py-1.5 w-auto flex-1"/>
                      </div>
                    } @else {
                      <span class="text-sm text-slate-400 font-semibold">Chiuso</span>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Limiti -->
            <div class="dashboard-card">
              <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-4">Limiti di accesso</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Limite massimo pazienti in coda</label>
                  <div class="flex items-center gap-2">
                    <input type="number" [value]="maxPatients()" (input)="maxPatients.set(+$any($event.target).value)"
                           min="1" max="999" class="tc-input-sm w-24"/>
                    <span class="text-sm text-slate-500 font-semibold">pazienti</span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Orario ultimo ingresso in coda</label>
                  <input type="time" [value]="lastEntry()" class="tc-input-sm w-auto"/>
                </div>
              </div>
            </div>

            <!-- Chiusure straordinarie -->
            <div class="dashboard-card">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Chiusure straordinarie</h3>
                  <p class="text-xs text-slate-400 mt-0.5">Date di chiusura eccezionale</p>
                </div>
                <tc-button variant="primary" size="sm" (clicked)="showAddChiusura.set(true)">+ Aggiungi</tc-button>
              </div>

              @if (showAddChiusura()) {
                <div class="mb-4 p-3 bg-tc-50 border border-tc-200 rounded-xl animate-slide-in-up">
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Data</label>
                      <input type="date" class="tc-input-sm"/>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Motivo</label>
                      <input type="text" class="tc-input-sm" placeholder="es. Ferragosto"/>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <tc-button variant="primary" size="sm">Aggiungi</tc-button>
                    <tc-button variant="ghost" size="sm" (clicked)="showAddChiusura.set(false)">Annulla</tc-button>
                  </div>
                </div>
              }

              <div class="flex flex-col gap-2">
                @for (c of chiusure(); track c.id) {
                  <div class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                    <div class="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-slate-900 text-sm">{{ formatDate(c.date) }}</p>
                      <p class="text-xs text-slate-500">{{ c.note }}</p>
                    </div>
                    <button type="button" (click)="removeChiusura(c.id)"
                            class="text-slate-400 hover:text-rose-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- ══ SMS ═══════════════════════════════════════════════════ -->
        @if (activeTab() === 'sms') {
          <div class="space-y-5 animate-slide-in-up">

            <!-- Variables reference -->
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p class="text-xs font-extrabold text-amber-800 uppercase tracking-widest mb-2">Variabili disponibili</p>
              <div class="flex flex-wrap gap-1.5">
                @for (v of smsVars; track v) {
                  <code class="px-2 py-1 bg-white border border-amber-200 rounded-lg text-xs font-mono text-amber-700">{{ v }}</code>
                }
              </div>
            </div>

            <!-- SMS templates -->
            @for (sms of smsItems(); track sms.key) {
              <div class="dashboard-card">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm">{{ sms.label }}</h3>
                    <p class="text-xs text-slate-400">{{ sms.desc }}</p>
                  </div>
                  <label class="relative cursor-pointer flex-shrink-0">
                    <input type="checkbox" [checked]="sms.active" class="sr-only peer"/>
                    <div class="w-10 h-6 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                    <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                  </label>
                </div>
                <textarea class="tc-input-sm resize-none min-h-[80px]" rows="3" [value]="sms.text"></textarea>
                <p class="text-xs text-slate-400 mt-1.5">{{ sms.text.length }}/160 caratteri</p>
              </div>
            }

          </div>
        }

        <!-- ══ QR CODE ════════════════════════════════════════════════ -->
        @if (activeTab() === 'qrcode') {
          <div class="space-y-5 animate-slide-in-up">

            <!-- Studio QR -->
            <div class="dashboard-card">
              <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-5">QR Code Studio</h3>
              <div class="flex flex-col sm:flex-row gap-6">
                <!-- QR preview -->
                <div class="flex flex-col items-center gap-3 flex-shrink-0">
                  <div class="w-44 h-44 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center p-3">
                    <svg viewBox="0 0 100 100" class="w-full h-full text-slate-800" fill="currentColor">
                      <rect x="5" y="5" width="35" height="35" rx="4"/>
                      <rect x="10" y="10" width="25" height="25" rx="2" fill="white"/>
                      <rect x="15" y="15" width="15" height="15" rx="1"/>
                      <rect x="60" y="5" width="35" height="35" rx="4"/>
                      <rect x="65" y="10" width="25" height="25" rx="2" fill="white"/>
                      <rect x="70" y="15" width="15" height="15" rx="1"/>
                      <rect x="5" y="60" width="35" height="35" rx="4"/>
                      <rect x="10" y="65" width="25" height="25" rx="2" fill="white"/>
                      <rect x="15" y="70" width="15" height="15" rx="1"/>
                      <rect x="60" y="60" width="10" height="10"/><rect x="75" y="60" width="10" height="10"/>
                      <rect x="60" y="75" width="10" height="10"/><rect x="75" y="75" width="10" height="10"/>
                      <rect x="45" y="5" width="10" height="5"/><rect x="45" y="15" width="5" height="5"/>
                      <rect x="45" y="45" width="5" height="10"/><rect x="55" y="45" width="5" height="5"/>
                      <rect x="5" y="45" width="10" height="5"/><rect x="20" y="45" width="10" height="10"/>
                    </svg>
                  </div>
                  <p class="text-xs text-slate-500 font-mono">turnoclick.it/studio-rossi</p>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-4 flex-1">
                  <div class="grid grid-cols-1 gap-3">
                    <tc-button variant="primary">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Scarica PDF A4
                    </tc-button>
                    <tc-button variant="secondary">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Scarica cartellino
                    </tc-button>
                    <tc-button variant="ghost">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Rigenera QR (invalida precedente)
                    </tc-button>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Link pagina pubblica</label>
                    <div class="flex items-center gap-2">
                      <input type="text" class="tc-input-sm flex-1 font-mono text-xs"
                             value="https://turnoclick.it/studio-rossi" readonly/>
                      <tc-button variant="ghost" size="sm">Copia</tc-button>
                    </div>
                  </div>
                  <a routerLink="/p/studio-demo" target="_blank"
                     class="inline-flex items-center gap-2 w-full justify-center py-2.5 px-4 rounded-xl
                            bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors no-underline">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Anteprima pagina pubblica
                  </a>
                  <a routerLink="/p/studio-demo/totem" target="_blank"
                     class="inline-flex items-center gap-2 w-full justify-center py-2.5 px-4 rounded-xl
                            bg-tc-50 hover:bg-tc-100 text-tc-700 text-sm font-semibold transition-colors no-underline border border-tc-200">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 17v4"/>
                    </svg>
                    Apri Vista TOTEM (tablet sala d'attesa)
                  </a>
                </div>
              </div>
            </div>

            <!-- QR per stanza -->
            <div class="dashboard-card">
              <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-4">QR Code per stanza</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (s of stanze(); track s.id) {
                  <div class="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl">
                    <div class="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🚪</div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-slate-900 text-sm">{{ s.nome }}</p>
                      <p class="text-xs text-slate-400">QR dedicato</p>
                    </div>
                    <tc-button variant="ghost" size="sm">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      PDF
                    </tc-button>
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- ══ PRENOTAZIONE ══════════════════════════════════════════ -->
        @if (activeTab() === 'prenotazione') {
          <div class="space-y-5 animate-slide-in-up">

            <!-- Accesso coda digitale -->
            <div class="dashboard-card">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <h3 class="font-bold text-slate-900">Coda digitale</h3>
                  <p class="text-sm text-slate-500 mt-0.5">
                    I pazienti possono mettersi in coda dalla pagina pubblica del tuo studio.
                  </p>
                  @if (!mockData.queueEnabled()) {
                    <div class="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700
                                text-xs font-semibold rounded-lg border border-rose-200 w-fit">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                      Coda disabilitata — i pazienti non possono iscriversi
                    </div>
                  }
                </div>
                <label class="relative cursor-pointer flex-shrink-0 mt-0.5">
                  <input type="checkbox" [checked]="mockData.queueEnabled()"
                         (change)="mockData.setQueueEnabled(!mockData.queueEnabled())" class="sr-only peer"/>
                  <div class="w-12 h-7 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                  <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>

            <!-- Master toggle prenotazione -->
            <div class="dashboard-card">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <h3 class="font-bold text-slate-900">Prenotazione programmata</h3>
                  <p class="text-sm text-slate-500 mt-0.5">
                    I pazienti possono scegliere giorno e orario specifico anziché entrare in coda.
                  </p>
                  @if (!mockData.bookingEnabled()) {
                    <div class="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700
                                text-xs font-semibold rounded-lg border border-rose-200 w-fit">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 115.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                      Prenotazioni disabilitate
                    </div>
                  }
                </div>
                <label class="relative cursor-pointer flex-shrink-0 mt-0.5">
                  <input type="checkbox" [checked]="mockData.bookingEnabled()"
                         (change)="mockData.setBookingEnabled(!mockData.bookingEnabled())" class="sr-only peer"/>
                  <div class="w-12 h-7 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                  <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>

            @if (mockData.bookingEnabled()) {
              <!-- Slot settings -->
              <div class="dashboard-card space-y-4">
                <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Configurazione slot</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Durata slot prenotabile</label>
                    <select class="tc-select">
                      <option [selected]="slotDuration() === 15">15 minuti</option>
                      <option [selected]="slotDuration() === 30">30 minuti</option>
                      <option [selected]="slotDuration() === 60">60 minuti</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Giorni di anticipo massimo</label>
                    <div class="flex items-center gap-2">
                      <input type="number" [value]="maxAdvanceDays()" min="1" max="365"
                             (input)="maxAdvanceDays.set(+$any($event.target).value)"
                             class="tc-input-sm w-24"/>
                      <span class="text-sm text-slate-500">giorni</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fasce orarie -->
              <div class="dashboard-card">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-sm font-extrabold text-slate-700 uppercase tracking-widest">Fasce orarie disponibili</h3>
                    <p class="text-xs text-slate-400 mt-0.5">Orari in cui i pazienti possono prenotare</p>
                  </div>
                  <tc-button variant="primary" size="sm" (clicked)="addFascia()">+ Fascia</tc-button>
                </div>
                <div class="flex flex-col gap-2">
                  @for (f of fasceOrarie(); track f; let i = $index) {
                    <div class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                      <span class="text-xs font-bold text-slate-500 w-16">Fascia {{ i + 1 }}</span>
                      <input type="time" [value]="f.from" class="tc-input-sm !py-1.5 w-auto flex-1"/>
                      <span class="text-slate-400 font-semibold">–</span>
                      <input type="time" [value]="f.to" class="tc-input-sm !py-1.5 w-auto flex-1"/>
                      <button type="button" (click)="removeFascia(i)"
                              class="text-slate-400 hover:text-rose-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

          </div>
        }

        <!-- Bottom spacer -->
        <div class="h-8"></div>
      </div>
    </div>
    } <!-- end @if activeTab !== sito-vetrina -->
  </div>
</div>
  `,
})
export class StudioAdminComponent {
  readonly mockData = inject(MockDataService);

  readonly tabs = TABS;
  readonly smsVars = SMS_VARS;

  readonly brandPresets = [
    { hex: '#6366f1', name: 'Indigo (default)' },
    { hex: '#8b5cf6', name: 'Viola' },
    { hex: '#3b82f6', name: 'Blu' },
    { hex: '#06b6d4', name: 'Ciano' },
    { hex: '#10b981', name: 'Smeraldo' },
    { hex: '#f59e0b', name: 'Ambra' },
    { hex: '#ef4444', name: 'Rosso' },
    { hex: '#ec4899', name: 'Rosa' },
    { hex: '#1e293b', name: 'Ardesia' },
  ];

  readonly activeTab   = signal<TabId>('identita');
  readonly logoPreview = signal<string | null>(null);
  readonly vetrinaImages = signal<{ url: string; desc: string }[]>([]);

  readonly medici  = signal<Medico[]>(INIT_MEDICI.map(m => ({ ...m, availability: m.availability.map(a => ({ ...a })), avgPerType: m.avgPerType.map(t => ({ ...t })) })));
  readonly stanze  = signal<Stanza[]>(INIT_STANZE.map(s => ({ ...s, mediciIds: [...s.mediciIds] })));
  readonly tipi    = signal<TipoRichiesta[]>(INIT_TIPI.map(t => ({ ...t })));
  readonly chiusure = signal<Chiusura[]>(INIT_CHIUSURE.map(c => ({ ...c })));
  readonly orari   = signal<Orario[]>(DAYS_IT.map((day, i) => ({ day, open: i < 5, from: '09:00', to: '18:00' })));

  readonly maxPatients        = signal(50);
  readonly lastEntry          = signal('17:30');
  readonly prenotazioneEnabled = signal(true);
  readonly slotDuration       = signal(30);
  readonly maxAdvanceDays     = signal(30);
  readonly fasceOrarie        = signal<FasciaOraria[]>([
    { from: '09:00', to: '12:00' },
    { from: '14:00', to: '17:00' },
  ]);

  readonly showAddMedico  = signal(false);
  readonly showAddChiusura = signal(false);

  // SMS templates
  readonly smsTemplatesData = signal<{ key: string; label: string; desc: string; text: string; active: boolean }[]>([
    {
      key: 'conferma', label: 'SMS di conferma', desc: 'Inviato all\'iscrizione in coda',
      text: 'Prenotazione confermata! Codice: {codice}. Sei in posizione {persone_attesa}. Tempo stimato: {tempo_stimato} min. — {nome_studio}',
      active: true,
    },
    {
      key: 'dieci', label: 'SMS 10 minuti prima', desc: 'Promemoria avvicinamento turno',
      text: 'Mancano circa 10 minuti al tuo turno! Codice: {codice}. Presentati allo studio. — {nome_studio}',
      active: true,
    },
    {
      key: 'uno', label: 'SMS 1 minuto prima', desc: 'Avviso immediato',
      text: 'Tocca quasi a te! Presentati subito alla porta. Codice: {codice} — {nome_studio}',
      active: true,
    },
  ]);

  smsItems() { return this.smsTemplatesData(); }

  activeMediciCount(): number {
    return this.medici().filter(m => m.active).length;
  }

  activeStanzeCount(): number {
    return this.stanze().filter(s => s.active).length;
  }

  setTab(id: TabId): void { this.activeTab.set(id); }

  getActiveLabel(): string {
    return TABS.find(t => t.id === this.activeTab())?.label ?? '';
  }

  onBrandColorInput(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    this.mockData.setBrandColor(hex);
  }

  onBrandColorChange(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      this.mockData.setBrandColor(hex);
    }
  }

  onLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onVetrinaUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      this.vetrinaImages.update(imgs => [...imgs, { url: e.target?.result as string, desc: file.name }]);
    };
    reader.readAsDataURL(file);
  }

  removeVetrinaImage(index: number): void {
    this.vetrinaImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  updateVetrinaDesc(index: number, desc: string): void {
    this.vetrinaImages.update(imgs => imgs.map((img, i) => i === index ? { ...img, desc } : img));
  }

  toggleMedicoExpanded(id: number): void {
    this.medici.update(list => list.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));
  }

  toggleMedicoActive(id: number): void {
    this.medici.update(list => list.map(m => m.id === id ? { ...m, active: !m.active } : m));
  }

  toggleStanzaActive(id: number): void {
    this.stanze.update(list => list.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }

  toggleTipoActive(id: number): void {
    this.tipi.update(list => list.map(t => t.id === id ? { ...t, active: !t.active } : t));
  }

  toggleOrarioDay(index: number): void {
    this.orari.update(list => list.map((o, i) => i === index ? { ...o, open: !o.open } : o));
  }

  removeChiusura(id: number): void {
    this.chiusure.update(list => list.filter(c => c.id !== id));
  }

  addFascia(): void {
    this.fasceOrarie.update(f => [...f, { from: '09:00', to: '12:00' }]);
  }

  removeFascia(index: number): void {
    this.fasceOrarie.update(f => f.filter((_, i) => i !== index));
  }

  getMediciNomi(ids: number[]): string {
    const names = this.medici().filter(m => ids.includes(m.id)).map(m => `Dott. ${m.cognome}`);
    return names.length ? names.join(', ') : 'Nessun medico assegnato';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getIcon(tabId: TabId): string {
    const icons: Record<TabId, string> = {
      identita: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>`,
      'sito-vetrina': `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
      </svg>`,
      medici: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>`,
      stanze: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>`,
      richieste: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>`,
      orari: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`,
      sms: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      </svg>`,
      qrcode: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
      </svg>`,
      prenotazione: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>`,
      abbonamento: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>`,
      ticket: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
      </svg>`,
    };
    return icons[tabId];
  }
}
