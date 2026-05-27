import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { BaseComponent } from '../../core/base.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'ad-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './ad-table.component.html',
  styleUrls: ['./ad-table.component.scss']
})
export class AdTableComponent extends BaseComponent {
  @Input() value: any[] = [];
  @Input() columns: any[] = [];
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() loading: boolean = false;
  @Input() tableStyleClass: string = '';

  @ContentChild('rowTemplate') rowTemplate!: TemplateRef<any>;
}
