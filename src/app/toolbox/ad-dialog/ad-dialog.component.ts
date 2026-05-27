import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'ad-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './ad-dialog.component.html',
  styleUrls: ['./ad-dialog.component.scss']
})
export class AdDialogComponent extends BaseComponent {
  @Input() header: string = '';
  @Input() visible: boolean = false;
  @Input() modal: boolean = true;
  @Input() width: string = '50vw';
  @Input() draggable: boolean = false;
  @Input() resizable: boolean = false;
  @Input() styleClass: string = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onHide = new EventEmitter<void>();

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onHide.emit();
  }
}
