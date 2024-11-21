import { Component, effect, input, signal } from '@angular/core';
import { Widget } from '../widget/model/widget.model';
import { WidgetComponent } from "../widget/widget.component";

@Component({
  selector: 'bp-widget-grid',
  standalone: true,
  imports: [WidgetComponent],
  templateUrl: './widget-grid.component.html',
  styleUrl: './widget-grid.component.scss'
})
export class WidgetGridComponent {
  widgets = input.required<Widget[]>();

  internalWidgets = signal<Widget[]>([]);

  constructor() {
    effect(() => {
      // v19 use linkedSignal instead of signal
      const widgets = this.widgets();
      this.internalWidgets.set(widgets);
    }, { allowSignalWrites: true });
  }


  updateWidget(id: string, widget: Partial<Widget>) {
    console.log('updateWidget', widget);
    const index = this.internalWidgets().findIndex(w => w.id === id);
    if (index !== -1) {
      const newWidgets = [...this.internalWidgets()];
      newWidgets[index] = { ...newWidgets[index], ...widget };
      this.internalWidgets.set(newWidgets);
    }
  }
}
