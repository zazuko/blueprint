import { Component, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { Widget } from '../model/widget.model';

@Component({
  selector: 'bp-widget-options',
  standalone: true,
  imports: [ButtonModule, SelectButtonModule, FormsModule],
  templateUrl: './widget-options.component.html',
  styleUrl: './widget-options.component.scss'
})
export class WidgetOptionsComponent {
  height = input<number>();
  width = input<number>();

  changed = output<Partial<Widget>>();

  showOptions = model<boolean>(false);

  selectedRowOption = signal<number>(1);
  selectedColumnOption = signal<number>(1);

  columnOptions: Option[] = [
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 }
  ];

  rowOptions: Option[] = [
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 }
  ];

  widthChanged(event: SelectButtonChangeEvent) {
    this.changed.emit({ columnSpan: event.value });

  }

  heightChanged(event: SelectButtonChangeEvent) {
    this.changed.emit({ rowSpan: event.value });
  }
}


interface Option {
  name: string;
  value: number;
}