import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashHostDirective } from '../../../ui-view/ui-view-component/dash-host/dash-host.directive';
import { DetailsService, ObjectDetails } from '../../../../features/explore/service/detail/details.service';
import { SelectionService } from '../../../../features/explore/service/selection/selection.service';
import { LibraryConfigurationService } from '@blueprint/service/library-configuration/library-configuration.service';
import { DashGroupViewerComponent, DashHyperlinkViewerComponent, DashLiteralViewerComponent, DashValueTableViewerComponent } from '@blueprint/component/dash-components';
import { FluxValueTableViewer, FluxLiteralViewer, FluxHyperlinkViewer, FluxViewerType, FluxGroupViewer } from '../../../../features/explore/flux-viewer/index';

@Component({
    selector: 'bp-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    imports: [
        CommonModule,
        DashHostDirective
    ]
})
export class DetailsComponent implements OnDestroy, AfterViewInit {
  private readonly detailsService = inject(DetailsService);
  private readonly selectionService = inject(SelectionService);
  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  hasGraphExplorer: boolean;
  hasSparqlConsole: boolean;
  // todo: fix this
  // details: ObjectDetails = null;
  details: ObjectDetails | null = null;
  color = '#000000';
  dataLimitedTo = 0;


  @ViewChild(DashHostDirective, { static: true }) dashHost: DashHostDirective | null = null;

  constructor(private config: LibraryConfigurationService) {
    this.hasGraphExplorer = this.config.graphExplorerUrl !== null;
    this.hasSparqlConsole = this.config.sparqlConsoleUrl !== null;
  }

  ngAfterViewInit() {
    this.selectionService.selectedNode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedNode) => {



        this.detailsService
          .query(selectedNode)
          .pipe(takeUntil(this.destroy$))
          .subscribe((objectDetails) => {
            this.dataLimitedTo = 0;
            this.details = objectDetails;
            this.color = this.details.color;

            this.changeDetectionRef.markForCheck();
            const viewContainerRef = this.dashHost?.viewContainerRef;
            if (!viewContainerRef) {
              console.log('DetailComponent: dashHost directive not found');
              return;
            }
            viewContainerRef.clear();

            objectDetails.viewer.forEach((viewer) => {
              if (viewer.viewerType === FluxViewerType.LiteralViewer) {

                const componentRef =
                  viewContainerRef.createComponent(DashLiteralViewerComponent);
                componentRef.instance.viewer = viewer as FluxLiteralViewer;
              } else if (viewer.viewerType === FluxViewerType.HyperlinkViewer) {

                const componentRef =
                  viewContainerRef.createComponent(DashHyperlinkViewerComponent);
                componentRef.instance.viewer = viewer as FluxHyperlinkViewer;
              } else if (
                viewer.viewerType === FluxViewerType.ValueTableViewer
              ) {

                const componentRef =
                  viewContainerRef.createComponent(DashValueTableViewerComponent);
                componentRef.instance.viewer = viewer as FluxValueTableViewer;
              } else if (viewer.viewerType === FluxViewerType.GroupViewer) {
                const componentRef =
                  viewContainerRef.createComponent(DashGroupViewerComponent);
                componentRef.instance.viewer = viewer as FluxGroupViewer;
              } else {
                console.log('DetailComponent: unknown viewer', viewer);
              }
            });
          });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
