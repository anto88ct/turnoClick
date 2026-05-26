import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';

type TabId = 'identita' | 'medici' | 'stanze' | 'richieste' | 'orari' | 'sms' | 'qrcode';

interface TabItem { id: TabId; label: string; icon: string; }

const TABS: TabItem[] = [
  { id: 'identita',  label: 'Identità',       icon: '🏥' },
  { id: 'medici',    label: 'Medici',          icon: '👨‍⚕️' },
  { id: 'stanze',    label: 'Stanze',          icon: '🚪' },
  { id: 'richieste', label: 'Richieste',       icon: '📋' },
  { id: 'orari',     label: 'Orari',           icon: '🕐' },
  { id: 'sms',       label: 'SMS',             icon: '📱' },
  { id: 'qrcode',    label: 'QR Code',         icon: '📲' },
];

const MOCK_MEDICI = [
  { id: 1, name: 'Dott. Marco Rossi',       specialty: 'Medico di Base', avgMin: 15, active: true },
  { id: 2, name: 'Dott.ssa Giulia Bianchi', specialty: 'Fisioterapista', avgMin: 45, active: true },
  { id: 3, name: 'Dott. Antonio Ferrari',   specialty: 'Internista',     avgMin: 20, active: true },
  { id: 4, name: 'Dott.ssa Sofia Romano',   specialty: 'Dermatologa',    avgMin: 25, active: false },
  { id: 5, name: 'Dott. Luca Esposito',     specialty: 'Cardiologo',     avgMin: 30, active: true },
];

const MOCK_STANZE = [
  { id: 1, name: 'Ambulatorio 1', doctor: 'Dott. Marco Rossi',       active: true },
  { id: 2, name: 'Ambulatorio 2', doctor: 'Dott.ssa Giulia Bianchi', active: true },
  { id: 3, name: 'Ambulatorio 3', doctor: 'Dott. Antonio Ferrari',   active: true },
  { id: 4, name: 'Sala ECG',      doctor: 'Dott. Luca Esposito',     active: false },
];

const MOCK_TIPI = [
  { id: 1, name: 'Visita',         avgMin: 15, active: true },
  { id: 2, name: 'Ricetta',        avgMin: 5,  active: true },
  { id: 3, name: 'Certificato',    avgMin: 10, active: true },
  { id: 4, name: 'Controllo',      avgMin: 20, active: true },
  { id: 5, name: 'Ritiro referti', avgMin: 5,  active: true },
  { id: 6, name: 'Altro',          avgMin: 15, active: true },
];

const DAYS_IT = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [FormsModule, TcButtonComponent],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <div class="mb-6">
        <h1 class="page-header">Configurazione studio</h1>
        <p class="page-subheader">Gestisci identità, medici, orari e preferenze</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Tab sidebar -->
        <div class="lg:w-52 flex-shrink-0">
          <div class="dashboard-card !p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            @for (tab of tabs; track tab.id) {
              <button
                type="button"
                (click)="activeTab.set(tab.id)"
                [class]="activeTab() === tab.id
                  ? 'bg-tc-500 text-white shadow-tc'
                  : 'text-slate-600 hover:bg-slate-50'"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold
                       transition-all duration-150 whitespace-nowrap flex-shrink-0 lg:w-full"
              >
                <span>{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            }
          </div>
        </div>

        <!-- Tab content -->
        <div class="flex-1">

          <!-- IDENTITÀ -->
          @if (activeTab() === 'identita') {
            <div class="dashboard-card animate-slide-in-up">
              <h2 class="font-extrabold text-slate-900 mb-5">Identità e branding</h2>
              <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Nome dello studio</label>
                    <input type="text" class="tc-input-sm" value="Studio Medico Dott. Rossi"/>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Slug URL</label>
                    <div class="flex items-center">
                      <span class="px-3 py-2.5 bg-slate-100 border border-tc-border rounded-l-xl text-xs font-mono text-slate-500 border-r-0 whitespace-nowrap">turnoclick.it/</span>
                      <input type="text" class="tc-input-sm rounded-l-none flex-1" value="studio-demo"/>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Telefono</label>
                    <input type="tel" class="tc-input-sm" value="+39 02 1234567"/>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Colore brand</label>
                    <div class="flex items-center gap-2.5">
                      <input type="color" value="#10b981"
                             class="w-10 h-10 rounded-xl border border-tc-border cursor-pointer"/>
                      <input type="text" class="tc-input-sm flex-1" value="#10b981"/>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Indirizzo</label>
                  <input type="text" class="tc-input-sm" value="Via Roma 15, 20121 Milano"/>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Descrizione breve</label>
                  <textarea class="tc-input-sm min-h-[80px] resize-none" rows="3">Studio medico di medicina generale e specialistica. Attivo dal 2005.</textarea>
                </div>
                <div class="pt-2">
                  <tc-button variant="primary">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Salva modifiche
                  </tc-button>
                </div>
              </div>
            </div>
          }

          <!-- MEDICI -->
          @if (activeTab() === 'medici') {
            <div class="dashboard-card animate-slide-in-up">
              <div class="flex items-center justify-between mb-5">
                <h2 class="font-extrabold text-slate-900">Gestione medici e operatori</h2>
                <tc-button variant="primary" size="sm">+ Aggiungi medico</tc-button>
              </div>
              <div class="flex flex-col gap-3">
                @for (m of medici; track m.id) {
                  <div class="flex items-center gap-4 p-4 border border-tc-border rounded-2xl hover:border-tc-300 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-tc-100 flex items-center justify-center text-tc-700 font-extrabold text-sm flex-shrink-0">
                      {{ m.name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-slate-900">{{ m.name }}</p>
                      <p class="text-xs text-slate-500">{{ m.specialty }} · {{ m.avgMin }} min media visita</p>
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <div class="relative">
                        <input type="checkbox" [checked]="m.active" class="sr-only peer"/>
                        <div class="w-10 h-6 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                        <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                      </div>
                      <span class="text-xs font-bold" [class]="m.active ? 'text-tc-600' : 'text-slate-400'">
                        {{ m.active ? 'Attivo' : 'Inattivo' }}
                      </span>
                    </label>
                    <tc-button variant="ghost" size="sm">Modifica</tc-button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- STANZE -->
          @if (activeTab() === 'stanze') {
            <div class="dashboard-card animate-slide-in-up">
              <div class="flex items-center justify-between mb-5">
                <h2 class="font-extrabold text-slate-900">Gestione stanze e ambulatori</h2>
                <tc-button variant="primary" size="sm">+ Aggiungi stanza</tc-button>
              </div>
              <div class="flex flex-col gap-3">
                @for (s of stanze; track s.id) {
                  <div class="flex items-center gap-4 p-4 border border-tc-border rounded-2xl hover:border-tc-300 transition-colors">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                      🚪
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-slate-900">{{ s.name }}</p>
                      <p class="text-xs text-slate-500">{{ s.doctor }}</p>
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <div class="relative">
                        <input type="checkbox" [checked]="s.active" class="sr-only peer"/>
                        <div class="w-10 h-6 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                        <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </label>
                    <tc-button variant="ghost" size="sm">Modifica</tc-button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- RICHIESTE -->
          @if (activeTab() === 'richieste') {
            <div class="dashboard-card animate-slide-in-up">
              <div class="flex items-center justify-between mb-5">
                <h2 class="font-extrabold text-slate-900">Tipi di richiesta</h2>
                <tc-button variant="primary" size="sm">+ Aggiungi tipo</tc-button>
              </div>
              <div class="flex flex-col gap-3">
                @for (t of tipi; track t.id) {
                  <div class="flex items-center gap-4 p-4 border border-tc-border rounded-2xl">
                    <div class="flex-1">
                      <p class="font-bold text-slate-900">{{ t.name }}</p>
                      <p class="text-xs text-slate-500">Durata media: {{ t.avgMin }} min</p>
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <div class="relative">
                        <input type="checkbox" [checked]="t.active" class="sr-only peer"/>
                        <div class="w-10 h-6 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                        <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </label>
                    <tc-button variant="ghost" size="sm">Modifica</tc-button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- ORARI -->
          @if (activeTab() === 'orari') {
            <div class="dashboard-card animate-slide-in-up">
              <h2 class="font-extrabold text-slate-900 mb-5">Orari di apertura</h2>
              <div class="flex flex-col gap-3 mb-5">
                @for (day of days; track $index) {
                  <div class="flex items-center gap-4 py-2 border-b border-tc-border/60">
                    <span class="text-sm font-bold text-slate-700 w-24 flex-shrink-0">{{ day.name }}</span>
                    <label class="relative cursor-pointer flex-shrink-0">
                      <input type="checkbox" [checked]="day.open" class="sr-only peer"/>
                      <div class="w-9 h-5 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                      <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </label>
                    @if (day.open) {
                      <div class="flex items-center gap-2 flex-1">
                        <input type="time" [value]="day.from" class="tc-input-sm w-auto"/>
                        <span class="text-slate-400 font-semibold">–</span>
                        <input type="time" [value]="day.to" class="tc-input-sm w-auto"/>
                      </div>
                    } @else {
                      <span class="text-sm text-slate-400 font-semibold">Chiuso</span>
                    }
                  </div>
                }
              </div>
              <tc-button variant="primary">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Salva orari
              </tc-button>
            </div>
          }

          <!-- SMS -->
          @if (activeTab() === 'sms') {
            <div class="dashboard-card animate-slide-in-up">
              <h2 class="font-extrabold text-slate-900 mb-5">Personalizzazione SMS</h2>
              <div class="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5">
                <p class="text-xs font-bold text-amber-800 mb-1">Variabili disponibili</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (v of ['&#123;codice&#125;','&#123;nome_studio&#125;','&#123;persone_attesa&#125;','&#123;tempo_stimato&#125;','&#123;nome_paziente&#125;']; track v) {
                    <code class="px-2 py-0.5 bg-white border border-amber-200 rounded-lg text-xs font-mono text-amber-700" [innerHTML]="v"></code>
                  }
                </div>
              </div>
              <div class="flex flex-col gap-5">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">SMS di conferma</label>
                  <textarea class="tc-input-sm resize-none" rows="3">Prenotazione confermata! Codice: &#123;codice&#125;. Sei in posizione &#123;persone_attesa&#125;. Tempo stimato: &#123;tempo_stimato&#125; min. — &#123;nome_studio&#125;</textarea>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">SMS 10 minuti prima</label>
                  <textarea class="tc-input-sm resize-none" rows="3">Mancano circa 10 minuti al tuo turno! Codice: &#123;codice&#125;. Presentati allo studio. — &#123;nome_studio&#125;</textarea>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">SMS 1 minuto prima</label>
                  <textarea class="tc-input-sm resize-none" rows="3">Tocca quasi a te! Presentati subito alla porta. Codice: &#123;codice&#125; — &#123;nome_studio&#125;</textarea>
                </div>
                <tc-button variant="primary">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Salva template SMS
                </tc-button>
              </div>
            </div>
          }

          <!-- QR CODE -->
          @if (activeTab() === 'qrcode') {
            <div class="dashboard-card animate-slide-in-up">
              <h2 class="font-extrabold text-slate-900 mb-5">QR Code e pagina pubblica</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- QR preview -->
                <div class="text-center p-6 border-2 border-dashed border-tc-300 rounded-2xl">
                  <div class="w-40 h-40 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
                    <svg class="w-24 h-24 text-slate-400" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="10" y="10" width="30" height="30" rx="3"/>
                      <rect x="60" y="10" width="30" height="30" rx="3"/>
                      <rect x="10" y="60" width="30" height="30" rx="3"/>
                      <rect x="60" y="60" width="10" height="10"/>
                      <rect x="75" y="60" width="15" height="10"/>
                      <rect x="60" y="75" width="10" height="15"/>
                      <rect x="75" y="75" width="15" height="15"/>
                    </svg>
                  </div>
                  <p class="text-sm font-bold text-slate-700 mb-1">QR Code studio</p>
                  <p class="text-xs text-slate-500 mb-4">turnoclick.it/studio-demo</p>
                  <div class="flex gap-2 justify-center">
                    <tc-button variant="primary" size="sm">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Scarica PDF
                    </tc-button>
                    <tc-button variant="ghost" size="sm">Rigenera</tc-button>
                  </div>
                </div>

                <!-- Settings -->
                <div class="flex flex-col gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Link pagina pubblica</label>
                    <div class="flex items-center gap-2">
                      <input type="text" class="tc-input-sm flex-1" value="https://turnoclick.it/studio-demo" readonly/>
                      <tc-button variant="ghost" size="sm">Copia</tc-button>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-tc-50 rounded-xl border border-tc-200">
                    <label class="relative cursor-pointer">
                      <input type="checkbox" checked class="sr-only peer"/>
                      <div class="w-10 h-6 bg-slate-200 peer-checked:bg-tc-500 rounded-full transition-colors"></div>
                      <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </label>
                    <div>
                      <p class="text-sm font-bold text-slate-800">Prenotazione programmata attiva</p>
                      <p class="text-xs text-slate-500">I pazienti possono prenotare un appuntamento</p>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Giorni di anticipo massimo</label>
                    <input type="number" class="tc-input-sm" value="30" min="1" max="90"/>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Durata slot (minuti)</label>
                    <select class="tc-select">
                      <option>15</option>
                      <option selected>30</option>
                      <option>60</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `,
})
export class ConfigurationComponent {
  readonly tabs = TABS;
  readonly activeTab = signal<TabId>('identita');
  readonly medici = MOCK_MEDICI;
  readonly stanze = MOCK_STANZE;
  readonly tipi = MOCK_TIPI;
  readonly days = DAYS_IT.map((name, i) => ({
    name,
    open: i < 5,
    from: '09:00',
    to: '18:00',
  }));
}
