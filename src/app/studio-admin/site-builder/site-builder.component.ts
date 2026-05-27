import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { NgStyle, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';
import { SiteBlockRendererComponent } from '../../shared/site-block-renderer/site-block-renderer.component';
import {
  SiteBlock, SiteBlockType, SitePageConfig, PublicViewConfig,
  TextBlockConfig, ImageBlockConfig, GalleryBlockConfig, VideoBlockConfig,
  MapBlockConfig, PhoneButtonConfig, SpacerBlockConfig, HeroBlockConfig, DividerBlockConfig
} from '../../core/models/site-builder.model';

interface BlockCategoryItem {
  type: SiteBlockType;
  label: string;
  desc: string;
  icon: string;
}
interface BlockCategory {
  label: string;
  icon: string;
  items: BlockCategoryItem[];
}
interface CtxMenu { x: number; y: number; blockId: string; }

@Component({
  selector: 'app-site-builder',
  standalone: true,
  imports: [NgStyle, NgClass, FormsModule, DragDropModule, TcButtonComponent, SiteBlockRendererComponent],
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative" (click)="closeCtx()">

      <!-- Toast -->
      @if (toastVisible()) {
        <div class="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
                    text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-bold
                    animate-slide-in-down pointer-events-none"
             style="background-color: var(--brand)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Sito salvato con successo!
        </div>
      }

      <!-- Delete confirm modal -->
      @if (deleteConfirmId()) {
        <div class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4" (click)="$event.stopPropagation()">
          <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div class="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 text-center mb-1">Elimina blocco?</h3>
            <p class="text-sm text-slate-500 text-center mb-5">Questa azione non può essere annullata.</p>
            <div class="flex gap-3">
              <button (click)="deleteConfirmId.set(null)" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Annulla</button>
              <button (click)="confirmDelete()" class="flex-1 py-2.5 rounded-xl bg-rose-500 text-sm font-bold text-white hover:bg-rose-600">Elimina</button>
            </div>
          </div>
        </div>
      }

      <!-- Context Menu -->
      @if (ctxMenu(); as m) {
        <div class="fixed inset-0 z-[60]" (click)="closeCtx(); $event.stopPropagation()"></div>
        <div class="fixed z-[60] bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 min-w-[190px] overflow-hidden"
             [ngStyle]="{ left: m.x + 'px', top: m.y + 'px' }"
             (click)="$event.stopPropagation()">
          <button (click)="ctxAction('edit', m)" class="ctx-item">
            <i class="pi pi-pencil w-4 text-center"></i> Modifica
          </button>
          <button (click)="ctxAction('duplicate', m)" class="ctx-item">
            <i class="pi pi-copy w-4 text-center"></i> Duplica
          </button>
          <div class="h-px bg-slate-100 my-1 mx-3"></div>
          <button (click)="ctxAction('up', m)" [disabled]="isFirst(m.blockId)"
                  class="ctx-item disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="pi pi-arrow-up w-4 text-center"></i> Sposta su
          </button>
          <button (click)="ctxAction('down', m)" [disabled]="isLast(m.blockId)"
                  class="ctx-item disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="pi pi-arrow-down w-4 text-center"></i> Sposta giù
          </button>
          <div class="h-px bg-slate-100 my-1 mx-3"></div>
          <button (click)="ctxAction('toggle', m)"
                  [class]="isDisabled(m.blockId) ? 'ctx-item text-emerald-600' : 'ctx-item text-amber-600'">
            <i [class]="'w-4 text-center ' + (isDisabled(m.blockId) ? 'pi pi-eye' : 'pi pi-eye-slash')"></i>
            {{ isDisabled(m.blockId) ? 'Attiva blocco' : 'Disattiva blocco' }}
          </button>
          <div class="h-px bg-slate-100 my-1 mx-3"></div>
          <button (click)="ctxAction('delete', m)" class="ctx-item text-rose-600 hover:bg-rose-50">
            <i class="pi pi-trash w-4 text-center"></i> Elimina
          </button>
        </div>
      }

      <!-- Toolbar -->
      <div class="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm z-10">
        <div class="px-4 py-3 flex items-center gap-2">
          <!-- Add Block Toggle -->
          <button (click)="togglePicker($event)"
                  [class]="showPicker() ? 'bg-tc-500 text-white border-tc-500 shadow-tc' : 'border-slate-200 text-slate-700 hover:bg-tc-50 hover:border-tc-300'"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all flex-shrink-0">
            <i [class]="showPicker() ? 'pi pi-times' : 'pi pi-plus-circle'"></i>
            <span class="hidden sm:inline">{{ showPicker() ? 'Chiudi' : 'Aggiungi Blocco' }}</span>
            <span class="sm:hidden">{{ showPicker() ? 'Chiudi' : 'Blocco' }}</span>
          </button>

          <div class="w-px h-5 bg-slate-200 flex-shrink-0 mx-1"></div>

          <!-- Preview mode -->
          <div class="flex gap-1 flex-shrink-0">
            <button (click)="mobilePreview.set(false)"
                    [class]="!mobilePreview() ? 'bg-tc-100 text-tc-600 border-tc-300' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors">
              <i class="pi pi-desktop"></i>
              <span class="hidden sm:inline">Desktop</span>
            </button>
            <button (click)="mobilePreview.set(true)"
                    [class]="mobilePreview() ? 'bg-tc-100 text-tc-600 border-tc-300' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors">
              <i class="pi pi-mobile"></i>
              <span class="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <div class="w-px h-5 bg-slate-200 flex-shrink-0 mx-1"></div>

          <!-- Theme -->
          <button (click)="toggleThemePanel($event)"
                  [class]="showThemePanel() ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex-shrink-0">
            <i class="pi pi-palette"></i>
            <span class="hidden sm:inline">Tema</span>
          </button>

          <!-- Public View Config -->
          <button (click)="togglePublicViewPanel($event)"
                  [class]="showPublicViewPanel() ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex-shrink-0">
            <i class="pi pi-eye"></i>
            <span class="hidden sm:inline">Vista pubblica</span>
          </button>

          <div class="flex-1"></div>

          <!-- Block count + disabled badge -->
          <div class="hidden sm:flex items-center gap-2 flex-shrink-0">
            <span class="text-xs text-slate-400">{{ blocks().length }} blocchi</span>
            @if (disabledCount() > 0) {
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {{ disabledCount() }} disabilitati
              </span>
            }
          </div>

          <!-- Save -->
          <tc-button variant="primary" size="sm" (clicked)="savePage()">
            <i class="pi pi-save mr-1"></i>Salva
          </tc-button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-hidden flex relative">

        <!-- Block Picker Panel (left) -->
        <div [class]="showPicker() ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden'"
             class="bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 z-20 overflow-y-auto">
          <div class="p-4 w-72">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-extrabold text-slate-800 text-sm">Aggiungi un blocco</h3>
              <button (click)="showPicker.set(false)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>

            @for (cat of blockCategories; track cat.label) {
              <div class="mb-5">
                <div class="flex items-center gap-2 mb-2.5">
                  <i [class]="cat.icon + ' text-slate-400 text-xs'"></i>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ cat.label }}</p>
                </div>
                <div class="space-y-1.5">
                  @for (item of cat.items; track item.type) {
                    <button (click)="addBlock(item.type)"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200
                                   hover:border-tc-400 hover:bg-tc-50 text-left transition-all group">
                      <div class="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-tc-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <i [class]="item.icon + ' text-slate-500 group-hover:text-tc-600 text-sm transition-colors'"></i>
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-slate-800">{{ item.label }}</p>
                        <p class="text-xs text-slate-400 leading-snug">{{ item.desc }}</p>
                      </div>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Canvas -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-6 pl-8 sm:pl-10 flex justify-center bg-slate-100/50"
             (click)="selectedBlockId.set(null); showPicker.set(false)">

          <div [class]="mobilePreview()
            ? 'w-[375px] max-w-full border-x border-slate-300 shadow-2xl bg-white min-h-[812px] rounded-[2rem] overflow-hidden flex-shrink-0'
            : 'w-full max-w-4xl bg-white shadow-lg rounded-2xl min-h-[500px]'">

            @if (mobilePreview()) {
              <div class="h-7 bg-slate-900 w-full flex justify-center items-end pb-1">
                <div class="w-1/3 h-4 bg-slate-900 rounded-b-xl border border-slate-700"></div>
              </div>
              <div class="h-5 bg-white w-full flex justify-center pt-1">
                <div class="w-1/4 h-3 bg-slate-200 rounded-full"></div>
              </div>
            }

            <div cdkDropList [cdkDropListData]="blocks()" (cdkDropListDropped)="drop($event)" class="min-h-[200px]">

              @if (blocks().length === 0) {
                <div class="flex flex-col items-center justify-center h-64 text-slate-400
                            border-2 border-dashed border-slate-200 m-8 rounded-2xl">
                  <i class="pi pi-box text-4xl mb-3 text-slate-300"></i>
                  <p class="font-bold text-slate-500">Pagina vuota</p>
                  <p class="text-xs mt-1">Clicca "Aggiungi Blocco" nella toolbar.</p>
                </div>
              }

              @for (block of blocks(); track block.id; let first = $first; let last = $last) {
                <div cdkDrag
                     class="group relative border-[3px] border-transparent hover:border-tc-200
                            transition-all rounded-xl mb-1 cursor-pointer"
                     [ngClass]="{
                       'border-tc-500': selectedBlockId() === block.id,
                       'opacity-50 grayscale': block.disabled
                     }"
                     (click)="selectBlock(block.id, $event)"
                     (contextmenu)="onCtxMenu($event, block.id)">

                  <!-- Disabled overlay label -->
                  @if (block.disabled) {
                    <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div class="bg-slate-900/70 backdrop-blur-sm text-white text-xs font-bold
                                  px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <i class="pi pi-eye-slash text-xs"></i>
                        Disabilitato — non visibile sul sito
                      </div>
                    </div>
                  }

                  <!-- Drag handle -->
                  <div cdkDragHandle
                       class="absolute -left-7 top-1/2 -translate-y-1/2 w-6 h-10
                              bg-white border border-slate-200 rounded-lg shadow-sm
                              flex flex-col items-center justify-center gap-0.5
                              opacity-0 group-hover:opacity-100 transition-opacity
                              cursor-grab active:cursor-grabbing z-20">
                    <div class="w-3 h-px bg-slate-400 rounded"></div>
                    <div class="w-3 h-px bg-slate-400 rounded"></div>
                    <div class="w-3 h-px bg-slate-400 rounded"></div>
                  </div>

                  <!-- Type label -->
                  <div class="absolute -top-3 left-3 px-2 py-0.5 text-white text-[9px]
                              font-black uppercase tracking-widest rounded-full
                              opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
                       [class]="block.disabled ? 'bg-slate-500 !opacity-100' : 'bg-tc-500'"
                       [class.!opacity-100]="selectedBlockId() === block.id">
                    {{ getBlockLabel(block.type) }}{{ block.disabled ? ' · Disabilitato' : '' }}
                  </div>

                  <!-- Actions overlay -->
                  <div class="absolute top-2 right-2 bg-white rounded-xl shadow-md
                              border border-slate-200 p-1 flex gap-0.5
                              opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button (click)="moveBlock(block.id, -1, $event)" [disabled]="first"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100
                                   text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Sposta su">
                      <i class="pi pi-arrow-up text-xs"></i>
                    </button>
                    <button (click)="moveBlock(block.id, 1, $event)" [disabled]="last"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100
                                   text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Sposta giù">
                      <i class="pi pi-arrow-down text-xs"></i>
                    </button>
                    <div class="w-px h-5 bg-slate-200 mx-0.5 my-auto"></div>
                    <button (click)="toggleDisabled(block.id, $event)"
                            [class]="block.disabled
                              ? 'hover:bg-emerald-50 text-emerald-600'
                              : 'hover:bg-amber-50 text-amber-500'"
                            class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                            [title]="block.disabled ? 'Attiva blocco' : 'Disattiva blocco'">
                      <i [class]="'text-xs ' + (block.disabled ? 'pi pi-eye' : 'pi pi-eye-slash')"></i>
                    </button>
                    <button (click)="duplicateBlock(block.id, $event)"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Duplica">
                      <i class="pi pi-copy text-xs"></i>
                    </button>
                    <button (click)="requestDelete(block.id, $event)"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" title="Elimina">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>

                  <!-- Rendered block -->
                  <div class="pointer-events-none select-none">
                    <app-site-block-renderer [block]="block"></app-site-block-renderer>
                  </div>

                  @if (selectedBlockId() === block.id) {
                    <div class="absolute inset-0 bg-tc-500/3 pointer-events-none rounded-lg"></div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Properties Sidebar (right) -->
        <aside class="w-80 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0
                      transition-transform duration-300
                      absolute right-0 top-0 h-full shadow-2xl
                      lg:relative lg:shadow-none z-30"
               [class.translate-x-full]="!selectedBlock() && !showThemePanel() && !showPublicViewPanel()"
               [class.lg:translate-x-0]="true">

          @if (showPublicViewPanel()) {
            <div class="p-5">
              <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <i class="pi pi-eye text-sm"></i>
                  </div>
                  <div>
                    <h3 class="font-extrabold text-slate-800 leading-tight">Vista pubblica</h3>
                    <p class="text-[10px] text-slate-400">Cosa vede il paziente</p>
                  </div>
                </div>
                <button (click)="showPublicViewPanel.set(false)" class="text-slate-400 hover:text-slate-700 p-1">
                  <i class="pi pi-times"></i>
                </button>
              </div>

              <div class="space-y-3">

                <!-- Coda live -->
                <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div class="min-w-0 pr-3">
                    <p class="text-xs font-bold text-slate-700">Stato coda live</p>
                    <p class="text-[10px] text-slate-400 leading-snug mt-0.5">Mostra widget con n° in attesa e tempo medio</p>
                  </div>
                  <button (click)="togglePvcField('showQueueStatus')"
                          [class]="publicViewConfig().showQueueStatus ? 'bg-emerald-500' : 'bg-slate-300'"
                          class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0">
                    <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          [class]="publicViewConfig().showQueueStatus ? 'left-5' : 'left-0.5'"></span>
                  </button>
                </div>

                <!-- Entra in coda -->
                <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div class="min-w-0 pr-3">
                    <p class="text-xs font-bold text-slate-700">Entra in coda</p>
                    <p class="text-[10px] text-slate-400 leading-snug mt-0.5">Permetti al paziente di accodarsi dal sito</p>
                  </div>
                  <button (click)="togglePvcField('allowJoinQueue')"
                          [class]="publicViewConfig().allowJoinQueue ? 'bg-emerald-500' : 'bg-slate-300'"
                          class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0">
                    <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          [class]="publicViewConfig().allowJoinQueue ? 'left-5' : 'left-0.5'"></span>
                  </button>
                </div>

                <!-- Prenotazione online -->
                <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div class="min-w-0 pr-3">
                    <p class="text-xs font-bold text-slate-700">Prenotazione online</p>
                    <p class="text-[10px] text-slate-400 leading-snug mt-0.5">Consenti prenotazione (richiede accesso/registrazione)</p>
                  </div>
                  <button (click)="togglePvcField('allowBookAppointment')"
                          [class]="publicViewConfig().allowBookAppointment ? 'bg-emerald-500' : 'bg-slate-300'"
                          class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0">
                    <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          [class]="publicViewConfig().allowBookAppointment ? 'left-5' : 'left-0.5'"></span>
                  </button>
                </div>

                <!-- CTA pubblica -->
                <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
                     [class.opacity-50]="!publicViewConfig().allowBookAppointment"
                     [class.pointer-events-none]="!publicViewConfig().allowBookAppointment">
                  <div class="min-w-0 pr-3">
                    <p class="text-xs font-bold text-slate-700">CTA visibile non loggati</p>
                    <p class="text-[10px] text-slate-400 leading-snug mt-0.5">Mostra bottone prenota anche se non registrato (reindirizza al login)</p>
                  </div>
                  <button (click)="togglePvcField('showBookingCTAPublic')"
                          [class]="publicViewConfig().showBookingCTAPublic ? 'bg-emerald-500' : 'bg-slate-300'"
                          class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0">
                    <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          [class]="publicViewConfig().showBookingCTAPublic ? 'left-5' : 'left-0.5'"></span>
                  </button>
                </div>

                <!-- Lista medici -->
                <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div class="min-w-0 pr-3">
                    <p class="text-xs font-bold text-slate-700">Sezione medici</p>
                    <p class="text-[10px] text-slate-400 leading-snug mt-0.5">Mostra la lista dei medici dello studio</p>
                  </div>
                  <button (click)="togglePvcField('showDoctors')"
                          [class]="publicViewConfig().showDoctors ? 'bg-emerald-500' : 'bg-slate-300'"
                          class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0">
                    <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          [class]="publicViewConfig().showDoctors ? 'left-5' : 'left-0.5'"></span>
                  </button>
                </div>

                <!-- Label bottone prenotazione -->
                <div class="pt-1">
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Testo bottone prenotazione</label>
                  <input type="text" class="tc-input-sm w-full"
                         [ngModel]="publicViewConfig().bookingLabel"
                         (ngModelChange)="setPvcBookingLabel($event)"
                         placeholder="Es. Prenota una visita">
                </div>

                <!-- Preview chip -->
                <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 mt-1">
                  <p class="text-[10px] font-black text-emerald-700 uppercase tracking-wide mb-2">Anteprima attivazioni</p>
                  <div class="flex flex-wrap gap-1.5">
                    @if (publicViewConfig().showQueueStatus) {
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Coda live ✓</span>
                    }
                    @if (publicViewConfig().allowJoinQueue) {
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Entra in coda ✓</span>
                    }
                    @if (publicViewConfig().allowBookAppointment) {
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Prenotazione ✓</span>
                    }
                    @if (publicViewConfig().showDoctors) {
                      <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Lista medici ✓</span>
                    }
                    @if (!publicViewConfig().showQueueStatus && !publicViewConfig().allowJoinQueue && !publicViewConfig().allowBookAppointment && !publicViewConfig().showDoctors) {
                      <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">Solo contenuto statico</span>
                    }
                  </div>
                </div>

                <!-- Save -->
                <button (click)="savePublicViewConfig()"
                        class="w-full py-3 rounded-xl font-extrabold text-sm transition-all"
                        [class]="publicViewSaved() ? 'bg-emerald-500 text-white' : 'text-white hover:opacity-90'"
                        [style]="publicViewSaved() ? '' : 'background-color: var(--brand)'">
                  @if (publicViewSaved()) {
                    <span class="flex items-center justify-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Configurazione salvata!
                    </span>
                  } @else {
                    Salva configurazione
                  }
                </button>
              </div>
            </div>
          }

          @if (showThemePanel()) {
            <div class="p-5">
              <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <i class="pi pi-palette text-sm"></i>
                  </div>
                  <h3 class="font-extrabold text-slate-800">Tema Pagina</h3>
                </div>
                <button (click)="showThemePanel.set(false)" class="text-slate-400 hover:text-slate-700 p-1">
                  <i class="pi pi-times"></i>
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Colore primario brand</label>
                  <div class="flex gap-2">
                    <input type="color" [ngModel]="themeConfig().primaryColor"
                           (ngModelChange)="updateTheme('primaryColor', $event)"
                           class="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer">
                    <input type="text" class="tc-input-sm flex-1 font-mono"
                           [ngModel]="themeConfig().primaryColor"
                           (ngModelChange)="updateTheme('primaryColor', $event)">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Sfondo pagina</label>
                  <div class="flex gap-2">
                    <input type="color" [ngModel]="themeConfig().pageBackgroundColor || '#ffffff'"
                           (ngModelChange)="updateTheme('pageBackgroundColor', $event)"
                           class="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer">
                    <input type="text" class="tc-input-sm flex-1 font-mono"
                           [ngModel]="themeConfig().pageBackgroundColor || '#ffffff'"
                           (ngModelChange)="updateTheme('pageBackgroundColor', $event)">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1.5">Font</label>
                  <select class="tc-select w-full" [ngModel]="themeConfig().fontFamily"
                          (ngModelChange)="updateTheme('fontFamily', $event)">
                    <option value="Inter, sans-serif">Inter (default)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                    <option value="Georgia, serif">Georgia (serif)</option>
                    <option value="'Courier New', monospace">Courier New (mono)</option>
                  </select>
                </div>
              </div>
            </div>
          }

          @if (selectedBlock(); as block) {
            <div class="p-5">
              <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-tc-50 flex items-center justify-center text-tc-600">
                    <i [class]="getBlockIcon(block.type) + ' text-sm'"></i>
                  </div>
                  <h3 class="font-extrabold text-slate-800">{{ getBlockLabel(block.type) }}</h3>
                </div>
                <button (click)="selectedBlockId.set(null)" class="text-slate-400 hover:text-slate-700 p-1 lg:hidden">
                  <i class="pi pi-times"></i>
                </button>
              </div>

              <!-- Block style options -->
              <div class="mb-5 pb-5 border-b border-slate-100 space-y-3">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stile blocco</p>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Sfondo blocco</label>
                    <div class="flex gap-1.5">
                      <input type="color" [ngModel]="block.backgroundColor || '#ffffff'"
                             (ngModelChange)="updateBlockProp('backgroundColor', $event)"
                             class="w-9 h-9 p-0.5 border border-slate-200 rounded-lg cursor-pointer flex-shrink-0">
                      <button (click)="updateBlockProp('backgroundColor', undefined)"
                              class="flex-1 text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors px-1">
                        Nessuno
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Spaziatura</label>
                    <select class="tc-select w-full text-xs" [ngModel]="block.paddingY || 'none'"
                            (ngModelChange)="updateBlockProp('paddingY', $event)">
                      <option value="none">Nessuna</option>
                      <option value="sm">Piccola</option>
                      <option value="md">Media</option>
                      <option value="lg">Grande</option>
                    </select>
                  </div>
                </div>
                <!-- Visibility toggle in sidebar -->
                <div class="flex items-center justify-between px-3 py-2.5 rounded-xl"
                     [class]="block.disabled ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'">
                  <div>
                    <p class="text-xs font-bold" [class]="block.disabled ? 'text-amber-700' : 'text-slate-700'">
                      {{ block.disabled ? 'Blocco disabilitato' : 'Blocco visibile' }}
                    </p>
                    <p class="text-[10px]" [class]="block.disabled ? 'text-amber-600' : 'text-slate-400'">
                      {{ block.disabled ? 'Non compare sul sito pubblico' : 'Visibile ai visitatori' }}
                    </p>
                  </div>
                  <button (click)="toggleDisabledById(block.id)"
                          [class]="block.disabled ? 'bg-amber-500 hover:bg-emerald-500' : 'bg-emerald-500 hover:bg-amber-500'"
                          class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0">
                    <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          [class]="block.disabled ? 'left-0.5' : 'left-5'"></span>
                  </button>
                </div>
              </div>

              <!-- TEXT Block Properties -->
              @if (block.type === 'text') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Contenuto</label>
                    <div class="flex gap-1 mb-1.5 flex-wrap">
                      @for (fmt of textFormats; track fmt.label) {
                        <button (click)="applyTextFormat(fmt.wrap)"
                                class="px-2 py-1 text-[10px] font-bold border border-slate-200 rounded hover:bg-tc-50 hover:border-tc-300 text-slate-600 transition-colors">
                          {{ fmt.label }}
                        </button>
                      }
                    </div>
                    <textarea class="tc-input-sm w-full min-h-[160px] font-mono text-xs resize-y"
                              [ngModel]="block.config['content']"
                              (ngModelChange)="updateBlockConfig('content', $event)"
                              placeholder="<p>Scrivi il tuo testo qui...</p>"></textarea>
                    <p class="text-[10px] text-slate-400 mt-1">HTML supportato — usa i pulsanti sopra</p>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Allineamento</label>
                      <select class="tc-select w-full" [ngModel]="block.config['align']"
                              (ngModelChange)="updateBlockConfig('align', $event)">
                        <option value="left">Sinistra</option>
                        <option value="center">Centro</option>
                        <option value="right">Destra</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Dimensione testo</label>
                      <select class="tc-select w-full" [ngModel]="block.config['fontSize']"
                              (ngModelChange)="updateBlockConfig('fontSize', $event)">
                        <option value="small">Piccolo</option>
                        <option value="normal">Normale</option>
                        <option value="large">Grande</option>
                        <option value="xlarge">Molto Grande</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Colore testo</label>
                    <div class="flex gap-2">
                      <input type="color" [ngModel]="block.config['color']"
                             (ngModelChange)="updateBlockConfig('color', $event)"
                             class="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer">
                      <input type="text" class="tc-input-sm flex-1 font-mono"
                             [ngModel]="block.config['color']"
                             (ngModelChange)="updateBlockConfig('color', $event)">
                    </div>
                    <div class="flex gap-1.5 mt-2">
                      @for (c of colorPresets; track c) {
                        <button (click)="updateBlockConfig('color', c)"
                                class="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0 hover:scale-110 transition-transform"
                                [ngStyle]="{'background-color': c}" [title]="c"></button>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- IMAGE Block Properties -->
              @if (block.type === 'image') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Immagine</label>
                    @if (block.config['url']) {
                      <div class="relative mb-2 rounded-lg overflow-hidden border border-slate-200">
                        <img [src]="block.config['url']" [alt]="block.config['alt']" class="w-full h-32 object-cover" />
                        <button (click)="updateBlockConfig('url', '')"
                                class="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    }
                    <label class="block w-full cursor-pointer">
                      <input type="file" accept="image/*" class="sr-only" (change)="onImageUpload($event, 'url')">
                      <span class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-tc-300 text-tc-600 hover:bg-tc-50 transition-colors text-sm font-semibold">
                        <i class="pi pi-upload"></i>Carica immagine
                      </span>
                    </label>
                    <p class="text-[10px] text-slate-400 mt-1.5 text-center">oppure</p>
                    <input type="text" class="tc-input-sm w-full mt-1"
                           [ngModel]="block.config['url']"
                           (ngModelChange)="updateBlockConfig('url', $event)"
                           placeholder="https://esempio.com/foto.jpg">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Testo alternativo (SEO)</label>
                    <input type="text" class="tc-input-sm w-full"
                           [ngModel]="block.config['alt']"
                           (ngModelChange)="updateBlockConfig('alt', $event)">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Didascalia (opzionale)</label>
                    <input type="text" class="tc-input-sm w-full"
                           [ngModel]="block.config['caption']"
                           (ngModelChange)="updateBlockConfig('caption', $event)">
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Larghezza</label>
                      <select class="tc-select w-full" [ngModel]="block.config['width']"
                              (ngModelChange)="updateBlockConfig('width', $event)">
                        <option value="full">Piena</option>
                        <option value="large">Grande (80%)</option>
                        <option value="medium">Media (60%)</option>
                        <option value="small">Piccola (40%)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Bordi</label>
                      <select class="tc-select w-full" [ngModel]="block.config['borderRadius']"
                              (ngModelChange)="updateBlockConfig('borderRadius', $event)">
                        <option value="none">Squadrati</option>
                        <option value="sm">Leggermente</option>
                        <option value="md">Arrotondati</option>
                        <option value="lg">Molto</option>
                        <option value="full">Cerchio</option>
                      </select>
                    </div>
                  </div>
                </div>
              }

              <!-- GALLERY Block Properties -->
              @if (block.type === 'gallery') {
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-xs font-bold text-slate-500">Immagini ({{ block.config['images']?.length || 0 }})</label>
                      <label class="cursor-pointer">
                        <input type="file" accept="image/*" multiple class="sr-only" (change)="onGalleryUpload($event)">
                        <span class="text-xs font-bold text-tc-600 hover:text-tc-700 transition-colors">+ Aggiungi</span>
                      </label>
                    </div>
                    <div class="space-y-2">
                      @for (img of block.config['images'] || []; track img.url; let gi = $index) {
                        <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <img [src]="img.url" class="w-12 h-10 object-cover rounded flex-shrink-0" [alt]="img.alt" />
                          <input type="text" class="tc-input-sm flex-1 text-xs" [value]="img.alt"
                                 (input)="updateGalleryImage(gi, 'alt', $any($event.target).value)"
                                 placeholder="Descrizione...">
                          <button (click)="removeGalleryImage(gi)" class="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                            <i class="pi pi-times text-xs"></i>
                          </button>
                        </div>
                      }
                      @if (!block.config['images']?.length) {
                        <div class="text-center py-4 text-xs text-slate-400">Nessuna immagine — clicca + Aggiungi</div>
                      }
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Colonne</label>
                    <div class="flex gap-2">
                      @for (n of [2,3,4]; track n) {
                        <button (click)="updateBlockConfig('columns', n)"
                                [class]="block.config['columns'] === n ? 'bg-tc-500 text-white border-tc-500' : 'border-slate-200 text-slate-600 hover:border-tc-300'"
                                class="flex-1 py-2 rounded-lg border text-sm font-bold transition-colors">{{ n }}</button>
                      }
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Bordi immagini</label>
                    <select class="tc-select w-full" [ngModel]="block.config['borderRadius']"
                            (ngModelChange)="updateBlockConfig('borderRadius', $event)">
                      <option value="none">Squadrati</option>
                      <option value="md">Arrotondati</option>
                      <option value="lg">Molto arrotondati</option>
                    </select>
                  </div>
                </div>
              }

              <!-- VIDEO Block Properties -->
              @if (block.type === 'video') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">URL Video</label>
                    <input type="text" class="tc-input-sm w-full"
                           [ngModel]="block.config['url']"
                           (ngModelChange)="updateBlockConfig('url', $event)"
                           placeholder="https://youtube.com/watch?v=...">
                    <div class="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                      <p class="font-bold">Formati supportati:</p>
                      <p>• YouTube: youtube.com/watch?v=...</p>
                      <p>• YouTube breve: youtu.be/...</p>
                      <p>• Vimeo: vimeo.com/...</p>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Proporzioni</label>
                    <div class="flex gap-2">
                      @for (r of ['16:9','4:3','1:1']; track r) {
                        <button (click)="updateBlockConfig('aspectRatio', r)"
                                [class]="block.config['aspectRatio'] === r ? 'bg-tc-500 text-white border-tc-500' : 'border-slate-200 text-slate-600 hover:border-tc-300'"
                                class="flex-1 py-2 rounded-lg border text-xs font-bold transition-colors">{{ r }}</button>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- MAP Block Properties -->
              @if (block.type === 'map') {
                <div class="space-y-4">
                  <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    <p class="font-bold mb-1">Come ottenere il codice mappa:</p>
                    <ol class="list-decimal list-inside space-y-0.5">
                      <li>Apri Google Maps e cerca lo studio</li>
                      <li>Clicca "Condividi" → "Incorpora mappa"</li>
                      <li>Copia il codice &lt;iframe&gt; e incollalo qui</li>
                    </ol>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Indirizzo (testo)</label>
                    <input type="text" class="tc-input-sm w-full"
                           [ngModel]="block.config['address']"
                           (ngModelChange)="updateBlockConfig('address', $event)"
                           placeholder="Via Roma 1, Milano">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Codice incorpora Google Maps</label>
                    <textarea class="tc-input-sm w-full min-h-[100px] font-mono text-xs resize-y"
                              [ngModel]="block.config['embedUrl']"
                              (ngModelChange)="updateBlockConfig('embedUrl', $event)"
                              placeholder='Incolla qui il codice iframe di Google Maps'></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Altezza mappa (px)</label>
                    <input type="number" class="tc-input-sm w-full"
                           [ngModel]="block.config['height']"
                           (ngModelChange)="updateBlockConfig('height', +$event)"
                           min="150" max="800">
                  </div>
                </div>
              }

              <!-- PHONE BUTTON Block Properties -->
              @if (block.type === 'phone-button') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Etichetta bottone</label>
                    <input type="text" class="tc-input-sm w-full"
                           [ngModel]="block.config['label']"
                           (ngModelChange)="updateBlockConfig('label', $event)">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Numero di telefono</label>
                    <input type="tel" class="tc-input-sm w-full"
                           [ngModel]="block.config['phoneNumber']"
                           (ngModelChange)="updateBlockConfig('phoneNumber', $event)"
                           placeholder="+39 02 1234567">
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Stile</label>
                      <select class="tc-select w-full" [ngModel]="block.config['color']"
                              (ngModelChange)="updateBlockConfig('color', $event)">
                        <option value="primary">Brand</option>
                        <option value="secondary">Scuro</option>
                        <option value="success">Verde</option>
                        <option value="outline">Trasparente</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Dimensione</label>
                      <select class="tc-select w-full" [ngModel]="block.config['size'] || 'md'"
                              (ngModelChange)="updateBlockConfig('size', $event)">
                        <option value="sm">Piccolo</option>
                        <option value="md">Medio</option>
                        <option value="lg">Grande</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Allineamento</label>
                    <div class="flex gap-2">
                      @for (a of [{v:'left',l:'Sinistra'},{v:'center',l:'Centro'},{v:'right',l:'Destra'},{v:'full',l:'Pieno'}]; track a.v) {
                        <button (click)="updateBlockConfig('align', a.v)"
                                [class]="block.config['align'] === a.v ? 'bg-tc-500 text-white border-tc-500' : 'border-slate-200 text-slate-600'"
                                class="flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-colors">{{ a.l }}</button>
                      }
                    </div>
                  </div>
                  <label class="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" class="w-4 h-4 rounded accent-tc-500"
                           [ngModel]="block.config['icon']"
                           (ngModelChange)="updateBlockConfig('icon', $event)">
                    <span class="text-sm font-semibold text-slate-700">Mostra icona telefono</span>
                  </label>
                </div>
              }

              <!-- SPACER Block Properties -->
              @if (block.type === 'spacer') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Altezza: {{ block.config['height'] }}px</label>
                    <input type="range" class="w-full accent-tc-500"
                           [ngModel]="block.config['height']"
                           (ngModelChange)="updateBlockConfig('height', +$event)"
                           min="8" max="200" step="4">
                    <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>8px</span><span>200px</span>
                    </div>
                  </div>
                </div>
              }

              <!-- DIVIDER Block Properties -->
              @if (block.type === 'divider') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Stile linea</label>
                    <div class="flex gap-2">
                      @for (s of ['solid','dashed','dotted','double']; track s) {
                        <button (click)="updateBlockConfig('style', s)"
                                [class]="block.config['style'] === s ? 'bg-tc-500 text-white border-tc-500' : 'border-slate-200 text-slate-600'"
                                class="flex-1 py-2 rounded-lg border text-[10px] font-bold capitalize transition-colors">{{ s }}</button>
                      }
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Colore</label>
                    <div class="flex gap-2">
                      <input type="color" [ngModel]="block.config['color']"
                             (ngModelChange)="updateBlockConfig('color', $event)"
                             class="w-10 h-10 p-1 border border-slate-200 rounded-lg cursor-pointer">
                      <input type="text" class="tc-input-sm flex-1 font-mono"
                             [ngModel]="block.config['color']"
                             (ngModelChange)="updateBlockConfig('color', $event)">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Spessore: {{ block.config['thickness'] }}px</label>
                    <input type="range" class="w-full accent-tc-500"
                           [ngModel]="block.config['thickness']"
                           (ngModelChange)="updateBlockConfig('thickness', +$event)"
                           min="1" max="8">
                  </div>
                </div>
              }

              <!-- HERO Block Properties -->
              @if (block.type === 'hero') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Immagine di sfondo</label>
                    @if (block.config['imageUrl']) {
                      <div class="relative mb-2 rounded-lg overflow-hidden border border-slate-200">
                        <img [src]="block.config['imageUrl']" class="w-full h-28 object-cover" alt="" />
                        <button (click)="updateBlockConfig('imageUrl', '')"
                                class="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    }
                    <label class="block w-full cursor-pointer">
                      <input type="file" accept="image/*" class="sr-only" (change)="onImageUpload($event, 'imageUrl')">
                      <span class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-tc-300 text-tc-600 hover:bg-tc-50 transition-colors text-sm font-semibold">
                        <i class="pi pi-upload"></i>Carica immagine
                      </span>
                    </label>
                    <input type="text" class="tc-input-sm w-full mt-2"
                           [ngModel]="block.config['imageUrl']"
                           (ngModelChange)="updateBlockConfig('imageUrl', $event)"
                           placeholder="oppure incolla URL...">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Titolo</label>
                    <input type="text" class="tc-input-sm w-full"
                           [ngModel]="block.config['title']"
                           (ngModelChange)="updateBlockConfig('title', $event)">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Sottotitolo</label>
                    <textarea class="tc-input-sm w-full resize-y"
                              [ngModel]="block.config['subtitle']"
                              (ngModelChange)="updateBlockConfig('subtitle', $event)"></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">
                      Scurimento sfondo: {{ +(block.config['overlayOpacity'] * 100).toFixed(0) }}%
                    </label>
                    <input type="range" class="w-full accent-tc-500"
                           [ngModel]="block.config['overlayOpacity']"
                           (ngModelChange)="updateBlockConfig('overlayOpacity', +$event)"
                           min="0" max="1" step="0.05">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Altezza minima (px)</label>
                    <input type="number" class="tc-input-sm w-full"
                           [ngModel]="block.config['minHeight'] || 320"
                           (ngModelChange)="updateBlockConfig('minHeight', +$event)"
                           min="150" max="800">
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Testo bottone</label>
                      <input type="text" class="tc-input-sm w-full"
                             [ngModel]="block.config['buttonLabel']"
                             (ngModelChange)="updateBlockConfig('buttonLabel', $event)"
                             placeholder="Es. Prenota ora">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1.5">Link bottone</label>
                      <input type="text" class="tc-input-sm w-full"
                             [ngModel]="block.config['buttonLink']"
                             (ngModelChange)="updateBlockConfig('buttonLink', $event)"
                             placeholder="#prenota">
                    </div>
                  </div>
                </div>
              }

            </div>
          } @else if (!showThemePanel() && !showPublicViewPanel()) {
            <div class="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
              <i class="pi pi-sliders-h text-4xl mb-4 text-slate-200"></i>
              <p class="font-bold text-slate-500 mb-1">Nessun blocco selezionato</p>
              <p class="text-xs mt-1 mb-6">Clicca su un blocco per modificarlo, o tasto destro per il menu rapido.</p>
              <button (click)="openThemePanel($event)"
                      class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200
                             text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-tc-300 transition-colors">
                <i class="pi pi-palette text-tc-500"></i>
                Modifica tema pagina
              </button>
            </div>
          }
        </aside>

      </div>
    </div>
  `,
})
export class SiteBuilderComponent {
  private mockData = inject(MockDataService);
  private studioSlug = 'studio-demo';

  readonly mobilePreview = signal(false);
  readonly blocks = signal<SiteBlock[]>([]);
  readonly themeConfig = signal({ primaryColor: '#6366f1', fontFamily: 'Inter, sans-serif', pageBackgroundColor: '#ffffff' });
  readonly selectedBlockId = signal<string | null>(null);
  readonly toastVisible = signal(false);
  readonly deleteConfirmId = signal<string | null>(null);
  readonly showThemePanel     = signal(false);
  readonly showPublicViewPanel = signal(false);
  readonly showPicker         = signal(false);
  readonly ctxMenu            = signal<CtxMenu | null>(null);
  readonly publicViewConfig   = signal(this.mockData.getPublicViewConfig(this.studioSlug));
  readonly publicViewSaved    = signal(false);

  readonly selectedBlock = computed(() => {
    const id = this.selectedBlockId();
    return id ? (this.blocks().find(b => b.id === id) ?? null) : null;
  });

  readonly disabledCount = computed(() => this.blocks().filter(b => b.disabled).length);

  readonly blockCategories: BlockCategory[] = [
    {
      label: 'Contenuto',
      icon: 'pi pi-file-edit',
      items: [
        { type: 'hero',  label: 'Hero Banner', desc: 'Copertina con immagine e titolo', icon: 'pi pi-image' },
        { type: 'text',  label: 'Testo',        desc: 'Paragrafo, titoli, HTML formattato', icon: 'pi pi-align-left' },
      ]
    },
    {
      label: 'Media',
      icon: 'pi pi-images',
      items: [
        { type: 'image',   label: 'Immagine',  desc: 'Foto singola con didascalia', icon: 'pi pi-camera' },
        { type: 'gallery', label: 'Galleria',  desc: 'Griglia di più immagini',     icon: 'pi pi-images' },
        { type: 'video',   label: 'Video',     desc: 'YouTube o Vimeo incorporato', icon: 'pi pi-video' },
      ]
    },
    {
      label: 'Interazione',
      icon: 'pi pi-bolt',
      items: [
        { type: 'phone-button', label: 'Pulsante Telefono', desc: 'Bottone click-to-call', icon: 'pi pi-phone' },
        { type: 'map',          label: 'Mappa',             desc: 'Google Maps incorporato', icon: 'pi pi-map-marker' },
      ]
    },
    {
      label: 'Layout',
      icon: 'pi pi-th-large',
      items: [
        { type: 'divider', label: 'Divisore',     desc: 'Linea di separazione',      icon: 'pi pi-minus' },
        { type: 'spacer',  label: 'Spazio Vuoto', desc: 'Distanza configurabile',    icon: 'pi pi-arrows-v' },
      ]
    },
  ];

  readonly textFormats = [
    { label: 'Titolo H1', wrap: 'h1' }, { label: 'Titolo H2', wrap: 'h2' },
    { label: 'Titolo H3', wrap: 'h3' }, { label: 'Paragrafo', wrap: 'p' },
    { label: 'Bold', wrap: 'strong' },  { label: 'Italic', wrap: 'em' },
    { label: 'Lista •', wrap: 'ul-li' },{ label: 'Lista 1.', wrap: 'ol-li' },
  ];

  readonly colorPresets = [
    '#1e293b', '#475569', '#94a3b8', '#6366f1', '#3b82f6',
    '#8b5cf6', '#ef4444', '#f59e0b', '#ffffff',
  ];

  constructor() { this.loadPage(); }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeCtx();
    this.showPicker.set(false);
  }

  togglePicker(event: Event): void {
    event.stopPropagation();
    this.showPicker.update(v => !v);
  }

  toggleThemePanel(event: Event): void {
    event.stopPropagation();
    this.showThemePanel.update(v => !v);
    this.showPublicViewPanel.set(false);
    this.selectedBlockId.set(null);
    this.showPicker.set(false);
  }

  openThemePanel(event: Event): void {
    event.stopPropagation();
    this.showThemePanel.set(true);
    this.showPublicViewPanel.set(false);
  }

  togglePublicViewPanel(event: Event): void {
    event.stopPropagation();
    this.showPublicViewPanel.update(v => !v);
    this.showThemePanel.set(false);
    this.selectedBlockId.set(null);
    this.showPicker.set(false);
  }

  togglePvcField(field: keyof PublicViewConfig): void {
    const cfg = this.publicViewConfig();
    const val = cfg[field];
    if (typeof val === 'boolean') {
      this.publicViewConfig.set({ ...cfg, [field]: !val });
    }
  }

  setPvcBookingLabel(label: string): void {
    this.publicViewConfig.set({ ...this.publicViewConfig(), bookingLabel: label });
  }

  savePublicViewConfig(): void {
    this.mockData.savePublicViewConfig(this.studioSlug, this.publicViewConfig());
    this.publicViewSaved.set(true);
    setTimeout(() => this.publicViewSaved.set(false), 3000);
  }

  loadPage(): void {
    const page = this.mockData.getSitePage(this.studioSlug);
    this.blocks.set([...page.blocks].sort((a, b) => a.order - b.order));
    const defaults = { primaryColor: '#6366f1', fontFamily: 'Inter, sans-serif', pageBackgroundColor: '#ffffff' };
    this.themeConfig.set({ ...defaults, ...page.theme });
  }

  savePage(): void {
    const pageConfig: SitePageConfig = { blocks: this.blocks(), theme: this.themeConfig() };
    this.mockData.saveSitePage(this.studioSlug, pageConfig);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  selectBlock(id: string, event: Event): void {
    event.stopPropagation();
    this.selectedBlockId.set(id);
    this.showThemePanel.set(false);
    this.showPicker.set(false);
  }

  // ── Context menu ────────────────────────────────────────────────────────────

  onCtxMenu(event: MouseEvent, blockId: string): void {
    event.preventDefault();
    event.stopPropagation();
    const mw = 200, mh = 260;
    const x = event.clientX + mw > window.innerWidth  ? event.clientX - mw : event.clientX + 4;
    const y = event.clientY + mh > window.innerHeight ? event.clientY - mh : event.clientY + 4;
    this.ctxMenu.set({ x, y, blockId });
  }

  closeCtx(): void { this.ctxMenu.set(null); }

  ctxAction(action: string, m: CtxMenu): void {
    this.closeCtx();
    switch (action) {
      case 'edit':
        this.selectedBlockId.set(m.blockId);
        this.showThemePanel.set(false);
        this.showPicker.set(false);
        break;
      case 'duplicate': this.duplicateBlock(m.blockId); break;
      case 'up':        this.moveBlock(m.blockId, -1); break;
      case 'down':      this.moveBlock(m.blockId, 1); break;
      case 'toggle':    this.toggleDisabledById(m.blockId); break;
      case 'delete':    this.deleteConfirmId.set(m.blockId); break;
    }
  }

  isFirst(id: string): boolean { return this.blocks()[0]?.id === id; }
  isLast(id: string): boolean  { return this.blocks()[this.blocks().length - 1]?.id === id; }
  isDisabled(id: string): boolean { return this.blocks().find(b => b.id === id)?.disabled ?? false; }

  // ── Block operations ────────────────────────────────────────────────────────

  addBlock(type: SiteBlockType): void {
    const newId = `block-${type}-${Date.now()}`;
    let config: any = {};
    switch (type) {
      case 'text':         config = { content: '<p>Scrivi qui il tuo testo...</p>', align: 'left', fontSize: 'normal', color: '#1e293b' }; break;
      case 'image':        config = { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80', alt: 'Immagine studio', width: 'full', borderRadius: 'md' }; break;
      case 'gallery':      config = { images: [], columns: 3, borderRadius: 'md' }; break;
      case 'video':        config = { url: '', aspectRatio: '16:9' }; break;
      case 'map':          config = { address: '', embedUrl: '', height: 350 }; break;
      case 'phone-button': config = { phoneNumber: '', label: 'Chiama lo Studio', color: 'primary', icon: true, size: 'md', align: 'center' }; break;
      case 'spacer':       config = { height: 32 }; break;
      case 'divider':      config = { style: 'solid', color: '#e2e8f0', thickness: 1 }; break;
      case 'hero':         config = { title: 'Benvenuti nel nostro Studio', subtitle: 'Prenota la tua visita o entra in coda digitale in pochi secondi.', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80', overlayOpacity: 0.5, minHeight: 380, textAlign: 'center' }; break;
    }
    const newBlock: SiteBlock = { id: newId, type, order: this.blocks().length, config, paddingY: 'md' };
    this.blocks.update(b => [...b, newBlock]);
    this.selectedBlockId.set(newId);
    this.showThemePanel.set(false);
    setTimeout(() => document.querySelector('.overflow-y-auto')?.scrollTo({ top: 99999, behavior: 'smooth' }), 50);
  }

  requestDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.deleteConfirmId.set(id);
  }

  confirmDelete(): void {
    const id = this.deleteConfirmId();
    if (!id) return;
    this.blocks.update(b => this.recalcOrder(b.filter(bl => bl.id !== id)));
    if (this.selectedBlockId() === id) this.selectedBlockId.set(null);
    this.deleteConfirmId.set(null);
  }

  duplicateBlock(id: string, event?: Event): void {
    event?.stopPropagation();
    const block = this.blocks().find(b => b.id === id);
    if (!block) return;
    const copy: SiteBlock = { ...JSON.parse(JSON.stringify(block)), id: `block-${block.type}-${Date.now()}`, order: block.order + 0.5 };
    this.blocks.update(b => this.recalcOrder([...b, copy].sort((a, x) => a.order - x.order)));
    this.selectedBlockId.set(copy.id);
  }

  moveBlock(id: string, direction: 1 | -1, event?: Event): void {
    event?.stopPropagation();
    const arr = [...this.blocks()];
    const idx = arr.findIndex(b => b.id === id);
    const newIdx = idx + direction;
    if (newIdx >= 0 && newIdx < arr.length) {
      moveItemInArray(arr, idx, newIdx);
      this.blocks.set(this.recalcOrder(arr));
    }
  }

  toggleDisabled(id: string, event: Event): void {
    event.stopPropagation();
    this.toggleDisabledById(id);
  }

  toggleDisabledById(id: string): void {
    this.blocks.update(blocks => blocks.map(b => b.id !== id ? b : { ...b, disabled: !b.disabled }));
  }

  drop(event: CdkDragDrop<SiteBlock[]>): void {
    const arr = [...this.blocks()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.blocks.set(this.recalcOrder(arr));
  }

  updateBlockConfig(key: string, value: any): void {
    const id = this.selectedBlockId();
    if (!id) return;
    this.blocks.update(blocks => blocks.map(b => b.id !== id ? b : { ...b, config: { ...b.config, [key]: value } }));
  }

  updateBlockProp(key: keyof SiteBlock, value: any): void {
    const id = this.selectedBlockId();
    if (!id) return;
    this.blocks.update(blocks => blocks.map(b => b.id !== id ? b : { ...b, [key]: value }));
  }

  updateTheme(key: string, value: string): void {
    this.themeConfig.update(t => ({ ...t, [key]: value }));
  }

  applyTextFormat(wrap: string): void {
    const id = this.selectedBlockId();
    if (!id) return;
    const current = this.blocks().find(b => b.id === id)?.config['content'] || '';
    let newContent = current;
    if (wrap === 'ul-li')      newContent = current + '\n<ul>\n  <li>Elemento lista</li>\n</ul>';
    else if (wrap === 'ol-li') newContent = current + '\n<ol>\n  <li>Primo elemento</li>\n</ol>';
    else                       newContent = current + `\n<${wrap}>Nuovo contenuto</${wrap}>`;
    this.updateBlockConfig('content', newContent);
  }

  onImageUpload(event: Event, configKey: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Immagine troppo grande. Max 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => this.updateBlockConfig(configKey, e.target?.result as string);
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  onGalleryUpload(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (!files.length) return;
    const id = this.selectedBlockId();
    if (!id) return;
    const current: any[] = this.blocks().find(b => b.id === id)?.config['images'] || [];
    let processed = 0;
    const newImages: any[] = [...current];
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = e => {
        newImages.push({ url: e.target?.result as string, alt: file.name.replace(/\.[^.]+$/, ''), caption: '' });
        processed++;
        if (processed === files.length) this.updateBlockConfig('images', newImages);
      };
      reader.readAsDataURL(file);
    });
    (event.target as HTMLInputElement).value = '';
  }

  updateGalleryImage(index: number, key: string, value: string): void {
    const id = this.selectedBlockId();
    if (!id) return;
    const images = [...(this.blocks().find(b => b.id === id)?.config['images'] || [])];
    images[index] = { ...images[index], [key]: value };
    this.updateBlockConfig('images', images);
  }

  removeGalleryImage(index: number): void {
    const id = this.selectedBlockId();
    if (!id) return;
    const images = (this.blocks().find(b => b.id === id)?.config['images'] || []).filter((_: any, i: number) => i !== index);
    this.updateBlockConfig('images', images);
  }

  private recalcOrder(blocks: SiteBlock[]): SiteBlock[] {
    return blocks.map((b, i) => ({ ...b, order: i }));
  }

  getBlockIcon(type: SiteBlockType): string {
    return ({ text: 'pi pi-align-left', image: 'pi pi-camera', gallery: 'pi pi-images', video: 'pi pi-video', map: 'pi pi-map-marker', 'phone-button': 'pi pi-phone', spacer: 'pi pi-arrows-v', hero: 'pi pi-image', divider: 'pi pi-minus' })[type] || 'pi pi-box';
  }

  getBlockLabel(type: SiteBlockType): string {
    return ({ text: 'Testo', image: 'Immagine', gallery: 'Galleria', video: 'Video', map: 'Mappa', 'phone-button': 'Telefono', spacer: 'Spazio', hero: 'Hero', divider: 'Divisore' })[type] || 'Blocco';
  }
}
