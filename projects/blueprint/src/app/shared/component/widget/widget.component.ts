import { Component, computed, inject, input, output, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { Widget } from './model/widget.model';
import { NgComponentOutlet, } from '@angular/common';
import { WidgetOptionsComponent } from "./widget-options/widget-options.component";
import { UiWidgetRegistryService } from '../ui-widget/service/ui-widget-registry.service';

@Component({
  selector: 'bp-widget',
  standalone: true,
  imports: [NgComponentOutlet, ButtonModule, WidgetOptionsComponent],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss',
  host: {
    '[style.grid-area]': '"span " + (widget().rowSpan ?? 1) + " / span " +  (widget().columnSpan ?? 1)'
  }
})
export class WidgetComponent {
  widget = input.required<Widget>();
  changed = output<Partial<Widget>>();

  showOptions = signal<boolean>(false);

  readonly #uiWidgetRegistry = inject(UiWidgetRegistryService);

  viewComponent = computed(() => {
    const componentIri = this.widget().componentIri;
    return this.#uiWidgetRegistry.getComponentByIri(componentIri);
  }
  );

  emitChange(change: Partial<Widget>) {
    this.changed.emit(change);
  }
}

