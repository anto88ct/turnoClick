import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PLANS } from '../../core/models/plan.model';

@Component({
  selector: 'app-new-studio',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-5 max-w-3xl mx-auto">

      <div class="flex items-center gap-3 mb-6">
        <button (click)="router.navigate(['/admin/clienti'])"
                class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">Crea nuovo studio</h1>
          <p class="text-sm text-slate-500">Onboarding nuovo cliente TurnoClick</p>
        </div>
      </div>

      @if (!created()) {
        <div class="space-y-5">

          <!-- Credenziali -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 class="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
              Credenziali di accesso
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Email *</label>
                <input [(ngModel)]="form.email" type="email" class="tc-input-sm w-full" placeholder="studio@email.com">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Password temporanea *</label>
                <div class="relative">
                  <input [(ngModel)]="form.password" [type]="showPw() ? 'text' : 'password'"
                         class="tc-input-sm w-full pr-10" placeholder="Minimo 8 caratteri">
                  <button type="button" (click)="toggleShowPw()"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      @if (showPw()) {
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      } @else {
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      }
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-3 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
              <svg class="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-xs text-blue-700 font-medium">Struttura 2FA predisposta per futuro upgrade. L'autenticazione a doppio fattore potrà essere attivata dallo studio in autonomia.</p>
            </div>
          </div>

          <!-- Dati fiscali -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 class="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
              Dati fiscali
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Ragione Sociale *</label>
                <input [(ngModel)]="form.ragioneSociale" class="tc-input-sm w-full" placeholder="Studio Medico S.r.l.">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Partita IVA *</label>
                <input [(ngModel)]="form.partitaIva" class="tc-input-sm w-full font-mono" placeholder="IT12345678901">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Indirizzo</label>
                <input [(ngModel)]="form.address" class="tc-input-sm w-full" placeholder="Via Roma 1, Milano">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Codice SDI / PEC</label>
                <input [(ngModel)]="form.sdi" class="tc-input-sm w-full" placeholder="XXXXXXX">
              </div>
            </div>
          </div>

          <!-- Referente -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 class="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center flex-shrink-0">3</span>
              Referente / Titolare
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Nome completo *</label>
                <input [(ngModel)]="form.ownerName" class="tc-input-sm w-full" placeholder="Mario Rossi">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Telefono</label>
                <input [(ngModel)]="form.ownerPhone" type="tel" class="tc-input-sm w-full" placeholder="+39 333 0000000">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Email referente</label>
                <input [(ngModel)]="form.ownerEmail" type="email" class="tc-input-sm w-full" placeholder="dott.rossi@email.com">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Ruolo</label>
                <input [(ngModel)]="form.ownerRole" class="tc-input-sm w-full" placeholder="Titolare / Direttore Sanitario">
              </div>
            </div>
          </div>

          <!-- Piano -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 class="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span class="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center flex-shrink-0">4</span>
              Piano iniziale
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              @for (p of plans; track p.id) {
                <button type="button"
                        (click)="form.plan = p.id"
                        class="p-4 rounded-2xl border-2 text-center transition-all"
                        [class]="form.plan === p.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200'">
                  <p class="font-extrabold text-slate-900 text-sm">{{ p.name }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">€{{ p.priceMonthly }}/mese</p>
                </button>
              }
            </div>
          </div>

          <!-- Error -->
          @if (formError()) {
            <div class="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
              <p class="text-sm text-rose-700 font-semibold">{{ formError() }}</p>
            </div>
          }

          <!-- Submit -->
          <button (click)="createStudio()"
                  class="w-full py-4 rounded-2xl text-base font-extrabold text-white transition-all
                         hover:opacity-90 active:scale-98"
                  style="background-color: var(--brand)">
            Crea studio e invia credenziali
          </button>
        </div>

      } @else {
        <!-- Success -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
          <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <svg class="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-xl font-extrabold text-slate-900 mb-2">Studio creato!</h2>
          <p class="text-sm text-slate-500 mb-1">Le credenziali sono state inviate a <strong>{{ form.email }}</strong></p>
          <p class="text-xs text-slate-400 mb-6">Lo studio è ora visibile nella lista clienti.</p>
          <div class="flex gap-3 justify-center">
            <button (click)="resetForm()" class="px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Crea un altro
            </button>
            <button (click)="router.navigate(['/admin/clienti'])"
                    class="px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
                    style="background-color: var(--brand)">
              Vai alla lista clienti
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class NewStudioComponent {
  readonly router = inject(Router);
  readonly plans  = PLANS;

  readonly showPw    = signal(false);
  readonly created   = signal(false);
  readonly formError = signal('');

  form = {
    email: '', password: '',
    ragioneSociale: '', partitaIva: '', address: '', sdi: '',
    ownerName: '', ownerPhone: '', ownerEmail: '', ownerRole: '',
    plan: 'starter' as string,
  };

  toggleShowPw(): void { this.showPw.update(v => !v); }

  createStudio(): void {
    this.formError.set('');
    if (!this.form.email.trim()) { this.formError.set('Email obbligatoria.'); return; }
    if (!this.form.password || this.form.password.length < 8) { this.formError.set('Password minimo 8 caratteri.'); return; }
    if (!this.form.ragioneSociale.trim()) { this.formError.set('Ragione Sociale obbligatoria.'); return; }
    if (!this.form.ownerName.trim()) { this.formError.set('Nome referente obbligatorio.'); return; }
    // In production: call API to create studio
    this.created.set(true);
  }

  resetForm(): void {
    this.form = { email: '', password: '', ragioneSociale: '', partitaIva: '', address: '', sdi: '', ownerName: '', ownerPhone: '', ownerEmail: '', ownerRole: '', plan: 'starter' };
    this.created.set(false);
    this.formError.set('');
  }
}
