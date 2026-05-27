import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { DoctorAvailability } from '../../core/models/doctor-hub.model';

@Component({
  selector: 'app-medico-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900">Calendario Disponibilità</h2>
          <p class="text-sm text-slate-400 mt-0.5">Gestisci ferie, assenze e fasce di reperibilità</p>
        </div>
        <button
          (click)="openForm()"
          class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-tc-500 hover:bg-tc-600 text-white text-sm font-bold transition-all shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Aggiungi Periodo
        </button>
      </div>

      <!-- Upcoming availabilities -->
      @if (myAvailabilities().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center text-slate-400">
          <svg class="w-12 h-12 mx-auto opacity-25 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p class="font-semibold text-sm">Nessun periodo pianificato</p>
          <p class="text-xs mt-1">Clicca "Aggiungi Periodo" per inserire ferie, assenze o reperibilità</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (av of myAvailabilities(); track av.id) {
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-4">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" [class]="typeBg(av.type)">
                <svg class="w-6 h-6" [class]="typeIcon(av.type).cls" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="typeIcon(av.type).path"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full" [class]="typeBadge(av.type)">{{ typeLabel(av.type) }}</span>
                  <span class="text-sm font-extrabold text-slate-800">{{ formatDateRange(av) }}</span>
                </div>
                @if (av.timeFrom || av.timeTo) {
                  <p class="text-xs text-slate-500 font-semibold mb-1">
                    <svg class="w-3 h-3 inline-block mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Fascia oraria: {{ av.timeFrom ?? '—' }} → {{ av.timeTo ?? '—' }}
                  </p>
                }
                @if (av.note) {
                  <p class="text-xs text-slate-500 italic">{{ av.note }}</p>
                }
              </div>
              <div class="flex gap-1 flex-shrink-0">
                <button
                  (click)="editForm(av)"
                  class="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  (click)="deleteAvailability(av.id)"
                  class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-500 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- All-doctors view -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-50">
          <h3 class="text-sm font-extrabold text-slate-900">Disponibilità Colleghi</h3>
          <p class="text-xs text-slate-400 mt-0.5">Panoramica dei periodi pianificati di tutti i medici</p>
        </div>
        <div class="divide-y divide-slate-50">
          @for (doc of otherDoctors(); track doc.id) {
            @if (avForDoctor(doc.id).length > 0) {
              <div class="px-5 py-3.5">
                <div class="flex items-center gap-3 mb-2">
                  <img [src]="doc.photoUrl" [alt]="doc.name" class="w-7 h-7 rounded-full object-cover" />
                  <p class="text-sm font-bold text-slate-700">{{ doc.name }}</p>
                </div>
                <div class="space-y-1 ml-10">
                  @for (av of avForDoctor(doc.id); track av.id) {
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-0.5 rounded-full font-bold" [class]="typeBadge(av.type)">{{ typeLabel(av.type) }}</span>
                      <span class="text-xs text-slate-500">{{ formatDateRange(av) }}</span>
                      @if (av.note) {
                        <span class="text-xs text-slate-400 italic">— {{ av.note }}</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
          @if (noColleagueAv()) {
            <div class="px-6 py-6 text-center text-slate-400 text-sm">Nessun collega ha periodi pianificati</div>
          }
        </div>
      </div>
    </div>

    <!-- Modal form -->
    @if (showForm()) {
      <div class="fixed inset-0 bg-black/40 z-40" (click)="closeForm()"></div>
      <div class="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl shadow-2xl max-w-lg mx-auto overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900">{{ editingId() ? 'Modifica Periodo' : 'Nuovo Periodo' }}</h3>
          <button (click)="closeForm()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Tipo</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              @for (t of types; track t.value) {
                <button
                  type="button"
                  (click)="form.type = t.value"
                  class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-xs font-bold transition-all"
                  [class]="form.type === t.value
                    ? t.activeClass
                    : 'border-slate-100 text-slate-500 hover:border-slate-200'"
                >
                  <span>{{ t.emoji }}</span>
                  {{ t.label }}
                </button>
              }
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-slate-600 block mb-1.5">Data inizio</label>
              <input type="date" [(ngModel)]="form.dateFrom" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-tc-400 focus:ring-2 focus:ring-tc-100 focus:outline-none" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-600 block mb-1.5">Data fine</label>
              <input type="date" [(ngModel)]="form.dateTo" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-tc-400 focus:ring-2 focus:ring-tc-100 focus:outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-slate-600 block mb-1.5">Dalle (opzionale)</label>
              <input type="time" [(ngModel)]="form.timeFrom" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-tc-400 focus:ring-2 focus:ring-tc-100 focus:outline-none" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-600 block mb-1.5">Alle (opzionale)</label>
              <input type="time" [(ngModel)]="form.timeTo" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-tc-400 focus:ring-2 focus:ring-tc-100 focus:outline-none" />
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600 block mb-1.5">Note (opzionale)</label>
            <textarea [(ngModel)]="form.note" rows="2" placeholder="Es: Coprire le urgenze con Dott. Ferrari..."
                      class="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-tc-400 focus:ring-2 focus:ring-tc-100 focus:outline-none"></textarea>
          </div>
          <div class="flex gap-2 justify-end pt-2">
            <button (click)="closeForm()"
                    class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">
              Annulla
            </button>
            <button (click)="saveForm()"
                    [disabled]="!form.dateFrom || !form.dateTo"
                    class="px-4 py-2 rounded-xl bg-tc-500 hover:bg-tc-600 disabled:opacity-40 text-white text-sm font-bold transition-all">
              {{ editingId() ? 'Salva Modifiche' : 'Aggiungi Periodo' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MedicoCalendarioComponent {
  private readonly mockData = inject(MockDataService);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly activeDoctorId = this.mockData.activeDoctorId;
  readonly doctors = this.mockData.doctors;

  readonly myAvailabilities = computed(() =>
    this.mockData.availabilitiesForDoctor(this.activeDoctorId())()
  );

  readonly otherDoctors = computed(() =>
    this.doctors().filter(d => d.id !== this.activeDoctorId())
  );

  readonly noColleagueAv = computed(() =>
    this.otherDoctors().every(d => this.avForDoctor(d.id).length === 0)
  );

  form: Omit<DoctorAvailability, 'id' | 'doctorId'> = this.emptyForm();

  readonly types = [
    { value: 'ferie' as const, label: 'Ferie', emoji: '🏖️', activeClass: 'border-sky-400 bg-sky-50 text-sky-700' },
    { value: 'assente' as const, label: 'Assente', emoji: '🚫', activeClass: 'border-rose-400 bg-rose-50 text-rose-700' },
    { value: 'reperibile' as const, label: 'Reperibile', emoji: '📞', activeClass: 'border-amber-400 bg-amber-50 text-amber-700' },
    { value: 'disponibile' as const, label: 'Disponibile', emoji: '✅', activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  ];

  avForDoctor(doctorId: string): DoctorAvailability[] {
    return this.mockData.availabilitiesForDoctor(doctorId)();
  }

  openForm(): void {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  editForm(av: DoctorAvailability): void {
    this.form = { type: av.type, dateFrom: av.dateFrom, dateTo: av.dateTo, timeFrom: av.timeFrom, timeTo: av.timeTo, note: av.note };
    this.editingId.set(av.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveForm(): void {
    if (!this.form.dateFrom || !this.form.dateTo) return;
    const id = this.editingId();
    if (id) {
      this.mockData.updateDoctorAvailability({ ...this.form, id, doctorId: this.activeDoctorId() });
    } else {
      this.mockData.addDoctorAvailability({ ...this.form, doctorId: this.activeDoctorId() });
    }
    this.closeForm();
  }

  deleteAvailability(id: string): void {
    if (confirm('Eliminare questo periodo?')) {
      this.mockData.deleteDoctorAvailability(id);
    }
  }

  emptyForm(): Omit<DoctorAvailability, 'id' | 'doctorId'> {
    const today = new Date().toISOString().split('T')[0];
    return { type: 'ferie', dateFrom: today, dateTo: today, timeFrom: '', timeTo: '', note: '' };
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      ferie: 'Ferie', assente: 'Assente', reperibile: 'Reperibile', disponibile: 'Disponibile',
    };
    return map[type] ?? type;
  }

  typeBadge(type: string): string {
    const map: Record<string, string> = {
      ferie: 'bg-sky-100 text-sky-700',
      assente: 'bg-rose-100 text-rose-700',
      reperibile: 'bg-amber-100 text-amber-700',
      disponibile: 'bg-emerald-100 text-emerald-700',
    };
    return map[type] ?? 'bg-slate-100 text-slate-600';
  }

  typeBg(type: string): string {
    const map: Record<string, string> = {
      ferie: 'bg-sky-50', assente: 'bg-rose-50', reperibile: 'bg-amber-50', disponibile: 'bg-emerald-50',
    };
    return map[type] ?? 'bg-slate-50';
  }

  typeIcon(type: string): { path: string; cls: string } {
    const map: Record<string, { path: string; cls: string }> = {
      ferie: {
        cls: 'text-sky-500',
        path: 'M12 3v1m0 16v1m8.66-10h-1M4.34 12h-1m15.07-6.07l-.71.71M6.34 17.66l-.71.71m12.02 0l-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z',
      },
      assente: {
        cls: 'text-rose-500',
        path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      reperibile: {
        cls: 'text-amber-500',
        path: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      },
      disponibile: {
        cls: 'text-emerald-500',
        path: 'M5 13l4 4L19 7',
      },
    };
    return map[type] ?? map['disponibile'];
  }

  formatDateRange(av: DoctorAvailability): string {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const from = new Date(av.dateFrom).toLocaleDateString('it-IT', opts);
    const to = new Date(av.dateTo).toLocaleDateString('it-IT', opts);
    return av.dateFrom === av.dateTo ? from : `${from} → ${to}`;
  }
}
