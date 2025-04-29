import { Component, inject } from '@angular/core';
import { Theme, ThemeManager } from '../../service/theme-manager/theme-manager.service';
import { NavigationMenuItem } from '../navigation/nav-menu-item/nav-menu-item.component';
import { ThemePickerMenuItemComponent } from "./theme-picker-menu-item/theme-picker-menu-item.component";


const THEME_PICKER_MENU_ITEMS: ThemeMenuItem[] = [
  {
    label: 'System',
    route: 'Set the theme to system mode.',
    icon: 'pi pi-desktop',
    theme: 'auto',
  },
  {
    label: 'Light',
    route: 'Set the theme to light mode.',
    icon: 'pi pi-sun',
    theme: 'light',
  },
  {
    label: 'Dark',
    route: 'Set the theme to dark mode.',
    icon: 'pi pi-moon',
    theme: 'dark',
  },
];

@Component({
  selector: 'bp-theme-picker-menu',
  templateUrl: './theme-picker-menu.component.html',
  styleUrl: './theme-picker-menu.component.scss',
  imports: [ThemePickerMenuItemComponent]
})
export class ThemePickerMenuComponent {
  readonly #themeManager = inject(ThemeManager);

  currentTheme = this.#themeManager.theme;
  menuItems = THEME_PICKER_MENU_ITEMS;

  setTheme(theme: Theme): void {
    this.#themeManager.setTheme(theme);
  }

}


interface ThemeMenuItem extends NavigationMenuItem {
  theme: Theme;
}