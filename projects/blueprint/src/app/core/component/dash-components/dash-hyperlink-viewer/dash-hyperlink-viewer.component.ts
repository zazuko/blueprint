import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  inject,
} from '@angular/core';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DashHyperLinkViewerData } from './model/dash-hyper-link-viewer-data';
import { InfoSectionComponent } from '@blueprint/component/info-section';
import { FluxHyperlinkViewer } from 'projects/blueprint/src/app/features/explore/flux-viewer';
import { SparqlService } from '@blueprint/service/sparql/sparql.service';
@Component({
    selector: 'bp-dash-hyperlink-viewer',
    templateUrl: './dash-hyperlink-viewer.component.html',
    styleUrls: ['./dash-hyperlink-viewer.component.less'],
    imports: [InfoSectionComponent]
})
export class DashHyperlinkViewerComponent implements OnInit, OnDestroy {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() viewer: FluxHyperlinkViewer | null = null;

  public data: DashHyperLinkViewerData;

  private destroy$ = new Subject<void>();

  private readonly sparqlService = inject(SparqlService);
  constructor(
  ) { }

  ngOnInit(): void {
    if (this.viewer === null) {
      return;
    }
    const viewerLabel = this.viewer.label;
    from(this.sparqlService.select(this.viewer.sparqlQuery))
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.data = {
          label: viewerLabel,
          literal: result[0]?.['a'].value,
          href: result[0]?.['href'].value,
        };
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
