import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Theme } from '../../service/theme-manager/theme-manager.service';

@Component({
  selector: 'bp-theme-picker-menu-item',
  imports: [NgClass],
  templateUrl: './theme-picker-menu-item.component.html',
  styleUrl: './theme-picker-menu-item.component.scss'
})
export class ThemePickerMenuItemComponent {
  item = input.required<ThemePickerMenuItem>();
  active = input.required<boolean>();

  selected = output<ThemePickerMenuItem>();

  onSelected() {
    this.selected.emit(this.item());
  }
}


export interface ThemePickerMenuItem {
  label: string;
  theme: Theme;
  icon: string;
}