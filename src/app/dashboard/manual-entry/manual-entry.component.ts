import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { RequestType, REQUEST_TYPE_LABELS } from '../../core/models/booking.model';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [FormsModule, TcButtonComponent],
  template: `
    <div class="p-5 max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="page-header">Inserimento manuale</h1>
        <p class="page-subheader">Aggiungi un paziente senza smartphone direttamente dalla reception</p>
      </div>

      @if (confirmedBooking()) {
        <!-- Confirmation -->
        <div class="dashboard-card p-8 text-center animate-bounce-in">
          <div class="w-20 h-20 rounded-full bg-tc-100 flex items-center justify-center mx-auto mb-5 shadow-tc">
            <svg class="w-10 h-10 text-tc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Paziente in coda!</h2>
          <p class="text-slate-500 mb-6 text-sm">Il paziente è stato aggiunto alla coda con successo</p>

          <div class="bg-tc-50 rounded-2xl px-8 py-5 border-2 border-tc-200 mb-5">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Codice prenotazione</p>
            <p class="font-mono text-5xl font-extrabold text-tc-700 tracking-widest">{{ confirmedBooking()!.id }}</p>
          </div>

          <div class="text-left tc-card px-5 py-4 mb-6">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Paziente</p>
                <p class="font-bold text-slate-900">{{ confirmedBooking()!.patientName }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tipo visita</p>
                <p class="font-bold text-slate-900">{{ getRequestLabel(confirmedBooking()!.requestType) }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Medico</p>
                <p class="font-bold text-slate-900">{{ confirmedBooking()!.doctorName }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Posizione</p>
                <p class="font-bold text-slate-900">N. {{ confirmedBooking()!.position }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <tc-button variant="primary" [fullWidth]="true" (clicked)="reset()">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Nuovo inserimento
            </tc-button>
            <tc-button variant="ghost" (clicked)="print()">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Stampa
            </tc-button>
          </div>
        </div>
      } @else {
        <!-- Form -->
        <div class="dashboard-card">
          <div class="flex flex-col gap-5">
            <!-- Nome -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5" for="name">
                Nome e cognome <span class="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                class="tc-input-sm"
                placeholder="Es. Mario Rossi"
                [(ngModel)]="form.name"
              />
            </div>

            <!-- Telefono -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5" for="phone">
                Numero di telefono
                <span class="text-xs font-normal text-slate-400 ml-1">(per SMS)</span>
              </label>
              <input
                id="phone"
                type="tel"
                class="tc-input-sm"
                placeholder="+39 333 123 4567"
                [(ngModel)]="form.phone"
                inputmode="tel"
              />
            </div>

            <!-- Tipo visita -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">
                Motivo visita <span class="text-rose-500">*</span>
              </label>
              <select class="tc-select" [(ngModel)]="form.requestType">
                @for (opt of requestTypes; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>

            <!-- Medico -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">
                Medico <span class="text-rose-500">*</span>
              </label>
              <select class="tc-select" [(ngModel)]="form.doctorId">
                <option value="primo-disponibile">⚡ Primo medico disponibile</option>
                @for (doc of availableDoctors(); track doc.id) {
                  <option [value]="doc.id">{{ doc.name }} — {{ doc.specialty }}</option>
                }
              </select>
            </div>

            <!-- Nota interna -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5" for="note">
                Nota interna
                <span class="text-xs font-normal text-slate-400 ml-1">(visibile solo allo staff)</span>
              </label>
              <textarea
                id="note"
                class="tc-input-sm min-h-[80px] resize-none"
                placeholder="Es. Paziente con difficoltà motorie, preferisce la stanza al piano terra"
                [(ngModel)]="form.note"
                rows="3"
              ></textarea>
            </div>

            @if (error()) {
              <div class="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm font-semibold">
                {{ error() }}
              </div>
            }

            <div class="flex gap-3 pt-2">
              <tc-button variant="primary" size="lg" [fullWidth]="true" (clicked)="submit()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Aggiungi alla coda
              </tc-button>
              <tc-button variant="ghost" (clicked)="resetForm()">Cancella</tc-button>
            </div>
          </div>
        </div>

        <!-- Info card -->
        <div class="mt-4 bg-tc-50 border border-tc-200 rounded-2xl px-5 py-4">
          <div class="flex gap-3 items-start">
            <svg class="w-5 h-5 text-tc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-sm text-tc-700">
              <p class="font-bold mb-1">Inserimento manuale</p>
              <p>Il paziente verrà aggiunto in fondo alla coda. Puoi riordinare la coda nella sezione <strong>Coda live</strong> per casi urgenti.</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManualEntryComponent {
  private mockData = inject(MockDataService);

  form = {
    name: '',
    phone: '',
    requestType: 'visita' as RequestType,
    doctorId: 'primo-disponibile',
    note: '',
  };

  readonly confirmedBooking = signal<ReturnType<MockDataService['addToQueue']> | null>(null);
  readonly error = signal('');

  readonly requestTypes = Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => ({
    value: value as RequestType,
    label,
  }));

  readonly availableDoctors = this.mockData.doctors;

  getRequestLabel(type: RequestType): string {
    return REQUEST_TYPE_LABELS[type];
  }

  submit(): void {
    if (!this.form.name.trim()) {
      this.error.set('Inserisci il nome del paziente.');
      return;
    }
    this.error.set('');

    const doctors = this.mockData.doctors().filter(d => d.available);
    const doctor = this.form.doctorId === 'primo-disponibile'
      ? doctors[0]
      : doctors.find(d => d.id === this.form.doctorId) ?? doctors[0];

    const booking = this.mockData.addToQueue({
      patientName: this.form.name.trim(),
      phone: this.form.phone.trim() || '—',
      doctorId: doctor.id,
      doctorName: doctor.name,
      requestType: this.form.requestType,
      internalNote: this.form.note.trim() || undefined,
    });

    this.confirmedBooking.set(booking);
  }

  reset(): void {
    this.confirmedBooking.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.form = { name: '', phone: '', requestType: 'visita', doctorId: 'primo-disponibile', note: '' };
    this.error.set('');
  }

  print(): void {
    window.print();
  }
}
