import { Component, signal, computed, OnChanges, SimpleChanges, input } from '@angular/core';
import { Table } from '../../features/inventory/inventory-detail/service/hierarchy-table.service';


@Component({
    selector: 'bp-group-table',
    imports: [],
    templateUrl: './group-table.component.html',
    styleUrl: './group-table.component.scss'
})
export class GroupTableComponent implements OnChanges {
  readonly data = input<Table | null>(null);

  tableDataSignal = signal<Table | null>(null)
  groupByField = 'OCI Registry';

  globalFilterFieldsSignal = computed(() => {
    const tableData = this.tableDataSignal();
    if (tableData === null) {
      return [];
    }
    return this.data().header.map(header => header.label);
  });
  rowsHeaderSignal = computed(() => {
    const tableData = this.tableDataSignal();
    if (tableData === null) {
      return [];
    }
    return this.data().header;
  })

  ngOnChanges(changes: SimpleChanges): void {
    const data = changes['data'].currentValue;
    if (data) {
      this.tableDataSignal.set(data);
    }
  }


}
