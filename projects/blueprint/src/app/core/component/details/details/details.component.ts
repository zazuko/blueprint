import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashHostDirective } from '../../../ui-view/ui-view-component/dash-host/dash-host.directive';
import { DetailsService, ObjectDetails } from '../../../../features/explore/service/detail/details.service';
import { SelectionService } from '../../../../features/explore/service/selection/selection.service';
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
export class DetailsComponent implements AfterViewInit {
  readonly #detailsService = inject(DetailsService);
  readonly #selectionService = inject(SelectionService);
  readonly #changeDetectionRef = inject(ChangeDetectorRef);
  readonly #destroyRef = inject(DestroyRef);

  // todo: fix this
  // details: ObjectDetails = null;
  details: ObjectDetails | null = null;
  color = '#000000';
  dataLimitedTo = 0;


  dashHostComponent = viewChild(DashHostDirective);

  ngAfterViewInit() {
    this.#selectionService.selectedNode$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((selectedNode) => {

        this.#detailsService
          .query(selectedNode)
          .pipe(takeUntilDestroyed(this.#destroyRef))
          .subscribe((objectDetails) => {
            this.dataLimitedTo = 0;
            this.details = objectDetails;
            this.color = this.details.color;

            this.#changeDetectionRef.markForCheck();
            const viewContainerRef = this.dashHostComponent().viewContainerRef;
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


}
