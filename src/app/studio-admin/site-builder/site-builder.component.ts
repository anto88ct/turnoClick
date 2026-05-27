import { Component, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { NgStyle, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MockDataService } from '../../core/services/mock-data.service';
import { TcButtonComponent } from '../../shared/tc-button/tc-button.component';
import { SiteBlockRendererComponent } from '../../shared/site-block-renderer/site-block-renderer.component';
import {
  SiteBlock, SiteBlockType, SitePageConfig,
  TextBlockConfig, ImageBlockConfig, GalleryBlockConfig, VideoBlockConfig,
  MapBlockConfig, PhoneButtonConfig, SpacerBlockConfig, HeroBlockConfig, DividerBlockConfig
} from '../../core/models/site-builder.model';

@Component({
  selector: 'app-site-builder',
  standalone: true,
  imports: [NgStyle, NgClass, FormsModule, DragDropModule, TcButtonComponent, SiteBlockRendererComponent],
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">

      <!-- Toast notification -->
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
        <div class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div class="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 text-center mb-1">Elimina blocco?</h3>
            <p class="text-sm text-slate-500 text-center mb-5">Questa azione non può essere annullata.</p>
            <div class="flex gap-3">
              <button (click)="deleteConfirmId.set(null)" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Annulla
              </button>
              <button (click)="confirmDelete()" class="flex-1 py-2.5 rounded-xl bg-rose-500 text-sm font-bold text-white hover:bg-rose-600 transition-colors">
                Elimina
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Toolbar -->
      <div class="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm z-10">
        <!-- Top row: Add blocks -->
        <div class="px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 whitespace-nowrap flex-shrink-0">+ Blocco:</span>

          @for (item of blockMenu; track item.type) {
            <button (click)="addBlock(item.type)"
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200
                           hover:border-tc-400 hover:bg-tc-50 text-slate-600 hover:text-tc-700
                           transition-colors text-[11px] font-bold whitespace-nowrap flex-shrink-0">
              <i [class]="item.icon + ' text-xs'"></i>
              {{ item.label }}
            </button>
          }
        </div>

        <!-- Bottom row: Actions -->
        <div class="px-3 pb-2 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button (click)="toggleMobilePreview()"
                    [class]="mobilePreview() ? 'bg-tc-100 text-tc-600 border-tc-300' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors">
              <i class="pi pi-mobile text-sm"></i>
              <span class="hidden sm:inline">Mobile</span>
            </button>
            <button (click)="toggleDesktopPreview()"
                    [class]="!mobilePreview() ? 'bg-tc-100 text-tc-600 border-tc-300' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors">
              <i class="pi pi-desktop text-sm"></i>
              <span class="hidden sm:inline">Desktop</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 hidden sm:block">{{ blocks().length }} blocchi</span>
            <tc-button variant="primary" size="sm" (clicked)="savePage()">
              <i class="pi pi-save mr-1"></i>
              Salva Sito
            </tc-button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden flex relative">

        <!-- Canvas -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-6 pl-8 sm:pl-10 flex justify-center bg-slate-100/50"
             (click)="selectedBlockId.set(null)">

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

            <div cdkDropList
                 [cdkDropListData]="blocks()"
                 (cdkDropListDropped)="drop($event)"
                 class="min-h-[200px]">

              @if (blocks().length === 0) {
                <div class="flex flex-col items-center justify-center h-64 text-slate-400
                            border-2 border-dashed border-slate-200 m-8 rounded-2xl">
                  <i class="pi pi-box text-4xl mb-3 text-slate-300"></i>
                  <p class="font-bold text-slate-500">Pagina vuota</p>
                  <p class="text-xs mt-1">Aggiungi un blocco dalla toolbar superiore.</p>
                </div>
              }

              @for (block of blocks(); track block.id; let first = $first; let last = $last) {
                <div cdkDrag
                     class="group relative border-[3px] border-transparent hover:border-tc-200
                            transition-all rounded-xl mb-1 cursor-pointer"
                     [ngClass]="{'border-tc-500 bg-tc-50': selectedBlockId() === block.id}"
                     (click)="selectBlock(block.id, $event)">

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
                  <div class="absolute -top-3 left-3 px-2 py-0.5 bg-tc-500 text-white text-[9px]
                              font-black uppercase tracking-widest rounded-full
                              opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
                       [class.!opacity-100]="selectedBlockId() === block.id">
                    {{ getBlockLabel(block.type) }}
                  </div>

                  <!-- Actions overlay -->
                  <div class="absolute top-2 right-2 bg-white rounded-xl shadow-md
                              border border-slate-200 p-1 flex gap-0.5
                              opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button (click)="moveBlock(block.id, -1, $event)"
                            [disabled]="first"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100
                                   text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Sposta su">
                      <i class="pi pi-arrow-up text-xs"></i>
                    </button>
                    <button (click)="moveBlock(block.id, 1, $event)"
                            [disabled]="last"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100
                                   text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Sposta giù">
                      <i class="pi pi-arrow-down text-xs"></i>
                    </button>
                    <div class="w-px h-5 bg-slate-200 mx-0.5 my-auto"></div>
                    <button (click)="duplicateBlock(block.id, $event)"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100
                                   text-slate-500 transition-colors" title="Duplica">
                      <i class="pi pi-copy text-xs"></i>
                    </button>
                    <button (click)="requestDelete(block.id, $event)"
                            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50
                                   text-rose-500 transition-colors" title="Elimina">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>

                  <!-- Rendered block (pointer-events-none so clicks reach the wrapper) -->
                  <div class="pointer-events-none select-none">
                    <app-site-block-renderer [block]="block"></app-site-block-renderer>
                  </div>

                  <!-- Selected highlight -->
                  @if (selectedBlockId() === block.id) {
                    <div class="absolute inset-0 bg-tc-500/3 pointer-events-none rounded-lg"></div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Properties Sidebar -->
        <aside class="w-80 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0
                      transition-transform duration-300
                      absolute right-0 top-0 h-full shadow-2xl
                      lg:relative lg:shadow-none z-30"
               [class.translate-x-full]="!selectedBlock() && !showThemePanel()"
               [class.lg:translate-x-0]="true">

          @if (showThemePanel()) {
            <!-- Theme panel -->
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
                <button (click)="selectedBlockId.set(null)"
                        class="text-slate-400 hover:text-slate-700 p-1 lg:hidden">
                  <i class="pi pi-times"></i>
                </button>
              </div>

              <!-- Common block style options -->
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
                    <p class="text-[10px] text-slate-400 mt-1">HTML supportato — usa i pulsanti sopra per formattare velocemente</p>
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
                                [ngStyle]="{'background-color': c}"
                                [title]="c"></button>
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
                        <img [src]="block.config['url']" [alt]="block.config['alt']"
                             class="w-full h-32 object-cover" />
                        <button (click)="updateBlockConfig('url', '')"
                                class="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    }
                    <label class="block w-full cursor-pointer">
                      <input type="file" accept="image/*" class="sr-only" (change)="onImageUpload($event, 'url')">
                      <span class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                                   border-2 border-dashed border-tc-300 text-tc-600
                                   hover:bg-tc-50 transition-colors text-sm font-semibold">
                        <i class="pi pi-upload"></i>
                        Carica immagine
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
                          <button (click)="removeGalleryImage(gi)"
                                  class="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
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
                                class="flex-1 py-2 rounded-lg border text-sm font-bold transition-colors">
                          {{ n }}
                        </button>
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
                                class="flex-1 py-2 rounded-lg border text-xs font-bold transition-colors">
                          {{ r }}
                        </button>
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
                                class="flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-colors">
                          {{ a.l }}
                        </button>
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
                      <span>8px</span>
                      <span>200px</span>
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
                                class="flex-1 py-2 rounded-lg border text-[10px] font-bold capitalize transition-colors">
                          {{ s }}
                        </button>
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
                                class="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    }
                    <label class="block w-full cursor-pointer">
                      <input type="file" accept="image/*" class="sr-only" (change)="onImageUpload($event, 'imageUrl')">
                      <span class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                                   border-2 border-dashed border-tc-300 text-tc-600
                                   hover:bg-tc-50 transition-colors text-sm font-semibold">
                        <i class="pi pi-upload"></i>
                        Carica immagine
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

          } @else if (!showThemePanel()) {
            <!-- Empty state with shortcuts -->
            <div class="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
              <i class="pi pi-sliders-h text-4xl mb-4 text-slate-200"></i>
              <p class="font-bold text-slate-500 mb-1">Nessun blocco selezionato</p>
              <p class="text-xs mt-1 mb-6">Clicca su un blocco per modificarlo, oppure aggiungi un nuovo blocco dalla toolbar.</p>
              <button (click)="showThemePanel.set(true)"
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
  `
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
  readonly showThemePanel = signal(false);

  readonly selectedBlock = computed(() => {
    const id = this.selectedBlockId();
    return id ? (this.blocks().find(b => b.id === id) ?? null) : null;
  });

  readonly blockMenu = [
    { type: 'hero' as SiteBlockType, label: 'Hero', icon: 'pi pi-image' },
    { type: 'text' as SiteBlockType, label: 'Testo', icon: 'pi pi-align-left' },
    { type: 'image' as SiteBlockType, label: 'Immagine', icon: 'pi pi-camera' },
    { type: 'gallery' as SiteBlockType, label: 'Galleria', icon: 'pi pi-images' },
    { type: 'video' as SiteBlockType, label: 'Video', icon: 'pi pi-video' },
    { type: 'map' as SiteBlockType, label: 'Mappa', icon: 'pi pi-map-marker' },
    { type: 'phone-button' as SiteBlockType, label: 'Telefono', icon: 'pi pi-phone' },
    { type: 'divider' as SiteBlockType, label: 'Divisore', icon: 'pi pi-minus' },
    { type: 'spacer' as SiteBlockType, label: 'Spazio', icon: 'pi pi-arrows-v' },
  ];

  readonly textFormats = [
    { label: 'Titolo H1', wrap: 'h1' },
    { label: 'Titolo H2', wrap: 'h2' },
    { label: 'Titolo H3', wrap: 'h3' },
    { label: 'Paragrafo', wrap: 'p' },
    { label: 'Bold', wrap: 'strong' },
    { label: 'Italic', wrap: 'em' },
    { label: 'Lista •', wrap: 'ul-li' },
    { label: 'Lista 1.', wrap: 'ol-li' },
  ];

  readonly colorPresets = [
    '#1e293b', '#475569', '#94a3b8', '#6366f1', '#3b82f6',
    '#8b5cf6', '#ef4444', '#f59e0b', '#ffffff',
  ];

  constructor() {
    this.loadPage();
  }

  loadPage(): void {
    const page = this.mockData.getSitePage(this.studioSlug);
    this.blocks.set([...page.blocks].sort((a, b) => a.order - b.order));
    const defaults = { primaryColor: '#6366f1', fontFamily: 'Inter, sans-serif', pageBackgroundColor: '#ffffff' };
    this.themeConfig.set({ ...defaults, ...page.theme });
  }

  savePage(): void {
    const pageConfig: SitePageConfig = {
      blocks: this.blocks(),
      theme: this.themeConfig()
    };
    this.mockData.saveSitePage(this.studioSlug, pageConfig);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  toggleMobilePreview(): void { this.mobilePreview.set(true); }
  toggleDesktopPreview(): void { this.mobilePreview.set(false); }

  selectBlock(id: string, event: Event): void {
    event.stopPropagation();
    this.selectedBlockId.set(id);
    this.showThemePanel.set(false);
  }

  addBlock(type: SiteBlockType): void {
    const newId = `block-${type}-${Date.now()}`;
    let config: any = {};

    switch (type) {
      case 'text':
        config = { content: '<p>Scrivi qui il tuo testo...</p>', align: 'left', fontSize: 'normal', color: '#1e293b' } as TextBlockConfig;
        break;
      case 'image':
        config = { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80', alt: 'Immagine studio', width: 'full', borderRadius: 'md' } as ImageBlockConfig;
        break;
      case 'gallery':
        config = { images: [], columns: 3, borderRadius: 'md' } as GalleryBlockConfig;
        break;
      case 'video':
        config = { url: '', aspectRatio: '16:9' } as VideoBlockConfig;
        break;
      case 'map':
        config = { address: '', embedUrl: '', height: 350 } as MapBlockConfig;
        break;
      case 'phone-button':
        config = { phoneNumber: '', label: 'Chiama lo Studio', color: 'primary', icon: true, size: 'md', align: 'center' } as PhoneButtonConfig;
        break;
      case 'spacer':
        config = { height: 32 } as SpacerBlockConfig;
        break;
      case 'divider':
        config = { style: 'solid', color: '#e2e8f0', thickness: 1 } as DividerBlockConfig;
        break;
      case 'hero':
        config = {
          title: 'Benvenuti nel nostro Studio',
          subtitle: 'Prenota la tua visita o entra in coda digitale in pochi secondi.',
          imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
          overlayOpacity: 0.5,
          minHeight: 380,
          textAlign: 'center'
        } as HeroBlockConfig;
        break;
    }

    const newBlock: SiteBlock = { id: newId, type, order: this.blocks().length, config, paddingY: 'md' };
    this.blocks.update(b => [...b, newBlock]);
    this.selectedBlockId.set(newId);
    this.showThemePanel.set(false);

    setTimeout(() => {
      document.querySelector('.overflow-y-auto')?.scrollTo({ top: 99999, behavior: 'smooth' });
    }, 50);
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

  duplicateBlock(id: string, event: Event): void {
    event.stopPropagation();
    const block = this.blocks().find(b => b.id === id);
    if (!block) return;
    const copy: SiteBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${block.type}-${Date.now()}`,
      order: block.order + 0.5
    };
    this.blocks.update(b => {
      const arr = [...b, copy].sort((a, x) => a.order - x.order);
      return this.recalcOrder(arr);
    });
    this.selectedBlockId.set(copy.id);
  }

  moveBlock(id: string, direction: 1 | -1, event: Event): void {
    event.stopPropagation();
    const arr = [...this.blocks()];
    const idx = arr.findIndex(b => b.id === id);
    const newIdx = idx + direction;
    if (newIdx >= 0 && newIdx < arr.length) {
      moveItemInArray(arr, idx, newIdx);
      this.blocks.set(this.recalcOrder(arr));
    }
  }

  drop(event: CdkDragDrop<SiteBlock[]>): void {
    const arr = [...this.blocks()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.blocks.set(this.recalcOrder(arr));
  }

  updateBlockConfig(key: string, value: any): void {
    const id = this.selectedBlockId();
    if (!id) return;
    this.blocks.update(blocks =>
      blocks.map(b => b.id !== id ? b : { ...b, config: { ...b.config, [key]: value } })
    );
  }

  updateBlockProp(key: keyof SiteBlock, value: any): void {
    const id = this.selectedBlockId();
    if (!id) return;
    this.blocks.update(blocks =>
      blocks.map(b => b.id !== id ? b : { ...b, [key]: value })
    );
  }

  updateTheme(key: string, value: string): void {
    this.themeConfig.update(t => ({ ...t, [key]: value }));
  }

  applyTextFormat(wrap: string): void {
    const id = this.selectedBlockId();
    if (!id) return;
    const current = this.blocks().find(b => b.id === id)?.config['content'] || '';
    let newContent = current;
    if (wrap === 'ul-li') {
      newContent = current + '\n<ul>\n  <li>Elemento lista</li>\n</ul>';
    } else if (wrap === 'ol-li') {
      newContent = current + '\n<ol>\n  <li>Primo elemento</li>\n</ol>';
    } else {
      newContent = current + `\n<${wrap}>Nuovo contenuto</${wrap}>`;
    }
    this.updateBlockConfig('content', newContent);
  }

  onImageUpload(event: Event, configKey: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Immagine troppo grande. Max 5 MB.');
      return;
    }
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
        if (processed === files.length) {
          this.updateBlockConfig('images', newImages);
        }
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
    return ({
      text: 'pi pi-align-left', image: 'pi pi-camera', gallery: 'pi pi-images',
      video: 'pi pi-video', map: 'pi pi-map-marker', 'phone-button': 'pi pi-phone',
      spacer: 'pi pi-arrows-v', hero: 'pi pi-image', divider: 'pi pi-minus'
    })[type] || 'pi pi-box';
  }

  getBlockLabel(type: SiteBlockType): string {
    return ({
      text: 'Testo', image: 'Immagine', gallery: 'Galleria', video: 'Video',
      map: 'Mappa', 'phone-button': 'Telefono', spacer: 'Spazio', hero: 'Hero', divider: 'Divisore'
    })[type] || 'Blocco';
  }
}
