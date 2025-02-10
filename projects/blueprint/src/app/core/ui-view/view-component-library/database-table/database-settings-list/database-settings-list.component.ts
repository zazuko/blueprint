import { Component, Input } from '@angular/core';
import { ChipModule } from 'primeng/chip';
import { DatabaseColumnSettings } from '../model/database.model';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'bp-database-settings-list',
    imports: [NgStyle, ChipModule, DatabaseSettingsListComponent],
    templateUrl: './database-settings-list.component.html',
    styleUrls: ['./database-settings-list.component.scss']
})
export class DatabaseSettingsListComponent {
  @Input() list: DatabaseColumnSettings[] = [];
}
