import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
    selector: 'bp-nav-menu-item',
    imports: [NgClass],
    templateUrl: './nav-menu-item.component.html',
    styleUrl: './nav-menu-item.component.scss'
})
export class NavMenuItemComponent {
  item = input.required<NavigationMenuItem>();
  active = input.required<boolean>();

  selected = output<NavigationMenuItem>();

  onSelected() {
    this.selected.emit(this.item());
  }
}


export interface NavigationMenuItem {
  label: string;
  route: string;
  icon: string;
}