import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientAuthService } from '../auth/patient-auth.service';
import { PatientFamilyMember, FamilyRelation, RELATION_LABELS } from '../auth/patient-auth.model';

type PortalTab = 'profilo' | 'appuntamenti' | 'documenti' | 'famiglia' | 'elimina';

const MOCK_APPOINTMENTS = [
  { id: 'a1', date: '2026-05-15', time: '09:30', doctor: 'Dott. Marco Rossi', specialty: 'Medicina Generale', status: 'completato', note: 'Visita di controllo annuale' },
  { id: 'a2', date: '2026-04-02', time: '11:00', doctor: 'Dott.ssa Elena Conti', specialty: 'Cardiologia', status: 'completato', note: 'ECG di routine' },
  { id: 'a3', date: '2026-06-10', time: '15:00', doctor: 'Dott. Marco Rossi', specialty: 'Medicina Generale', status: 'prenotato', note: '' },
];

const MOCK_DOCUMENTS = [
  { id: 'd1', name: 'Referto ECG 02/04/2026.pdf', type: 'Referto', date: '2026-04-02', size: '420 KB' },
  { id: 'd2', name: 'Prescrizione Farmaci 15/05/2026.pdf', type: 'Prescrizione', date: '2026-05-15', size: '128 KB' },
  { id: 'd3', name: 'Esami del Sangue 10/01/2026.pdf', type: 'Esame', date: '2026-01-10', size: '892 KB' },
];

@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-[100dvh] bg-slate-50 flex flex-col">

      <!-- Header -->
      <header class="sticky top-9 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div class="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto w-full">
          <a [routerLink]="['/p', slug]" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors no-underline flex-shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-xs font-semibold hidden sm:inline">Torna al sito</span>
          </a>
          <div class="w-px h-5 bg-slate-200"></div>
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
                 style="background-color: var(--brand)">
              {{ userInitials() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-extrabold text-slate-900 truncate">{{ user()?.name }}</p>
              <p class="text-xs text-slate-400 truncate">Area Personale</p>
            </div>
          </div>
          <button (click)="logout()"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200
                         text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Esci
          </button>
        </div>
      </header>

      <div class="flex-1 max-w-4xl mx-auto w-full px-4 py-6">

        <!-- Tab Navigation -->
        <nav class="flex gap-1 bg-white rounded-2xl p-1 border border-slate-200 shadow-sm mb-6 overflow-x-auto no-scrollbar">
          @for (tab of tabs; track tab.id) {
            <button (click)="activeTab.set(tab.id)"
                    [class]="activeTab() === tab.id
                      ? 'bg-tc-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'"
                    class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0">
              <i [class]="tab.icon + ' text-xs'"></i>
              {{ tab.label }}
            </button>
          }
        </nav>

        <!-- ── PROFILO ──────────────────────────────────────────────────────── -->
        @if (activeTab() === 'profilo') {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 class="font-extrabold text-slate-800">I miei dati</h2>
              <button (click)="toggleEditMode()"
                      [class]="editMode() ? 'bg-slate-100 text-slate-600' : 'bg-tc-50 text-tc-700'"
                      class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                <i [class]="editMode() ? 'pi pi-times' : 'pi pi-pencil'"></i>
                {{ editMode() ? 'Annulla' : 'Modifica' }}
              </button>
            </div>
            <div class="p-6">
              @if (!editMode()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  @for (field of profileFields(); track field.label) {
                    <div class="bg-slate-50 rounded-xl px-4 py-3">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{{ field.label }}</p>
                      <p class="text-sm font-semibold text-slate-800">{{ field.value || '—' }}</p>
                    </div>
                  }
                </div>
              } @else {
                <form (submit)="saveProfile(); $event.preventDefault()" class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Nome completo *</label>
                      <input [(ngModel)]="editName" name="name" required class="tc-input-sm w-full" placeholder="Mario Rossi">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Email *</label>
                      <input [(ngModel)]="editEmail" name="email" type="email" required class="tc-input-sm w-full" placeholder="mario.rossi@email.com">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Telefono</label>
                      <input [(ngModel)]="editPhone" name="phone" type="tel" class="tc-input-sm w-full" placeholder="+39 340 1234567">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Data di nascita</label>
                      <input [(ngModel)]="editDateOfBirth" name="dob" type="date" class="tc-input-sm w-full">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Codice fiscale</label>
                      <input [(ngModel)]="editFiscalCode" name="cf" class="tc-input-sm w-full font-mono uppercase" placeholder="RSSMRA80A01H501Z">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Indirizzo</label>
                      <input [(ngModel)]="editAddress" name="address" class="tc-input-sm w-full" placeholder="Via Roma 1">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Città</label>
                      <input [(ngModel)]="editCity" name="city" class="tc-input-sm w-full" placeholder="Milano">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">CAP</label>
                      <input [(ngModel)]="editCap" name="cap" class="tc-input-sm w-full" placeholder="20100">
                    </div>
                  </div>
                  @if (saveError()) {
                    <p class="text-sm text-rose-600 font-semibold">{{ saveError() }}</p>
                  }
                  <div class="flex justify-end gap-3 pt-2">
                    <button type="button" (click)="editMode.set(false)" class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annulla</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style="background-color: var(--brand)">Salva modifiche</button>
                  </div>
                </form>
              }
            </div>
          </div>
        }

        <!-- ── APPUNTAMENTI ─────────────────────────────────────────────────── -->
        @if (activeTab() === 'appuntamenti') {
          <div class="space-y-4">
            @for (apt of appointments; track apt.id) {
              <div class="bg-white rounded-2xl border shadow-sm overflow-hidden"
                   [class]="apt.status === 'prenotato' ? 'border-tc-200' : 'border-slate-200'">
                <div class="flex items-center gap-4 px-5 py-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-extrabold"
                       [class]="apt.status === 'prenotato' ? 'bg-tc-100 text-tc-700' : 'bg-slate-100 text-slate-600'">
                    {{ formatAptDate(apt.date) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <p class="font-bold text-slate-800 text-sm truncate">{{ apt.doctor }}</p>
                      <span class="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                            [class]="apt.status === 'prenotato' ? 'bg-tc-100 text-tc-700' : 'bg-slate-100 text-slate-600'">
                        {{ apt.status === 'prenotato' ? 'Prenotato' : 'Completato' }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-400">{{ apt.specialty }} · {{ apt.time }}</p>
                    @if (apt.note) { <p class="text-xs text-slate-500 mt-1 italic">{{ apt.note }}</p> }
                  </div>
                </div>
              </div>
            }
            <a [routerLink]="['/p', slug, 'prenota']"
               class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-tc-300
                      text-sm font-bold transition-colors no-underline hover:bg-tc-50"
               style="color: var(--brand)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Prenota un nuovo appuntamento
            </a>
          </div>
        }

        <!-- ── DOCUMENTI ────────────────────────────────────────────────────── -->
        @if (activeTab() === 'documenti') {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 class="font-extrabold text-slate-800">I miei documenti</h2>
              <label class="cursor-pointer">
                <input type="file" class="sr-only" multiple (change)="onDocUpload($event)">
                <span class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-tc-300 text-tc-700 hover:bg-tc-50">
                  <i class="pi pi-upload"></i> Carica documento
                </span>
              </label>
            </div>
            <div class="divide-y divide-slate-100">
              @for (doc of documents(); track doc.id) {
                <div class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                  <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{{ doc.name }}</p>
                    <p class="text-xs text-slate-400">{{ doc.type }} · {{ doc.date }} · {{ doc.size }}</p>
                  </div>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button class="w-8 h-8 rounded-lg bg-tc-50 text-tc-600 flex items-center justify-center hover:bg-tc-100 transition-colors" title="Scarica">
                      <i class="pi pi-download text-xs"></i>
                    </button>
                    <button (click)="removeDoc(doc.id)" class="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors" title="Elimina">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              }
              @if (!documents().length) {
                <div class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <svg class="w-12 h-12 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="font-semibold text-sm text-slate-500">Nessun documento</p>
                  <p class="text-xs mt-1">Carica i tuoi referti e documenti medici</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- ── FAMIGLIA ─────────────────────────────────────────────────────── -->
        @if (activeTab() === 'famiglia') {
          <div class="space-y-4">
            <div class="bg-tc-50 border border-tc-200 rounded-2xl px-5 py-4">
              <p class="text-sm font-bold text-tc-800 mb-1">Prezzi agevolati per la famiglia</p>
              <p class="text-xs text-tc-700">Aggiungi i tuoi familiari per accedere a tariffe scontate e gestire i loro appuntamenti dal tuo profilo.</p>
            </div>

            @for (m of familyMembers(); track m.id) {
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold flex-shrink-0 text-sm">
                    {{ m.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-slate-800">{{ m.name }}</p>
                    <p class="text-xs text-slate-400">{{ relationLabel(m.relation) }} · {{ m.dateOfBirth || 'Data non specificata' }}</p>
                  </div>
                  <button (click)="removeMember(m.id)"
                          class="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors flex-shrink-0">
                    <i class="pi pi-trash text-xs"></i>
                  </button>
                </div>
              </div>
            }

            <!-- Add member form -->
            @if (showAddMember()) {
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 class="font-bold text-slate-800 mb-4 text-sm">Aggiungi familiare</h3>
                <div class="space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Nome completo *</label>
                      <input [(ngModel)]="newMemberName" class="tc-input-sm w-full" placeholder="Nome Cognome">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Relazione *</label>
                      <select [(ngModel)]="newMemberRelation" class="tc-select w-full">
                        @for (r of relations; track r.value) {
                          <option [value]="r.value">{{ r.label }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Data di nascita</label>
                      <input [(ngModel)]="newMemberDob" type="date" class="tc-input-sm w-full">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Codice fiscale</label>
                      <input [(ngModel)]="newMemberFiscalCode" class="tc-input-sm w-full font-mono uppercase" placeholder="RSSMRA80A01H501Z">
                    </div>
                  </div>
                  @if (memberError()) {
                    <p class="text-sm text-rose-600 font-semibold">{{ memberError() }}</p>
                  }
                  <div class="flex gap-3 pt-1">
                    <button (click)="showAddMember.set(false)" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annulla</button>
                    <button (click)="addMember()" class="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style="background-color: var(--brand)">Aggiungi</button>
                  </div>
                </div>
              </div>
            } @else {
              <button (click)="showAddMember.set(true); resetMemberForm()"
                      class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-slate-300
                             text-sm font-bold text-slate-500 hover:border-tc-300 hover:text-tc-600 hover:bg-tc-50 transition-colors">
                <i class="pi pi-user-plus"></i>
                Aggiungi familiare
              </button>
            }
          </div>
        }

        <!-- ── ELIMINA ACCOUNT ──────────────────────────────────────────────── -->
        @if (activeTab() === 'elimina') {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100">
              <h2 class="font-extrabold text-slate-800">Elimina il tuo account</h2>
              <p class="text-sm text-slate-500 mt-1">Questa azione è permanente e non può essere annullata.</p>
            </div>
            <div class="p-6">
              <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
                <p class="text-sm font-bold text-rose-700 mb-2">Attenzione: cosa verrà eliminato</p>
                <ul class="text-sm text-rose-600 space-y-1">
                  <li class="flex items-center gap-2"><i class="pi pi-times text-xs"></i> Il tuo profilo e tutti i tuoi dati personali</li>
                  <li class="flex items-center gap-2"><i class="pi pi-times text-xs"></i> L'accesso ai tuoi documenti medici</li>
                  <li class="flex items-center gap-2"><i class="pi pi-times text-xs"></i> I profili dei tuoi familiari registrati</li>
                  <li class="flex items-center gap-2"><i class="pi pi-times text-xs"></i> La cronologia dei tuoi appuntamenti</li>
                </ul>
              </div>

              @if (!deleteConfirm()) {
                <button (click)="deleteConfirm.set(true)"
                        class="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-colors">
                  <i class="pi pi-trash"></i>
                  Richiedi eliminazione account
                </button>
              } @else {
                <div class="space-y-4">
                  <p class="text-sm font-semibold text-slate-700">Per confermare, digita il tuo indirizzo email:</p>
                  <input [(ngModel)]="deleteEmailConfirm" type="email" class="tc-input-sm w-full"
                         [placeholder]="user()?.email || 'La tua email'">
                  @if (deleteError()) {
                    <p class="text-sm text-rose-600 font-semibold">{{ deleteError() }}</p>
                  }
                  <div class="flex gap-3">
                    <button (click)="deleteConfirm.set(false); deleteEmailConfirm = ''"
                            class="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annulla</button>
                    <button (click)="deleteAccount()"
                            class="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-sm font-bold text-white transition-colors">
                      Elimina definitivamente
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `,
})
export class PatientPortalComponent {
  private auth = inject(PatientAuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  get slug(): string { return this.route.snapshot.paramMap.get('slug') ?? 'studio-demo'; }

  readonly user = this.auth.currentUser;
  readonly activeTab = signal<PortalTab>('profilo');
  readonly editMode = signal(false);
  readonly showAddMember = signal(false);
  readonly deleteConfirm = signal(false);
  readonly saveError = signal('');
  readonly memberError = signal('');
  readonly deleteError = signal('');

  readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  });

  readonly familyMembers = computed(() => this.user()?.familyMembers ?? []);

  readonly tabs = [
    { id: 'profilo' as PortalTab,       label: 'Profilo',     icon: 'pi pi-user' },
    { id: 'appuntamenti' as PortalTab,  label: 'Appuntamenti',icon: 'pi pi-calendar' },
    { id: 'documenti' as PortalTab,     label: 'Documenti',   icon: 'pi pi-file' },
    { id: 'famiglia' as PortalTab,      label: 'Famiglia',    icon: 'pi pi-users' },
    { id: 'elimina' as PortalTab,       label: 'Elimina',     icon: 'pi pi-trash' },
  ];

  readonly relations: { value: FamilyRelation; label: string }[] = [
    { value: 'coniuge',  label: 'Coniuge' },
    { value: 'figlio',   label: 'Figlio' },
    { value: 'figlia',   label: 'Figlia' },
    { value: 'padre',    label: 'Padre' },
    { value: 'madre',    label: 'Madre' },
    { value: 'fratello', label: 'Fratello' },
    { value: 'sorella',  label: 'Sorella' },
    { value: 'altro',    label: 'Altro' },
  ];

  readonly appointments = MOCK_APPOINTMENTS;

  // Profile edit fields
  editName = '';
  editEmail = '';
  editPhone = '';
  editDateOfBirth = '';
  editFiscalCode = '';
  editAddress = '';
  editCity = '';
  editCap = '';

  // Family member form
  newMemberName = '';
  newMemberRelation: FamilyRelation = 'coniuge';
  newMemberDob = '';
  newMemberFiscalCode = '';

  // Documents
  private _documents = signal([...MOCK_DOCUMENTS]);
  readonly documents = this._documents.asReadonly();

  // Delete
  deleteEmailConfirm = '';

  constructor() {
    if (!this.auth.currentUser()) {
      this.router.navigate(['/p', this.slug]);
      return;
    }
    this.syncEditFields();
  }

  private syncEditFields(): void {
    const u = this.user();
    if (!u) return;
    this.editName = u.name;
    this.editEmail = u.email;
    this.editPhone = u.phone;
    this.editDateOfBirth = u.dateOfBirth;
    this.editFiscalCode = u.fiscalCode;
    this.editAddress = u.address;
    this.editCity = u.city;
    this.editCap = u.cap;
  }

  readonly profileFields = computed(() => {
    const u = this.user();
    if (!u) return [];
    return [
      { label: 'Nome completo',  value: u.name },
      { label: 'Email',          value: u.email },
      { label: 'Telefono',       value: u.phone },
      { label: 'Data di nascita',value: u.dateOfBirth },
      { label: 'Codice fiscale', value: u.fiscalCode },
      { label: 'Indirizzo',      value: u.address },
      { label: 'Città',          value: u.city },
      { label: 'CAP',            value: u.cap },
    ];
  });

  toggleEditMode(): void { this.editMode.update(v => !v); }

  saveProfile(): void {
    this.saveError.set('');
    if (!this.editName.trim() || !this.editEmail.trim()) {
      this.saveError.set('Nome e email sono obbligatori.');
      return;
    }
    this.auth.updateProfile({
      name: this.editName.trim(),
      email: this.editEmail.trim().toLowerCase(),
      phone: this.editPhone.trim(),
      dateOfBirth: this.editDateOfBirth,
      fiscalCode: this.editFiscalCode.trim().toUpperCase(),
      address: this.editAddress.trim(),
      city: this.editCity.trim(),
      cap: this.editCap.trim(),
    });
    this.editMode.set(false);
  }

  addMember(): void {
    this.memberError.set('');
    if (!this.newMemberName.trim()) {
      this.memberError.set('Il nome è obbligatorio.');
      return;
    }
    this.auth.addFamilyMember({
      name: this.newMemberName.trim(),
      relation: this.newMemberRelation,
      dateOfBirth: this.newMemberDob,
      fiscalCode: this.newMemberFiscalCode.trim().toUpperCase(),
    });
    this.showAddMember.set(false);
    this.resetMemberForm();
  }

  removeMember(id: string): void {
    this.auth.removeFamilyMember(id);
  }

  resetMemberForm(): void {
    this.newMemberName = '';
    this.newMemberRelation = 'coniuge';
    this.newMemberDob = '';
    this.newMemberFiscalCode = '';
    this.memberError.set('');
  }

  onDocUpload(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    files.forEach(f => {
      this._documents.update(docs => [...docs, {
        id: `d-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        type: 'Documento',
        date: new Date().toISOString().split('T')[0],
        size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      }]);
    });
    (event.target as HTMLInputElement).value = '';
  }

  removeDoc(id: string): void {
    this._documents.update(docs => docs.filter(d => d.id !== id));
  }

  deleteAccount(): void {
    this.deleteError.set('');
    if (this.deleteEmailConfirm.toLowerCase() !== this.user()?.email?.toLowerCase()) {
      this.deleteError.set('L\'email non corrisponde. Riprova.');
      return;
    }
    this.auth.deleteAccount();
    this.router.navigate(['/p', this.slug]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/p', this.slug]);
  }

  relationLabel(r: FamilyRelation): string { return RELATION_LABELS[r] ?? r; }

  formatAptDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  }
}
