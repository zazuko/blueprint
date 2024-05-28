import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bp-generic-table-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-table-view.component.html',
  styleUrl: './generic-table-view.component.scss'
})
export class GenericTableViewComponent {
  @Input() data: Table;
}

// i need an interface for a table data 

export interface Table {
  headers: string[];
  rows: Row[];
}

export interface Row {
  cells: Cell[];
}

export interface Cell {
  value: string;
  type: string;
}