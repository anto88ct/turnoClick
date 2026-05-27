import { Injectable, signal } from '@angular/core';
import { SupportTicket, TicketStatus } from '../models/ticket.model';

const LS_KEY = 'tc_support_tickets';

@Injectable({ providedIn: 'root' })
export class HelpTicketService {
  private _tickets = signal<SupportTicket[]>(this.load());
  readonly tickets = this._tickets.asReadonly();

  private load(): SupportTicket[] {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private save(): void {
    localStorage.setItem(LS_KEY, JSON.stringify(this._tickets()));
  }

  createTicket(data: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>): SupportTicket {
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      ...data,
      id: `TK-${Date.now().toString(36).toUpperCase()}`,
      status: 'aperto',
      createdAt: now,
      updatedAt: now,
    };
    this._tickets.update(t => [ticket, ...t]);
    this.save();
    return ticket;
  }

  updateStatus(id: string, status: TicketStatus): void {
    this._tickets.update(ts =>
      ts.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)
    );
    this.save();
  }

  assignOperator(id: string, operatorId: string): void {
    this._tickets.update(ts =>
      ts.map(t => t.id === id ? { ...t, assignedTo: operatorId, updatedAt: new Date().toISOString() } : t)
    );
    this.save();
  }

  setInternalNote(id: string, note: string): void {
    this._tickets.update(ts =>
      ts.map(t => t.id === id ? { ...t, internalNote: note, updatedAt: new Date().toISOString() } : t)
    );
    this.save();
  }

  getByStudio(studioId: string): SupportTicket[] {
    return this._tickets().filter(t => t.studioId === studioId);
  }
}
