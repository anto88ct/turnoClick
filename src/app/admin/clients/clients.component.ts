import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Studio } from '../../core/models/studio.model';
import { PlanType } from '../../core/models/plan.model';
import { TcBadgeComponent } from '../../shared/tc-badge/tc-badge.component';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, TcBadgeComponent, TcButtonComponent],
  template: `
    <div class="p-5 max-w-screen-xl mx-auto">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="page-header">Studi clienti</h1>
          <p class="page-subheader">{{ studios().length }} studi registrati sulla piattaforma</p>
        </div>
        <tc-button variant="primary">+ Crea studio manuale</tc-button>
      </div>

      <!-- Filters -->
      <div class="dashboard-card mb-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" class="tc-input-sm pl-9" placeholder="Cerca studio..." [(ngModel)]="searchQuery"/>
          </div>
          <select class="tc-select" [(ngModel)]="filterStatus">
            <option value="">Tutti gli stati</option>
            <option value="attivo">Attivi</option>
            <option value="sospeso">Sospesi</option>
            <option value="prova">In prova</option>
          </select>
          <select class="tc-select" [(ngModel)]="filterPlan">
            <option value="">Tutti i piani</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="dashboard-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-tc-border bg-slate-50/50">
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Studio</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Piano</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Stato</th>
                <th class="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Medici</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">SMS</th>
                <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Scadenza</th>
                <th class="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              @for (s of filtered(); track s.id) {
                <tr class="border-b border-tc-border/50 hover:bg-tc-50/30 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-extrabold"
                           [style.background-color]="s.primaryColor">
                        {{ s.name.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900">{{ s.name }}</p>
                        <p class="text-xs text-slate-400 font-mono">turnoclick.it/{{ s.slug }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <tc-badge [variant]="s.plan" />
                  </td>
                  <td class="py-3.5 px-4 hidden md:table-cell">
                    <tc-badge [variant]="s.status" />
                  </td>
                  <td class="py-3.5 px-4 text-right font-semibold text-slate-700 hidden lg:table-cell">
                    {{ s.doctorCount }}
                  </td>
                  <td class="py-3.5 px-4 hidden lg:table-cell">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
                        <div class="h-1.5 rounded-full bg-tc-500"
                             [style.width.%]="s.smsUsedThisMonth / s.smsLimit * 100"></div>
                      </div>
                      <span class="text-xs text-slate-500 whitespace-nowrap">{{ s.smsUsedThisMonth }}/{{ s.smsLimit }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-500 hidden xl:table-cell">
                    @if (s.status === 'prova') {
                      <span class="text-amber-600 font-semibold">{{ formatDate(s.planExpiry) }}</span>
                    } @else {
                      {{ formatDate(s.planExpiry) }}
                    }
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-1.5 justify-center">
                      <tc-button
                        size="sm"
                        [variant]="s.status === 'attivo' ? 'danger' : 'secondary'"
                        (clicked)="toggleStatus(s.id)"
                      >
                        {{ s.status === 'attivo' ? 'Sospendi' : 'Attiva' }}
                      </tc-button>
                      <div class="relative">
                        <select
                          class="tc-select text-xs py-1.5 px-2 pr-6 appearance-none"
                          [value]="s.plan"
                          (change)="changePlan(s.id, $event)"
                        >
                          <option value="free">Free</option>
                          <option value="starter">Starter</option>
                          <option value="professional">Professional</option>
                          <option value="business">Business</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-10 text-slate-400 font-semibold">
                    Nessuno studio trovato
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ClientsComponent {
  private mockData = inject(MockDataService);
  readonly studios = this.mockData.studios;

  searchQuery = '';
  filterStatus = '';
  filterPlan = '';

  readonly filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.studios().filter(s => {
      if (q && !s.name.toLowerCase().includes(q) && !s.slug.toLowerCase().includes(q)) return false;
      if (this.filterStatus && s.status !== this.filterStatus) return false;
      if (this.filterPlan && s.plan !== this.filterPlan) return false;
      return true;
    });
  });

  toggleStatus(id: string): void {
    this.mockData.toggleStudioStatus(id);
  }

  changePlan(id: string, event: Event): void {
    const plan = (event.target as HTMLSelectElement).value as PlanType;
    this.mockData.changeStudioPlan(id, plan);
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
}
