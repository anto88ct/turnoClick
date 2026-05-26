import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-demo-switcher',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 border-b border-slate-800 shadow-lg">
      <div class="flex items-center justify-between px-3 h-9 max-w-screen-2xl mx-auto">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5">
            <div class="w-5 h-5 rounded-lg bg-tc-500 flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-xs font-extrabold text-white tracking-tight">TurnoClick</span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <a
            routerLink="/p/studio-demo"
            routerLinkActive="bg-tc-500/20 text-tc-400"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400
                   hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Paziente
          </a>
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-tc-500/20 text-tc-400"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400
                   hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1"/>
              <rect width="7" height="5" x="14" y="3" rx="1"/>
              <rect width="7" height="9" x="14" y="12" rx="1"/>
              <rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            Segreteria
          </a>
          <a
            routerLink="/studio"
            routerLinkActive="bg-tc-500/20 text-tc-400"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400
                   hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Admin Studio
          </a>
          <a
            routerLink="/admin"
            routerLinkActive="bg-tc-500/20 text-tc-400"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400
                   hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            Admin Master
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DemoSwitcherComponent {}
