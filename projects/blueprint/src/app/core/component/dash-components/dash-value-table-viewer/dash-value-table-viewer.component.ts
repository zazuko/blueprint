import {
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';


import { TableModule } from 'primeng/table';

import { DashValueTableViewerData } from './module/dash-value-table-viewer-data';
import { InfoSectionComponent } from '@blueprint/component/info-section';
import { FluxValueTableViewer } from 'projects/blueprint/src/app/features/explore/flux-viewer';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';

@Component({
  selector: 'bp-dash-value-table-viewer',
  templateUrl: './dash-value-table-viewer.component.html',
  styleUrls: ['./dash-value-table-viewer.component.scss'],
  imports: [InfoSectionComponent, TableModule]
})
export class DashValueTableViewerComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() viewer: FluxValueTableViewer = null;
  data: DashValueTableViewerData = null;

  public sectionLabel = '';
  public columnLabels: string[] = [];

  readonly #sparqlService = inject(SparqlService);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public columnsData: any[] = [];

  ngOnInit(): void {
    this.#sparqlService.select(this.viewer.sparqlQuery)
      .subscribe(result => {
        this.sectionLabel = this.viewer.label;
        this.columnLabels = this.viewer.header;

        this.columnsData = result.map((columnData) => {
          const colData = {};
          this.columnLabels.forEach((colKey, index) => {
            colData[colKey] = columnData[`col_${index + 1}`].value ?? '';
          });
          return colData;
        });
      })
  }



}