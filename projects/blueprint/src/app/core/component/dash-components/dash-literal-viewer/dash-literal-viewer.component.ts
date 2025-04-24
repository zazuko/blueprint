import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashLiteralViewerData } from './model/dash-literal-viewer-data';
import { InfoSectionComponent } from '@blueprint/component/info-section';
import { FluxLiteralViewer } from 'projects/blueprint/src/app/features/explore/flux-viewer';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';

@Component({
    selector: 'bp-dash-literal-viewer',
    templateUrl: './dash-literal-viewer.component.html',
    styleUrls: ['./dash-literal-viewer.component.less'],
    imports: [CommonModule, InfoSectionComponent]
})
export class DashLiteralViewerComponent implements OnInit, OnDestroy {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() viewer: FluxLiteralViewer = null;
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() singleLine = false;

  data: DashLiteralViewerData = null;
  private destroy$ = new Subject<void>();

  constructor(
    private sparqlService: SparqlService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    from(this.sparqlService.select(this.viewer.sparqlQuery))
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        const literals = result.map(binding => binding['literal']);
        this.data = {
          label: this.viewer.label,
          literal: literals,
        };
        this.ref.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
