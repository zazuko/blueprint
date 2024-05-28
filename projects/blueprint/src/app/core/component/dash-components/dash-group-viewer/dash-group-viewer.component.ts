import {
  Component,
  OnInit,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashLiteralViewerComponent } from '../dash-literal-viewer/dash-literal-viewer.component';
import {
  FluxGroupViewer,
  FluxHyperlinkViewer,
  FluxLiteralViewer,
  FluxValueTableViewer,
  FluxViewerType,
} from '../../../../features/explore/flux-viewer/index';
import { DashHyperlinkViewerComponent } from '../dash-hyperlink-viewer/dash-hyperlink-viewer.component';
import { DashValueTableViewerComponent } from '../dash-value-table-viewer/dash-value-table-viewer.component';
import { DashGroupViewerData } from './model/dash-group-viewer-data';
import { DashHostDirective } from '../../../ui-view/ui-view-component/dash-host/dash-host.directive';
import { InfoSectionComponent } from '@blueprint/component/info-section';

@Component({
  standalone: true,
  selector: 'bp-dash-group-viewer',
  templateUrl: './dash-group-viewer.component.html',
  styleUrls: ['./dash-group-viewer.component.less'],
  imports: [InfoSectionComponent, DashHostDirective, CommonModule]
})
/**
 * The purpose of this component is to display a group of child 
 * components, each of which is a different type of viewer 
 * (literal, hyperlink, or value table). The code loops through 
 * each member viewer in the group viewer and creates the 
 * appropriate child component for each one. 
 * If the member viewer is of an unknown type, an error message 
 * is logged to the console.
 */
export class DashGroupViewerComponent implements OnInit {
  @Input() viewer: FluxGroupViewer = null;

  @ViewChild(DashHostDirective, { static: true }) dashHost: DashHostDirective;

  public data: DashGroupViewerData | null = null;

  ngOnInit() {
    // Get a reference to the view container where we will add the child components
    const viewContainerRef = this.dashHost.viewContainerRef;
    // Clear any existing child components from the view container
    viewContainerRef.clear();
    // Set the data object to contain the label of the viewer
    this.data = { label: this.viewer.label };

    // Loop through each member viewer in the group viewer
    this.viewer.members.forEach(memberViewer => {

      // If the member viewer is a literal viewer, create a DashLiteralViewerComponent
      if (memberViewer.viewerType === FluxViewerType.LiteralViewer) {
        const componentRef =
          viewContainerRef.createComponent(DashLiteralViewerComponent);
        componentRef.instance.viewer = memberViewer as FluxLiteralViewer;
        componentRef.instance.singleLine = true;
        return;
      }

      // If the member viewer is a hyperlink viewer, create a DashHyperlinkViewerComponent
      if (memberViewer.viewerType === FluxViewerType.HyperlinkViewer) {
        const componentRef =
          viewContainerRef.createComponent(DashHyperlinkViewerComponent);
        componentRef.instance.viewer = memberViewer as FluxHyperlinkViewer;
        return;
      }

      // If the member viewer is a value table viewer, create a DashValueTableViewerComponent
      if (memberViewer.viewerType === FluxViewerType.ValueTableViewer) {
        const componentRef =
          viewContainerRef.createComponent(DashValueTableViewerComponent);
        componentRef.instance.viewer = memberViewer as FluxValueTableViewer;
        return;
      }

      // If the member viewer is of an unknown type, log an error message to the console
      console.log('DashGroupViewerComponent: unknown viewer', memberViewer);

    });
  }
}
