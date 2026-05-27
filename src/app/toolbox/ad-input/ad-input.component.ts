import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ad-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ad-input.component.html',
  styleUrls: ['./ad-input.component.scss']
})
export class AdInputComponent extends BaseComponent {
  @Input() label: string = '';
  @Input() id: string = 'ad-input-' + Math.random().toString(36).substr(2, 6);
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() value: any = '';
  @Input() error: string = '';
  @Input() iconClass: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<any>();
  @Output() onFocus = new EventEmitter<FocusEvent>();
  @Output() onBlur = new EventEmitter<FocusEvent>();

  onInputChange(val: any): void {
    this.value = val;
    this.valueChange.emit(val);
  }
}
