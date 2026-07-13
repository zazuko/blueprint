import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';

import { DatabaseTable } from '../model/database.model';
import { DatabaseSettingsListComponent } from '../database-settings-list/database-settings-list.component';

@Component({
  selector: 'bp-database-table',
  templateUrl: './database-table.component.html',
  styleUrls: ['./database-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatabaseSettingsListComponent],
})
export class DatabaseTableComponent {
  readonly table = input<DatabaseTable | null>(null);

  nodeSelected = output<string>();

  public readonly displayedColumns = ['name', 'type', 'settings', 'references'];

  emitNodeSelected(iri: string) {
    this.nodeSelected.emit(iri);
  }
}
