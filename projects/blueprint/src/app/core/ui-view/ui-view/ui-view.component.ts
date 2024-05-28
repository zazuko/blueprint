import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiView, UiViewContainer } from '../model/ui-view.model';
import { UiViewComponentComponent } from "../ui-view-component/ui-view-component.component";

@Component({
  selector: 'bp-ui-view',
  standalone: true,
  templateUrl: './ui-view.component.html',
  styleUrls: ['./ui-view.component.scss'],
  imports: [CommonModule, UiViewComponentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class UiViewComponent implements OnChanges {
  @Input({ required: true }) uiView: UiView;
  nodeSelected = output<string>();

  public viewContainers: UiViewContainer[] = [];


  ngOnChanges(changes: SimpleChanges): void {

    const uiViews = changes['uiView']?.currentValue;
    if (uiViews) {
      this.uiView = uiViews;
      this.viewContainers = this.uiView.viewContainer.sort((a, b) => a.order - b.order);
    }
  }

  emitNodeSelected(iri: string) {
    this.nodeSelected.emit(iri);
  }
}
