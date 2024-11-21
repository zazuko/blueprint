import { Component } from "@angular/core";
import { UiView } from "projects/blueprint/src/app/core/ui-view/model/ui-view.model";

export interface Widget {
    id: string;
    label: string;
    view: UiView;
    rows?: number;
    columns?: number;
}



export interface WidgetDefinition {
    id: string;
    query: string;
    canBeUsedWith: string[];
    uiComponent: string;
}


export class ViewComponentRegistry {
    #map = new Map<string, Component>();

    register(id: string, component: Component) {
        this.#map.set(id, component);
    }

    get(id: string): Component | undefined {
        return this.#map.get(id);
    }

}
