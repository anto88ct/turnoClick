import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, signal } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ad-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-file-upload.component.html',
  styleUrls: ['./ad-file-upload.component.scss']
})
export class AdFileUploadComponent extends BaseComponent {
  @Input() accept: string = 'image/*,application/pdf';
  @Input() multiple: boolean = false;
  @Input() maxFileSize: number = 10 * 1024 * 1024; // 10MB default
  @Input() disabled: boolean = false;

  @Output() onSelect = new EventEmitter<File[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  readonly isDragOver = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  triggerSelect(): void {
    if (this.disabled) return;
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
      input.value = ''; // Reset input
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled) return;
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (this.disabled) return;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    this.errorMessage.set('');
    
    // Filter by count if not multiple
    let selected = files;
    if (!this.multiple && selected.length > 1) {
      selected = [selected[0]];
    }

    // Validate size and type
    const validFiles: File[] = [];
    const allowedTypes = this.accept.split(',').map(t => t.trim());

    for (const file of selected) {
      // Check size
      if (file.size > this.maxFileSize) {
        this.errorMessage.set(`Il file "${file.name}" supera il limite di dimensione (${this.formatSize(this.maxFileSize)}).`);
        return;
      }
      
      // Basic extension check
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = allowedTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type.startsWith('.')) return type.toLowerCase() === ext;
        return file.type === type;
      });

      if (!isAccepted) {
        this.errorMessage.set(`Il file "${file.name}" ha un formato non supportato.`);
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      this.onSelect.emit(validFiles);
    }
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
