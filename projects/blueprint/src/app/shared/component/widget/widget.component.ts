import { Component, input, output, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { Widget } from './model/widget.model';
import { UiViewComponent } from '../../../core/ui-view/ui-view/ui-view.component';
import { NgComponentOutlet, } from '@angular/common';
import { WidgetOptionsComponent } from "./widget-options/widget-options.component";

@Component({
  selector: 'bp-widget',
  standalone: true,
  imports: [NgComponentOutlet, ButtonModule, WidgetOptionsComponent],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss',
  host: {
    '[style.grid-area]': '"span " + (widget().rows ?? 1) + " / span " +  (widget().columns ?? 1)'
  }
})
export class WidgetComponent {
  widget = input.required<Widget>();
  changed = output<Partial<Widget>>();

  showOptions = signal<boolean>(false);
  viewComponent = UiViewComponent;

  emitChange(change: Partial<Widget>) {
    this.changed.emit(change);
  }
}

