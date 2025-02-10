import { InputSignal } from "@angular/core";

export interface BaseUiWidget<T> {
    data: InputSignal<T>;
}
