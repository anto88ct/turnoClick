import { Component, inject, signal, computed } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Client, Visit, Attachment, PaymentMethod } from '../../core/models/client.model';
import { AdButtonComponent } from '../../toolbox/ad-button/ad-button.component';
import { AdInputComponent } from '../../toolbox/ad-input/ad-input.component';
import { AdTableComponent } from '../../toolbox/ad-table/ad-table.component';
import { AdDialogComponent } from '../../toolbox/ad-dialog/ad-dialog.component';
import { AdFileUploadComponent } from '../../toolbox/ad-file-upload/ad-file-upload.component';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdButtonComponent,
    AdInputComponent,
    AdTableComponent,
    AdDialogComponent,
    AdFileUploadComponent
  ],
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent extends BaseComponent {
  private readonly mockData = inject(MockDataService);

  readonly searchQuery = signal<string>('');
  readonly selectedClientId = signal<string | null>(null);
  
  // Dialog visibility states
  readonly showNewClientDialog = signal<boolean>(false);
  readonly showNewVisitDialog = signal<boolean>(false);
  
  // Tab control
  readonly activeTab = signal<'anagrafica' | 'visite' | 'documenti'>('anagrafica');
  readonly isEditingRegistry = signal<boolean>(false);

  // Form states
  editForm = {
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    fiscalCode: '',
    address: ''
  };

  newClientForm = {
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    fiscalCode: '',
    address: ''
  };

  newVisitForm = {
    doctorName: 'Dott. Marco Rossi',
    serviceName: 'Visita di Controllo',
    amount: 100,
    paymentMethod: 'misto' as PaymentMethod,
    cashPercentage: 50 // slider/percentage for misto
  };

  // Form errors
  editErrors: Record<string, string> = {};
  newClientErrors: Record<string, string> = {};

  // Table columns definition
  readonly tableColumns = [
    { field: 'name', header: 'Nome e Cognome' },
    { field: 'phone', header: 'Telefono' },
    { field: 'email', header: 'Email' },
    { field: 'fiscalCode', header: 'Codice Fiscale' },
    { field: 'actions', header: 'Azioni', width: '120px' }
  ];

  // Dynamic lists from Service
  readonly allClients = computed(() => this.mockData.clients());
  
  readonly filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allClients();

    return this.allClients().filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.fiscalCode.toLowerCase().includes(query)
    );
  });

  readonly selectedClient = computed(() => {
    const id = this.selectedClientId();
    if (!id) return null;
    return this.allClients().find(c => c.id === id) || null;
  });

  selectClient(client: Client): void {
    this.selectedClientId.set(client.id);
    this.activeTab.set('anagrafica');
    this.isEditingRegistry.set(false);
    this.resetEditForm(client);
  }

  resetEditForm(client: Client): void {
    this.editForm = {
      name: client.name,
      phone: client.phone,
      email: client.email,
      birthDate: client.birthDate,
      fiscalCode: client.fiscalCode,
      address: client.address
    };
    this.editErrors = {};
  }

  toggleEditMode(): void {
    if (this.isEditingRegistry()) {
      // Cancel
      if (this.selectedClient()) {
        this.resetEditForm(this.selectedClient()!);
      }
      this.isEditingRegistry.set(false);
    } else {
      // Edit
      this.isEditingRegistry.set(true);
    }
  }

  saveRegistry(): void {
    const client = this.selectedClient();
    if (!client) return;

    this.editErrors = {};
    if (!this.editForm.name.trim()) this.editErrors['name'] = 'Il nome è obbligatorio';
    if (!this.editForm.phone.trim()) this.editErrors['phone'] = 'Il telefono è obbligatorio';
    if (!this.editForm.email.trim()) this.editErrors['email'] = 'L\'email è obbligatoria';
    if (!this.editForm.fiscalCode.trim()) this.editErrors['fiscalCode'] = 'Il codice fiscale è obbligatorio';

    if (Object.keys(this.editErrors).length > 0) return;

    this.setLoading(true);
    
    // Simulate delay
    setTimeout(() => {
      const updated: Client = {
        ...client,
        ...this.editForm
      };
      
      this.mockData.updateClient(updated);
      this.isEditingRegistry.set(false);
      this.setLoading(false);
    }, 600);
  }

  openNewClientDialog(): void {
    this.newClientForm = {
      name: '',
      phone: '',
      email: '',
      birthDate: '1980-01-01',
      fiscalCode: '',
      address: ''
    };
    this.newClientErrors = {};
    this.showNewClientDialog.set(true);
  }

  createClient(): void {
    this.newClientErrors = {};
    if (!this.newClientForm.name.trim()) this.newClientErrors['name'] = 'Il nome è obbligatorio';
    if (!this.newClientForm.phone.trim()) this.newClientErrors['phone'] = 'Il telefono è obbligatorio';
    if (!this.newClientForm.email.trim()) this.newClientErrors['email'] = 'L\'email è obbligatoria';
    if (!this.newClientForm.fiscalCode.trim()) this.newClientErrors['fiscalCode'] = 'Il codice fiscale è obbligatorio';

    if (Object.keys(this.newClientErrors).length > 0) return;

    this.setLoading(true);
    setTimeout(() => {
      const added = this.mockData.addClient(this.newClientForm);
      this.showNewClientDialog.set(false);
      this.selectClient(added);
      this.setLoading(false);
    }, 600);
  }

  openNewVisitDialog(): void {
    this.newVisitForm = {
      doctorName: 'Dott. Marco Rossi',
      serviceName: 'Visita Specialistica',
      amount: 100,
      paymentMethod: 'carta',
      cashPercentage: 50
    };
    this.showNewVisitDialog.set(true);
  }

  registerVisit(): void {
    const client = this.selectedClient();
    if (!client) return;

    const amount = this.newVisitForm.amount;
    const method = this.newVisitForm.paymentMethod;
    let cashAmount = 0;
    let cardAmount = 0;

    if (method === 'contanti') {
      cashAmount = amount;
    } else if (method === 'carta') {
      cardAmount = amount;
    } else {
      const pct = this.newVisitForm.cashPercentage / 100;
      cashAmount = amount * pct;
      cardAmount = amount * (1 - pct);
    }

    this.mockData.addVisitToClient(client.id, {
      date: new Date(),
      doctorName: this.newVisitForm.doctorName,
      serviceName: this.newVisitForm.serviceName,
      paymentMethod: method,
      amount,
      paymentDetails: { cashAmount, cardAmount }
    });

    this.showNewVisitDialog.set(false);
  }

  onFileSelect(files: File[]): void {
    const client = this.selectedClient();
    if (!client) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const type: 'pdf' | 'image' | 'doc' | 'other' = 
          file.type === 'application/pdf' ? 'pdf' :
          file.type.startsWith('image/') ? 'image' : 'other';

        this.mockData.addAttachmentToClient(client.id, {
          name: file.name,
          size: this.formatBytes(file.size),
          type,
          url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    });
  }

  deleteAttachment(attachmentId: string): void {
    const client = this.selectedClient();
    if (!client) return;

    if (confirm('Sei sicuro di voler eliminare questo documento?')) {
      this.mockData.deleteAttachmentFromClient(client.id, attachmentId);
    }
  }

  formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getClientInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
