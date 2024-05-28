import { Component, signal, computed, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Table } from '../../features/inventory/inventory-detail/service/hierarchy-table.service';


@Component({
  selector: 'bp-group-table',
  standalone: true,
  imports: [TableModule],
  templateUrl: './group-table.component.html',
  styleUrl: './group-table.component.scss'
})
export class GroupTableComponent implements OnChanges {
  @Input() data: Table | null = null;

  tableDataSignal = signal<Table | null>(null)
  groupByField = 'OCI Registry';

  globalFilterFieldsSignal = computed(() => {
    const tableData = this.tableDataSignal();
    if (tableData === null) {
      return [];
    }
    return this.data.header.map(header => header.label);
  });
  rowsHeaderSignal = computed(() => {
    const tableData = this.tableDataSignal();
    if (tableData === null) {
      return [];
    }
    return this.data.header;
  })

  ngOnChanges(changes: SimpleChanges): void {
    const data = changes['data'].currentValue;
    if (data) {
      this.tableDataSignal.set(data);
    }
  }


}
