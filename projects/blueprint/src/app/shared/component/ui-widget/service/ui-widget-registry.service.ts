import { Injectable, Type, Component } from '@angular/core';
import { CountWidgetComponent } from '../count-widget/count-widget.component';
import { blueprint } from '@blueprint/ontology';
import { TableWidgetComponent } from '../table-widget/table-widget.component';
@Injectable({
  providedIn: 'root'
})
export class UiWidgetRegistryService {

  #componentMap = new Map<string, Type<unknown>>();

  constructor() {
    this.#registerComponent(`CountWidgetComponent`, CountWidgetComponent);
    this.#registerComponent(`TableWidgetComponent`, TableWidgetComponent);

  }

  getComponentById(id: string): Type<Component> | undefined {
    const componentIri = `${blueprint.namespace().value}}${id}`;
    return this.#componentMap.get(componentIri);
  }

  getComponentByIri(componentIri: string): Type<Component> | undefined {
    return this.#componentMap.get(componentIri);
  }

  #registerComponent(id: string, component: Type<unknown>) {
    const componentIri = `${blueprint.namespace().value}${id}`;
    this.#componentMap.set(componentIri, component);
  }


}
