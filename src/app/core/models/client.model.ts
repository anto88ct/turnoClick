export type PaymentMethod = 'contanti' | 'carta' | 'misto';

export interface PaymentDetails {
  cashAmount: number;
  cardAmount: number;
}

export interface Visit {
  id: string;
  date: Date;
  doctorName: string;
  serviceName: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDetails: PaymentDetails;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  uploadDate: Date;
  url: string; // data URL or mock file link
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  fiscalCode: string;
  address: string;
  createdAt: Date;
  visits: Visit[];
  attachments: Attachment[];
}
