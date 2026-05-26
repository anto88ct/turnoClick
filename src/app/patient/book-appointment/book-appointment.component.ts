import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Doctor } from '../../core/models/doctor.model';
import { RequestType } from '../../core/models/booking.model';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';

const SERVIZI: { value: RequestType; label: string; emoji: string; desc: string }[] = [
  { value: 'visita',         label: 'Visita medica',   emoji: '🩺', desc: 'Consulto generale con il medico' },
  { value: 'ricetta',        label: 'Ricetta',          emoji: '📋', desc: 'Richiesta farmaci o esami' },
  { value: 'certificato',    label: 'Certificato',      emoji: '📄', desc: 'Certificati medici di vario tipo' },
  { value: 'controllo',      label: 'Controllo',        emoji: '🔍', desc: 'Visita di controllo periodica' },
  { value: 'ritiro referti', label: 'Ritiro referti',   emoji: '📁', desc: 'Ritiro esami e referti' },
  { value: 'altro',          label: 'Altro',            emoji: '💬', desc: 'Altro tipo di prestazione' },
];

function generateTimeSlots(): { time: string; available: boolean }[] {
  const slots = [];
  for (let h = 9; h <= 17; h++) {
    for (const m of [0, 30]) {
      if (h === 17 && m === 30) continue;
      const unavailable = Math.random() < 0.3;
      slots.push({
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        available: !unavailable,
      });
    }
  }
  return slots;
}

function generateCalendarDays(year: number, month: number): { date: Date; available: boolean; closed: boolean }[] {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startPadding = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < startPadding; i++) {
    const d = new Date(year, month, -startPadding + i + 1);
    days.push({ date: d, available: false, closed: true });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const isPast = date < today;
    const closed = dayOfWeek === 0 || dayOfWeek === 6 || isPast;
    const isSpecialClosure = [10, 17, 24].includes(d);
    days.push({ date, available: !closed && !isSpecialClosure, closed: closed || isSpecialClosure });
  }
  return days;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [RouterLink, FormsModule, TcButtonComponent],
  template: `
    <div class="tc-patient-bg min-h-[100dvh] flex flex-col">
      <!-- Header -->
      <header class="flex items-center gap-3 px-5 pt-6 pb-4">
        <button
          (click)="prevStep()"
          class="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-card
                 text-tc-700 hover:bg-white transition-colors flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-extrabold text-tc-900">Prenota appuntamento</h1>
          <p class="text-xs text-tc-700/70">Passo {{ step() }} di 6</p>
        </div>
      </header>

      <!-- Step indicators -->
      <div class="px-5 mb-5">
        <div class="flex gap-1.5">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="flex-1 h-1.5 rounded-full transition-all duration-300"
                 [class]="s <= step() ? 'bg-tc-500' : 'bg-tc-100'"></div>
          }
        </div>
      </div>

      <div class="flex-1 px-5 pb-8">

        <!-- Step 1: Servizio -->
        @if (step() === 1) {
          <div class="animate-slide-in-up">
            <h2 class="text-xl font-extrabold text-slate-900 mb-1">Quale servizio ti serve?</h2>
            <p class="text-sm text-slate-500 mb-5">Seleziona il tipo di prestazione che desideri prenotare</p>
            <div class="flex flex-col gap-3">
              @for (s of servizi; track s.value) {
                <button
                  type="button"
                  (click)="selectedService.set(s.value); nextStep()"
                  [class]="selectedService() === s.value
                    ? 'border-2 border-tc-500 bg-tc-50'
                    : 'border-2 border-transparent bg-white hover:border-tc-200'"
                  class="flex items-center gap-4 px-5 py-4 rounded-2xl shadow-card
                         text-left transition-all duration-150 active:scale-[0.98]"
                >
                  <span class="text-3xl flex-shrink-0">{{ s.emoji }}</span>
                  <div>
                    <p class="font-extrabold text-slate-900">{{ s.label }}</p>
                    <p class="text-sm text-slate-500">{{ s.desc }}</p>
                  </div>
                  <svg class="w-4 h-4 text-tc-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        }

        <!-- Step 2: Medico -->
        @if (step() === 2) {
          <div class="animate-slide-in-up">
            <h2 class="text-xl font-extrabold text-slate-900 mb-1">Scegli il medico</h2>
            <p class="text-sm text-slate-500 mb-5">Seleziona il professionista o scegli il primo disponibile</p>

            <!-- Primo disponibile -->
            <button
              type="button"
              (click)="selectedDoctor.set('primo-disponibile'); nextStep()"
              [class]="selectedDoctor() === 'primo-disponibile'
                ? 'border-2 border-tc-500 bg-tc-50'
                : 'border-2 border-tc-200 bg-white hover:border-tc-300'"
              class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl shadow-card mb-3
                     transition-all duration-150 active:scale-[0.98] text-left"
            >
              <div class="w-12 h-12 rounded-full bg-tc-100 flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">⚡</span>
              </div>
              <div class="flex-1">
                <p class="font-extrabold text-tc-700">Primo medico disponibile</p>
                <p class="text-sm text-slate-500">Tempo d'attesa minore</p>
              </div>
            </button>

            @for (doc of availableDoctors(); track doc.id) {
              <button
                type="button"
                (click)="selectedDoctor.set(doc.id); nextStep()"
                [class]="selectedDoctor() === doc.id
                  ? 'border-2 border-tc-500 bg-tc-50'
                  : 'border-2 border-transparent bg-white hover:border-tc-200'"
                class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl shadow-card mb-3
                       transition-all duration-150 active:scale-[0.98] text-left"
              >
                <img [src]="doc.photoUrl" alt="Foto medico"
                     class="w-14 h-14 rounded-full object-cover border-2 border-tc-100 flex-shrink-0"/>
                <div class="flex-1 min-w-0">
                  <p class="font-extrabold text-slate-900">{{ doc.name }}</p>
                  <p class="text-sm text-slate-500 mb-1">{{ doc.specialty }}</p>
                  <div class="flex items-center gap-1.5">
                    <span class="text-amber-400 text-sm">★</span>
                    <span class="text-sm font-bold text-slate-700">{{ doc.rating }}</span>
                    <span class="text-xs text-slate-400">({{ doc.reviewCount }} recensioni)</span>
                  </div>
                </div>
              </button>
            }
          </div>
        }

        <!-- Step 3: Calendario -->
        @if (step() === 3) {
          <div class="animate-slide-in-up">
            <h2 class="text-xl font-extrabold text-slate-900 mb-1">Scegli il giorno</h2>
            <div class="flex items-center justify-between mb-5">
              <p class="text-sm text-slate-500">{{ monthName() }} {{ calendarYear() }}</p>
              <div class="flex gap-2">
                <button (click)="prevMonth()"
                        class="w-8 h-8 rounded-lg bg-white shadow-card flex items-center justify-center text-slate-600">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button (click)="nextMonth()"
                        class="w-8 h-8 rounded-lg bg-white shadow-card flex items-center justify-center text-slate-600">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Day labels -->
            <div class="grid grid-cols-7 mb-1">
              @for (d of ['L','M','M','G','V','S','D']; track $index) {
                <div class="text-center text-xs font-bold text-slate-400 py-1">{{ d }}</div>
              }
            </div>

            <!-- Calendar grid -->
            <div class="grid grid-cols-7 gap-1 bg-white rounded-2xl p-3 shadow-card mb-4">
              @for (day of calendarDays(); track day.date.getTime()) {
                <button
                  type="button"
                  [disabled]="day.closed || !day.available"
                  (click)="selectDate(day.date)"
                  [class]="getDayClass(day)"
                  class="aspect-square rounded-xl text-sm font-bold transition-all duration-150
                         flex items-center justify-center disabled:cursor-not-allowed"
                >
                  {{ day.date.getMonth() === calendarMonth() ? day.date.getDate() : '' }}
                </button>
              }
            </div>

            <!-- Legend -->
            <div class="flex gap-4 text-xs font-semibold">
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-tc-500"></div>
                <span class="text-slate-500">Disponibile</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-rose-300"></div>
                <span class="text-slate-500">Chiuso</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-tc-600 ring-2 ring-tc-300"></div>
                <span class="text-slate-500">Selezionato</span>
              </div>
            </div>
          </div>
        }

        <!-- Step 4: Orario -->
        @if (step() === 4) {
          <div class="animate-slide-in-up">
            <h2 class="text-xl font-extrabold text-slate-900 mb-1">Scegli l'orario</h2>
            <p class="text-sm text-slate-500 mb-5">
              Disponibilità per il
              {{ selectedDate()?.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) }}
            </p>
            <div class="grid grid-cols-3 gap-2.5">
              @for (slot of timeSlots; track slot.time) {
                <button
                  type="button"
                  [disabled]="!slot.available"
                  (click)="selectedTime.set(slot.time); nextStep()"
                  [class]="getSlotClass(slot)"
                  class="py-3.5 rounded-xl font-bold text-sm transition-all duration-150
                         disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {{ slot.time }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Step 5: Note -->
        @if (step() === 5) {
          <div class="animate-slide-in-up">
            <h2 class="text-xl font-extrabold text-slate-900 mb-1">Note per il medico</h2>
            <p class="text-sm text-slate-500 mb-5">Facoltativo — inserisci eventuali informazioni utili</p>
            <textarea
              class="tc-input min-h-[140px] resize-none"
              placeholder="Es. Sto assumendo questi farmaci... / Ho già effettuato questi esami..."
              [(ngModel)]="notes"
              rows="5"
            ></textarea>
            <tc-button variant="primary" size="lg" [fullWidth]="true" (clicked)="nextStep()" class="mt-4 block">
              @if (notes.trim()) {
                Aggiungi nota e continua
              } @else {
                Salta e continua
              }
            </tc-button>
          </div>
        }

        <!-- Step 6: Riepilogo -->
        @if (step() === 6) {
          <div class="animate-slide-in-up">
            <h2 class="text-xl font-extrabold text-slate-900 mb-5">Riepilogo prenotazione</h2>
            <div class="tc-card px-5 py-5 mb-4 flex flex-col gap-4">
              <div class="flex gap-3 items-start">
                <span class="text-2xl">🩺</span>
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Servizio</p>
                  <p class="font-bold text-slate-900">{{ selectedServiceLabel() }}</p>
                </div>
              </div>
              <div class="h-px bg-tc-border"></div>
              <div class="flex gap-3 items-start">
                <span class="text-2xl">👨‍⚕️</span>
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Medico</p>
                  <p class="font-bold text-slate-900">{{ selectedDoctorName() }}</p>
                </div>
              </div>
              <div class="h-px bg-tc-border"></div>
              <div class="flex gap-3 items-start">
                <span class="text-2xl">📅</span>
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Data e ora</p>
                  <p class="font-bold text-slate-900">
                    {{ selectedDate()?.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
                    alle {{ selectedTime() }}
                  </p>
                </div>
              </div>
              @if (notes.trim()) {
                <div class="h-px bg-tc-border"></div>
                <div class="flex gap-3 items-start">
                  <span class="text-2xl">📝</span>
                  <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Note</p>
                    <p class="font-medium text-slate-700">{{ notes }}</p>
                  </div>
                </div>
              }
            </div>
            <tc-button variant="primary" size="lg" [fullWidth]="true" (clicked)="confirm()">
              Conferma prenotazione
            </tc-button>
          </div>
        }

        <!-- Step 7: Conferma -->
        @if (step() === 7) {
          <div class="animate-bounce-in flex flex-col items-center text-center gap-6 pt-4">
            <div class="w-24 h-24 rounded-full bg-tc-100 flex items-center justify-center shadow-tc">
              <svg class="w-12 h-12 text-tc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-extrabold text-slate-900">Prenotazione confermata!</h2>
              <p class="text-slate-500 mt-2 text-sm">Riceverai un SMS di conferma e un promemoria prima dell'appuntamento</p>
            </div>
            <div class="bg-tc-50 rounded-2xl px-8 py-5 border-2 border-tc-200 w-full">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Codice prenotazione</p>
              <p class="font-mono text-4xl font-extrabold text-tc-700 tracking-widest">{{ generatedCode() }}</p>
            </div>
            <div class="tc-card px-5 py-4 w-full text-left">
              <p class="text-sm font-bold text-slate-700 mb-1">{{ selectedServiceLabel() }}</p>
              <p class="text-sm text-slate-500">{{ selectedDoctorName() }}</p>
              <p class="text-sm font-bold text-tc-600 mt-1">
                {{ selectedDate()?.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) }}
                alle {{ selectedTime() }}
              </p>
            </div>
            <a [routerLink]="['/p', slug]"
               class="w-full bg-tc-500 text-white font-bold text-lg py-5 rounded-2xl
                      flex items-center justify-center shadow-tc hover:bg-tc-600 transition-colors">
              Torna alla home
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class BookAppointmentComponent {
  private mockData = inject(MockDataService);
  private route = inject(ActivatedRoute);

  readonly servizi = SERVIZI;
  readonly timeSlots = generateTimeSlots();

  step = signal(1);
  selectedService = signal<RequestType | null>(null);
  selectedDoctor = signal<string | null>(null);
  selectedDate = signal<Date | null>(null);
  selectedTime = signal<string | null>(null);
  generatedCode = signal('');
  notes = '';

  private _calYear = signal(new Date().getFullYear());
  private _calMonth = signal(new Date().getMonth());
  calendarYear = this._calYear.asReadonly();
  calendarMonth = this._calMonth.asReadonly();

  calendarDays = computed(() => generateCalendarDays(this._calYear(), this._calMonth()));

  monthName = computed(() =>
    new Date(this._calYear(), this._calMonth(), 1)
      .toLocaleString('it-IT', { month: 'long' })
      .replace(/^\w/, c => c.toUpperCase())
  );

  availableDoctors = computed(() => this.mockData.doctors().filter(d => d.available));

  selectedServiceLabel = computed(() =>
    SERVIZI.find(s => s.value === this.selectedService())?.label ?? ''
  );

  selectedDoctorName = computed(() => {
    if (this.selectedDoctor() === 'primo-disponibile') return 'Primo medico disponibile';
    return this.mockData.doctors().find(d => d.id === this.selectedDoctor())?.name ?? '';
  });

  get slug(): string {
    return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo';
  }

  nextStep(): void {
    this.step.update(s => Math.min(s + 1, 7));
  }

  prevStep(): void {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  prevMonth(): void {
    if (this._calMonth() === 0) {
      this._calYear.update(y => y - 1);
      this._calMonth.set(11);
    } else {
      this._calMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this._calMonth() === 11) {
      this._calYear.update(y => y + 1);
      this._calMonth.set(0);
    } else {
      this._calMonth.update(m => m + 1);
    }
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
    this.nextStep();
  }

  getDayClass(day: { date: Date; available: boolean; closed: boolean }): string {
    const isSelected = this.selectedDate()?.toDateString() === day.date.toDateString();
    const isOtherMonth = day.date.getMonth() !== this._calMonth();
    if (isOtherMonth) return 'opacity-0 pointer-events-none';
    if (isSelected) return 'bg-tc-600 text-white ring-2 ring-tc-300';
    if (day.closed) return 'bg-rose-50 text-rose-300';
    return 'bg-tc-50 text-tc-800 hover:bg-tc-100 active:scale-95';
  }

  getSlotClass(slot: { time: string; available: boolean }): string {
    const isSelected = this.selectedTime() === slot.time;
    if (isSelected) return 'bg-tc-500 text-white shadow-tc';
    if (!slot.available) return 'bg-slate-50 text-slate-300 line-through';
    return 'bg-white text-slate-800 border border-tc-border hover:border-tc-400 hover:bg-tc-50';
  }

  confirm(): void {
    this.generatedCode.set(this.mockData.generateCode());
    this.step.set(7);
  }
}
