import { Component, input, computed, output } from '@angular/core';
import { HierarchyComponent, HierarchyElement } from '../view-component-library/hierarchy/hierarchy.component';
import { UiHierarchyView } from './model/ui-hierarchy-view';

@Component({
  selector: 'bp-ui-hierarchy-view',
  standalone: true,
  imports: [HierarchyComponent],
  templateUrl: './ui-hierarchy-view.component.html',
  styleUrl: './ui-hierarchy-view.component.scss'
})
export class UiHierarchyViewComponent {
  hierarchyView = input.required<UiHierarchyView>();
  nodeSelected = output<string>();

  elementsSignal = computed<HierarchyElement[]>(() => {
    const uiView = this.hierarchyView();
    if (uiView === null) {
      return [];
    }
    return uiView.elements;
  });

  labelSignal = computed<string>(() => {
    const uiView = this.hierarchyView();
    if (uiView === null) {
      return '';
    }
    return uiView.label;
  });

  emitNodeSelected(iri: string) {
    this.nodeSelected.emit(iri);
  }
}
