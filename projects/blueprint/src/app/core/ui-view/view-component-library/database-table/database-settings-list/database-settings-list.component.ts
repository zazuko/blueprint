import { Component, input } from '@angular/core';
import { ChipModule } from 'primeng/chip';

import { DatabaseColumnSettings } from '../model/database.model';

@Component({
  selector: 'bp-database-settings-list',
  imports: [ChipModule,],
  templateUrl: './database-settings-list.component.html',
  styleUrls: ['./database-settings-list.component.scss']
})
export class DatabaseSettingsListComponent {
  readonly list = input<DatabaseColumnSettings[]>([]);
}
