import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { RequestType, REQUEST_TYPE_LABELS } from '../../core/models/booking.model';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';
import { TcBigButtonComponent } from '../../shared/tc-big-button/tc-big-button.component';

const TIPO_OPTIONS: { value: RequestType; label: string; emoji: string }[] = [
  { value: 'visita',          label: 'Visita',         emoji: '🩺' },
  { value: 'ricetta',         label: 'Ricetta',        emoji: '📋' },
  { value: 'certificato',     label: 'Certificato',    emoji: '📄' },
  { value: 'controllo',       label: 'Controllo',      emoji: '🔍' },
  { value: 'ritiro referti',  label: 'Ritiro referti', emoji: '📁' },
  { value: 'altro',           label: 'Altro',          emoji: '💬' },
];

@Component({
  selector: 'app-join-queue',
  standalone: true,
  imports: [RouterLink, FormsModule, TcButtonComponent, TcBigButtonComponent],
  template: `
    <div class="tc-patient-bg min-h-[100dvh] flex flex-col">
      <!-- Back header -->
      <header class="flex items-center gap-3 px-5 pt-6 pb-4">
        <a [routerLink]="['/p', slug]"
           class="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-card
                  text-tc-700 hover:bg-white transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-lg font-extrabold text-tc-900">Mettiti in coda</h1>
          <p class="text-xs text-tc-700/70">Studio Medico Dott. Rossi</p>
        </div>
      </header>

      <div class="flex-1 px-5 pb-8 flex flex-col gap-6">
        <!-- Queue info -->
        <div class="bg-tc-500 text-white rounded-2xl px-5 py-4 flex items-center gap-4">
          <div class="text-center">
            <div class="text-3xl font-extrabold">{{ waitingCount() }}</div>
            <div class="text-xs font-medium opacity-80">In attesa</div>
          </div>
          <div class="flex-1 text-sm font-medium opacity-90">
            Ti posizioneremo
            <strong class="font-extrabold opacity-100">al numero {{ waitingCount() + 1 }}</strong>
            con un tempo stimato di
            <strong class="font-extrabold opacity-100">~{{ estimatedWait() }} minuti</strong>
          </div>
        </div>

        <!-- Tipo visita -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-3">
            Motivo della visita
          </label>
          <div class="grid grid-cols-2 gap-2.5">
            @for (opt of tipoOptions; track opt.value) {
              <button
                type="button"
                (click)="selectedTipo.set(opt.value)"
                [class]="selectedTipo() === opt.value
                  ? 'bg-tc-500 text-white border-2 border-tc-500 shadow-tc'
                  : 'bg-white text-slate-700 border-2 border-tc-border hover:border-tc-300'"
                class="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm
                       transition-all duration-150 active:scale-95"
              >
                <span class="text-xl">{{ opt.emoji }}</span>
                <span>{{ opt.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Telefono -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2" for="phone">
            Il tuo numero di telefono
            <span class="text-tc-500 ml-1">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            class="tc-input"
            placeholder="+39 333 123 4567"
            [(ngModel)]="phone"
            inputmode="tel"
          />
          <p class="text-xs text-slate-500 mt-2">
            Riceverai un SMS quando sarà quasi il tuo turno
          </p>
        </div>

        <!-- Nome (opzionale) -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2" for="name">
            Nome e cognome
            <span class="text-xs font-normal text-slate-400 ml-1">(facoltativo)</span>
          </label>
          <input
            id="name"
            type="text"
            class="tc-input"
            placeholder="Es. Mario Rossi"
            [(ngModel)]="patientName"
          />
        </div>

        <!-- CTA -->
        @if (error()) {
          <div class="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-rose-700 text-sm font-semibold">
            {{ error() }}
          </div>
        }

        <tc-big-button variant="green" (clicked)="submit()">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          <span>Conferma e mettiti in coda</span>
        </tc-big-button>

        <p class="text-center text-xs text-slate-400 leading-relaxed">
          Accettando, autorizzi il trattamento del tuo numero di telefono per l'invio di notifiche SMS relative alla tua prenotazione.
        </p>
      </div>
    </div>
  `,
})
export class JoinQueueComponent {
  private mockData = inject(MockDataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly tipoOptions = TIPO_OPTIONS;

  phone = '';
  patientName = '';
  selectedTipo = signal<RequestType>('visita');
  error = signal('');

  get slug(): string {
    return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo';
  }

  waitingCount = () => this.mockData.waitingQueue().length;
  estimatedWait = () => this.mockData.waitingQueue().length * 15 + 8;

  submit(): void {
    if (!this.phone.trim()) {
      this.error.set('Inserisci il tuo numero di telefono per continuare.');
      return;
    }
    this.error.set('');

    const doctors = this.mockData.doctors().filter(d => d.available);
    const doctor = doctors[0];

    const booking = this.mockData.addToQueue({
      patientName: this.patientName.trim() || 'Paziente anonimo',
      phone: this.phone.trim(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      requestType: this.selectedTipo(),
    });

    this.router.navigate(['/p', this.slug, 'stato'], {
      queryParams: { code: booking.id },
    });
  }
}
