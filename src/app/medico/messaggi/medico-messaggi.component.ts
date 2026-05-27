import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';

type Tab = 'segreteria' | 'colleghi';

@Component({
  selector: 'app-medico-messaggi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex flex-col h-full' },
  template: `
    <div class="flex flex-1 overflow-hidden min-h-0" style="height: calc(100dvh - 6.5rem)">

      <!-- Left panel: inbox list -->
      <aside class="w-64 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col">
        <div class="px-4 py-4 border-b border-slate-100">
          <h2 class="text-sm font-extrabold text-slate-900">Messaggi</h2>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-slate-100">
          <button
            class="flex-1 py-2.5 text-xs font-bold border-b-2 transition-all"
            [class]="activeTab() === 'segreteria'
              ? 'border-tc-500 text-tc-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'"
            (click)="activeTab.set('segreteria'); selectedThread.set(null)"
          >
            Segreteria
            @if (unreadFromSecreteria() > 0) {
              <span class="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-xs">{{ unreadFromSecreteria() }}</span>
            }
          </button>
          <button
            class="flex-1 py-2.5 text-xs font-bold border-b-2 transition-all"
            [class]="activeTab() === 'colleghi'
              ? 'border-tc-500 text-tc-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'"
            (click)="activeTab.set('colleghi'); selectedThread.set(null)"
          >
            Colleghi
            @if (unreadFromColleghi() > 0) {
              <span class="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-xs">{{ unreadFromColleghi() }}</span>
            }
          </button>
        </div>

        <!-- Thread list -->
        <div class="flex-1 overflow-y-auto">
          @if (activeTab() === 'segreteria') {
            <!-- Single segreteria thread -->
            <button
              class="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-all text-left"
              [class.bg-tc-50]="selectedThread() === 'segreteria'"
              (click)="selectThread('segreteria')"
            >
              <div class="w-10 h-10 rounded-full bg-tc-500 text-white font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                S
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-800">Segreteria</p>
                <p class="text-xs text-slate-400 truncate">{{ lastSecreteriaMessage() }}</p>
              </div>
              @if (unreadFromSecreteria() > 0) {
                <span class="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {{ unreadFromSecreteria() }}
                </span>
              }
            </button>
          } @else {
            <!-- Colleghi threads -->
            @for (doc of otherDoctors(); track doc.id) {
              @if (hasThreadWith(doc.id)) {
                <button
                  class="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-all text-left"
                  [class.bg-tc-50]="selectedThread() === doc.id"
                  (click)="selectThread(doc.id)"
                >
                  <img [src]="doc.photoUrl" [alt]="doc.name" class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{{ doc.name }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ doc.specialty }}</p>
                  </div>
                  @if (unreadFrom(doc.id) > 0) {
                    <span class="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {{ unreadFrom(doc.id) }}
                    </span>
                  }
                </button>
              }
            }

            <!-- New conversation -->
            <div class="px-4 py-3 border-t border-slate-100">
              <p class="text-xs text-slate-400 font-bold mb-2">Nuova conversazione</p>
              @for (doc of otherDoctors(); track doc.id) {
                @if (!hasThreadWith(doc.id)) {
                  <button
                    class="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all text-left mb-1"
                    (click)="selectThread(doc.id)"
                  >
                    <img [src]="doc.photoUrl" [alt]="doc.name" class="w-7 h-7 rounded-full object-cover" />
                    <span class="text-xs font-semibold text-slate-600 truncate">{{ doc.name }}</span>
                  </button>
                }
              }
            </div>
          }
        </div>
      </aside>

      <!-- Chat area -->
      <div class="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
        @if (selectedThread(); as threadId) {
          <!-- Chat header -->
          <div class="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-slate-100 flex-shrink-0">
            @if (threadId === 'segreteria') {
              <div class="w-10 h-10 rounded-full bg-tc-500 text-white font-extrabold flex items-center justify-center text-sm">S</div>
              <div>
                <p class="font-bold text-slate-900 text-sm">Segreteria</p>
                <p class="text-xs text-slate-400">Studio Medico Dott. Rossi</p>
              </div>
            } @else {
              @if (getDoctorById(threadId); as doc) {
                <img [src]="doc.photoUrl" [alt]="doc.name" class="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p class="font-bold text-slate-900 text-sm">{{ doc.name }}</p>
                  <p class="text-xs text-slate-400">{{ doc.specialty }}</p>
                </div>
              }
            }
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            @if (currentThreadMessages().length === 0) {
              <div class="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
                <svg class="w-12 h-12 opacity-20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p class="font-semibold text-sm">Nessun messaggio in questa conversazione</p>
              </div>
            } @else {
              @for (msg of currentThreadMessages(); track msg.id) {
                @if (isMine(msg)) {
                  <div class="flex justify-end">
                    <div class="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl rounded-br-md bg-tc-500 text-white text-sm shadow-sm">
                      <p>{{ msg.body }}</p>
                      <p class="text-xs mt-1 opacity-60">{{ formatTime(msg.createdAt) }}</p>
                    </div>
                  </div>
                } @else {
                  <div class="flex justify-start">
                    <div class="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl rounded-bl-md bg-white border border-slate-100 text-slate-800 text-sm shadow-sm">
                      <p class="text-xs font-bold mb-1 text-slate-400">{{ msg.fromName }}</p>
                      <p>{{ msg.body }}</p>
                      <p class="text-xs mt-1 text-slate-400">{{ formatTime(msg.createdAt) }}</p>
                    </div>
                  </div>
                }
              }
            }
          </div>

          <!-- Composer -->
          <div class="px-5 py-4 bg-white border-t border-slate-100 flex-shrink-0">
            <div class="flex gap-3 items-end">
              <textarea
                [(ngModel)]="messageText"
                (keydown.enter)="onEnterKey($any($event))"
                [placeholder]="replyPlaceholder()"
                rows="2"
                class="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800
                       placeholder-slate-400 focus:border-tc-400 focus:ring-2 focus:ring-tc-100 focus:outline-none transition-all"
              ></textarea>
              <button
                (click)="sendMessage()"
                [disabled]="!messageText.trim()"
                class="w-11 h-11 rounded-2xl bg-tc-500 hover:bg-tc-600 disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center justify-center text-white transition-all flex-shrink-0"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p class="font-bold text-slate-600 text-sm">Seleziona una conversazione</p>
            <p class="text-xs mt-1">Scegli dalla lista a sinistra per leggere e rispondere ai messaggi</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class MedicoMessaggiComponent {
  private readonly mockData = inject(MockDataService);

  readonly activeTab = signal<Tab>('segreteria');
  readonly selectedThread = signal<string | null>(null);
  messageText = '';

  readonly activeDoctorId = this.mockData.activeDoctorId;
  readonly doctors = this.mockData.doctors;

  readonly otherDoctors = computed(() =>
    this.doctors().filter(d => d.id !== this.activeDoctorId())
  );

  readonly allMyMessages = computed(() =>
    this.mockData.messagesForDoctor(this.activeDoctorId())()
  );

  readonly unreadFromSecreteria = computed(() =>
    this.allMyMessages().filter(m => m.fromType === 'segreteria' && !m.read).length
  );

  readonly unreadFromColleghi = computed(() =>
    this.allMyMessages().filter(m => m.fromType === 'medico' && m.fromId !== this.activeDoctorId() && !m.read).length
  );

  readonly lastSecreteriaMessage = computed(() => {
    const msgs = this.allMyMessages().filter(m => m.fromType === 'segreteria' || m.toId === this.activeDoctorId());
    if (!msgs.length) return 'Nessun messaggio';
    return msgs[msgs.length - 1]?.body.substring(0, 50) + '...';
  });

  readonly currentThreadMessages = computed(() => {
    const threadId = this.selectedThread();
    if (!threadId) return [];
    const myId = this.activeDoctorId();

    if (threadId === 'segreteria') {
      return this.mockData.doctorMessages()
        .filter(m =>
          (m.toId === myId && m.fromType === 'segreteria') ||
          (m.fromId === myId && m.toId === 'segreteria')
        )
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    return this.mockData.doctorMessages()
      .filter(m =>
        (m.fromId === myId && m.toId === threadId) ||
        (m.fromId === threadId && m.toId === myId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  });

  hasThreadWith(doctorId: string): boolean {
    const myId = this.activeDoctorId();
    return this.mockData.doctorMessages().some(m =>
      (m.fromId === myId && m.toId === doctorId) ||
      (m.fromId === doctorId && m.toId === myId)
    );
  }

  unreadFrom(fromId: string): number {
    return this.mockData.doctorMessages()
      .filter(m => m.fromId === fromId && m.toId === this.activeDoctorId() && !m.read).length;
  }

  selectThread(threadId: string): void {
    this.selectedThread.set(threadId);
    if (threadId === 'segreteria') {
      this.mockData.markMessagesReadForDoctor(this.activeDoctorId());
    }
  }

  getDoctorById(id: string) {
    return this.doctors().find(d => d.id === id);
  }

  isMine(msg: { fromId: string; fromType: string }): boolean {
    return msg.fromId === this.activeDoctorId() || msg.fromType !== 'segreteria' && msg.fromId !== 'segreteria' && msg.fromId === this.activeDoctorId();
  }

  readonly replyPlaceholder = computed(() => {
    const t = this.selectedThread();
    if (!t) return '';
    if (t === 'segreteria') return 'Rispondi alla segreteria...';
    const doc = this.getDoctorById(t);
    return doc ? `Scrivi a ${doc.name}...` : 'Scrivi un messaggio...';
  });

  sendMessage(): void {
    const threadId = this.selectedThread();
    if (!threadId || !this.messageText.trim()) return;
    const myId = this.activeDoctorId();
    const myDoc = this.doctors().find(d => d.id === myId);

    if (threadId === 'segreteria') {
      this.mockData.sendMessage({
        fromType: 'medico',
        fromId: myId,
        fromName: myDoc?.name ?? 'Medico',
        toId: 'segreteria',
        body: this.messageText.trim(),
      });
    } else {
      this.mockData.sendMessage({
        fromType: 'medico',
        fromId: myId,
        fromName: myDoc?.name ?? 'Medico',
        toId: threadId,
        body: this.messageText.trim(),
      });
    }
    this.messageText = '';
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
