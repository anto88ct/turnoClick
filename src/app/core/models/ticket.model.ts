export type TicketStatus = 'aperto' | 'in_corso' | 'in_attesa_riscontro' | 'chiuso';
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  aperto:               'Aperto',
  in_corso:             'In corso',
  in_attesa_riscontro:  'In attesa di riscontro',
  chiuso:               'Chiuso',
};
export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  aperto:               'bg-rose-100 text-rose-700',
  in_corso:             'bg-amber-100 text-amber-700',
  in_attesa_riscontro:  'bg-blue-100 text-blue-700',
  chiuso:               'bg-emerald-100 text-emerald-700',
};

export const TICKET_OPERATORS = [
  { id: 'nicolo',  name: 'Nicolò Cambria' },
  { id: 'antonio', name: 'Antonio D\'Arrigo' },
];

export interface SupportTicket {
  id: string;
  studioId: string;
  studioName: string;
  description: string;
  email: string;
  phone: string;
  extraPhone?: string;
  contactName?: string;
  status: TicketStatus;
  assignedTo?: string;   // operator id
  internalNote?: string; // admin only
  createdAt: string;     // ISO string (localStorage-safe)
  updatedAt: string;
}
