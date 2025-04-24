import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseTable } from '../model/database.model';
import { DatabaseSettingsListComponent } from "../database-settings-list/database-settings-list.component";

import { TableModule } from 'primeng/table';



@Component({
  selector: 'bp-database-table',
  templateUrl: './database-table.component.html',
  styleUrls: ['./database-table.component.scss'],
  imports: [CommonModule, DatabaseSettingsListComponent, TableModule]
})
export class DatabaseTableComponent {
  readonly table = input<DatabaseTable | null>(null);

  nodeSelected = output<string>();

  public readonly displayedColumns = ['name', 'type', 'settings', 'references'];


  emitNodeSelected(iri: string) {
    this.nodeSelected.emit(iri);
  }

}