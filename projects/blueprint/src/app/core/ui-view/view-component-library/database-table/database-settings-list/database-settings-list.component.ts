import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseColumnSettings } from '../model/database.model';

@Component({
  selector: 'bp-database-settings-list',
  imports: [],
  templateUrl: './database-settings-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./database-settings-list.component.scss'],
})
export class DatabaseSettingsListComponent {
  readonly list = input<DatabaseColumnSettings[]>([]);
}
