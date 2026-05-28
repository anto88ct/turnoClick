import { Component, Input } from '@angular/core';
import { NgStyle, NgClass } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import {
  SiteBlock,
  TextBlockConfig,
  ImageBlockConfig,
  GalleryBlockConfig,
  VideoBlockConfig,
  MapBlockConfig,
  PhoneButtonConfig,
  SpacerBlockConfig,
  HeroBlockConfig,
  DividerBlockConfig,
  ColumnsBlockConfig
} from '../../core/models/site-builder.model';

@Component({
  selector: 'app-site-block-renderer',
  standalone: true,
  imports: [NgStyle, NgClass],
  template: `
    <div [ngStyle]="wrapperStyle()" class="w-full">
      @switch (block.type) {

        @case ('text') {
          <div [innerHTML]="safeHtml(textConfig.content)"
               [ngStyle]="{
                 'text-align': textConfig.align,
                 'font-size': getFontSize(textConfig.fontSize),
                 'color': textConfig.color,
                 'line-height': '1.75'
               }"
               class="prose max-w-none">
          </div>
        }

        @case ('image') {
          <div class="flex flex-col items-center">
            @if (imageConfig.url) {
              <img [src]="imageConfig.url"
                   [alt]="imageConfig.alt"
                   [ngClass]="[getWidthClass(imageConfig.width), getBorderRadiusClass(imageConfig.borderRadius)]"
                   class="object-cover h-auto shadow-sm" />
            } @else {
              <div [ngClass]="getWidthClass(imageConfig.width)"
                   class="bg-slate-100 rounded-xl flex flex-col items-center justify-center py-12 text-slate-400">
                <svg class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-sm">Nessuna immagine</span>
              </div>
            }
            @if (imageConfig.caption) {
              <p class="text-xs text-slate-500 mt-2 text-center">{{ imageConfig.caption }}</p>
            }
          </div>
        }

        @case ('gallery') {
          <div [ngClass]="getGalleryGridClass(galleryConfig.columns)" class="grid gap-3">
            @for (img of galleryConfig.images; track img.url; let i = $index) {
              <div class="overflow-hidden" [ngClass]="getBorderRadiusClass(galleryConfig.borderRadius)">
                <img [src]="img.url" [alt]="img.alt"
                     class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                @if (img.caption) {
                  <p class="text-xs text-slate-500 text-center mt-1 pb-1">{{ img.caption }}</p>
                }
              </div>
            }
            @if (galleryConfig.images.length === 0) {
              <div class="col-span-full bg-slate-100 rounded-xl flex flex-col items-center justify-center py-16 text-slate-400">
                <svg class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-sm">Galleria vuota</span>
              </div>
            }
          </div>
        }

        @case ('video') {
          <div class="w-full relative bg-slate-100 rounded-xl overflow-hidden shadow-sm"
               [ngStyle]="{'padding-top': getAspectRatioPadding(videoConfig.aspectRatio)}">
            @if (safeVideoUrl) {
              <iframe [src]="safeVideoUrl"
                      class="absolute top-0 left-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen></iframe>
            } @else {
              <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
                </svg>
                <span class="text-sm">URL video non valido o non inserito</span>
              </div>
            }
          </div>
        }

        @case ('map') {
          <div class="w-full rounded-xl overflow-hidden shadow-sm bg-slate-100"
               [ngStyle]="{'height.px': mapConfig.height}">
            @if (safeMapUrl) {
              <iframe [src]="safeMapUrl"
                      class="w-full h-full border-0"
                      allowfullscreen
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"></iframe>
            } @else {
              <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <svg class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span class="text-sm">{{ mapConfig.address || 'Inserisci il codice embed di Google Maps' }}</span>
              </div>
            }
          </div>
        }

        @case ('phone-button') {
          <div [ngClass]="getButtonAlignClass(phoneConfig.align)" class="flex my-2">
            <a [href]="'tel:' + phoneConfig.phoneNumber"
               [ngClass]="[getButtonClasses(phoneConfig.color), getButtonSizeClass(phoneConfig.size), phoneConfig.align === 'full' ? 'w-full' : '']"
               class="inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-center no-underline">
              @if (phoneConfig.icon) {
                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
              {{ phoneConfig.label }}
            </a>
          </div>
        }

        @case ('spacer') {
          <div [ngStyle]="{'height.px': spacerConfig.height}" class="w-full"></div>
        }

        @case ('divider') {
          <div class="w-full flex items-center">
            <hr [ngStyle]="{
              'border-style': dividerConfig.style,
              'border-color': dividerConfig.color,
              'border-top-width': dividerConfig.thickness + 'px'
            }" class="w-full border-0 border-t" />
          </div>
        }

        @case ('hero') {
          <div class="relative w-full overflow-hidden flex items-center justify-center"
               [ngStyle]="{
                 'min-height.px': heroConfig.minHeight || 320,
                 'text-align': heroConfig.textAlign || 'center'
               }">
            @if (heroConfig.imageUrl) {
              <img [src]="heroConfig.imageUrl" class="absolute inset-0 w-full h-full object-cover" alt="" />
            }
            <div class="absolute inset-0 bg-slate-900" [ngStyle]="{'opacity': heroConfig.overlayOpacity}"></div>
            <div class="relative z-10 max-w-2xl mx-auto flex flex-col items-center px-6 py-12">
              @if (heroConfig.title) {
                <h2 class="text-3xl sm:text-5xl font-extrabold text-white mb-4 drop-shadow-md leading-tight"
                    style="text-wrap: balance">
                  {{ heroConfig.title }}
                </h2>
              }
              @if (heroConfig.subtitle) {
                <p class="text-base sm:text-lg text-white/85 mb-8 font-medium drop-shadow"
                   style="text-wrap: pretty; white-space: pre-line">
                  {{ heroConfig.subtitle }}
                </p>
              }
              @if (heroConfig.buttonLabel && heroConfig.buttonLink) {
                <a [href]="heroConfig.buttonLink"
                   class="inline-flex items-center justify-center px-8 py-3.5 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 no-underline">
                  {{ heroConfig.buttonLabel }}
                </a>
              }
            </div>
          </div>
        }

        @case ('columns') {
          <div class="flex gap-6 sm:gap-10"
               [class]="columnsConfig.layout === 'image-right' ? 'flex-col sm:flex-row-reverse' : 'flex-col sm:flex-row'"
               [ngStyle]="{'align-items': columnsConfig.verticalAlign === 'center' ? 'center' : 'flex-start'}">

            <!-- Image side -->
            <div class="flex-shrink-0 w-full"
                 [ngStyle]="{'flex-basis': columnsConfig.imageWidthPercent + '%'}">
              @if (columnsConfig.imageUrl) {
                <img [src]="columnsConfig.imageUrl"
                     [alt]="columnsConfig.imageAlt"
                     class="w-full h-auto object-cover shadow-md"
                     [ngClass]="getBorderRadiusClass(columnsConfig.imageRounded)" />
              } @else {
                <div class="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              }
            </div>

            <!-- Text side -->
            <div class="flex-1 min-w-0">
              <div [innerHTML]="safeHtml(columnsConfig.content)"
                   class="prose max-w-none"
                   style="line-height: 1.75">
              </div>
            </div>
          </div>
        }

      }
    </div>
  `
})
export class SiteBlockRendererComponent {
  @Input({ required: true }) block!: SiteBlock;

  constructor(private sanitizer: DomSanitizer) {}

  get textConfig(): TextBlockConfig { return this.block.config as TextBlockConfig; }
  get imageConfig(): ImageBlockConfig { return this.block.config as ImageBlockConfig; }
  get galleryConfig(): GalleryBlockConfig { return this.block.config as GalleryBlockConfig; }
  get videoConfig(): VideoBlockConfig { return this.block.config as VideoBlockConfig; }
  get mapConfig(): MapBlockConfig { return this.block.config as MapBlockConfig; }
  get phoneConfig(): PhoneButtonConfig { return this.block.config as PhoneButtonConfig; }
  get spacerConfig(): SpacerBlockConfig { return this.block.config as SpacerBlockConfig; }
  get heroConfig(): HeroBlockConfig { return this.block.config as HeroBlockConfig; }
  get dividerConfig(): DividerBlockConfig { return this.block.config as DividerBlockConfig; }
  get columnsConfig(): ColumnsBlockConfig { return this.block.config as ColumnsBlockConfig; }

  wrapperStyle(): Record<string, string> {
    const styles: Record<string, string> = {};
    if (this.block.backgroundColor) {
      styles['background-color'] = this.block.backgroundColor;
    }
    const paddingMap: Record<string, string> = {
      none: '0',
      sm: '8px 16px',
      md: '24px 24px',
      lg: '48px 24px',
    };
    if (this.block.paddingY && this.block.paddingY !== 'none') {
      styles['padding'] = paddingMap[this.block.paddingY] || '0';
    }
    return styles;
  }

  safeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content || '');
  }

  get safeVideoUrl(): SafeResourceUrl | null {
    const url = (this.block.config as VideoBlockConfig).url;
    if (!url) return null;

    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('vimeo.com/')) {
      const vimeoId = url.split('/').pop()?.split('?')[0];
      embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  get safeMapUrl(): SafeResourceUrl | null {
    const url = (this.block.config as MapBlockConfig).embedUrl;
    if (!url) return null;
    const srcMatch = url.match(/src="([^"]+)"/);
    const finalUrl = srcMatch ? srcMatch[1] : url;
    if (!finalUrl.startsWith('http')) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  getFontSize(size: string): string {
    return ({ small: '0.875rem', normal: '1rem', large: '1.25rem', xlarge: '1.75rem' })[size] || '1rem';
  }

  getWidthClass(width: string): string {
    return ({ full: 'w-full', large: 'w-4/5', medium: 'w-3/5', small: 'w-2/5' })[width] || 'w-full';
  }

  getBorderRadiusClass(radius: string): string {
    return ({ none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full' })[radius] || 'rounded-none';
  }

  getAspectRatioPadding(ratio: string): string {
    return ({ '16:9': '56.25%', '4:3': '75%', '1:1': '100%' })[ratio] || '56.25%';
  }

  getButtonClasses(color: string): string {
    return ({
      primary: 'bg-tc-500 text-white hover:bg-tc-600',
      secondary: 'bg-slate-800 text-white hover:bg-slate-900',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600',
      outline: 'bg-transparent border-2 border-tc-500 text-tc-600 hover:bg-tc-50'
    })[color] || 'bg-tc-500 text-white hover:bg-tc-600';
  }

  getButtonSizeClass(size: string): string {
    return ({ sm: 'px-5 py-2.5 text-sm', md: 'px-7 py-3.5 text-base', lg: 'px-10 py-4 text-lg' })[size] || 'px-7 py-3.5 text-base';
  }

  getButtonAlignClass(align: string): string {
    return ({ left: 'justify-start', center: 'justify-center', right: 'justify-end', full: 'justify-center' })[align] || 'justify-center';
  }

  getGalleryGridClass(columns: number): string {
    return ({ 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' })[columns] || 'grid-cols-2 sm:grid-cols-3';
  }
}
