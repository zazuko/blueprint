import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

import { ConnectionPositionPair } from '@angular/cdk/overlay';

import { PopoverModule } from 'primeng/popover';

import { NavigationState } from './service/navigation-state.service';

import { ThemePickerMenuComponent } from '../theme-picker-menu/theme-picker-menu.component';
import { MobileLogoButtonComponent } from "../mobile-logo-button/mobile-logo-button.component";
import { BrandLogoComponent } from '../../../shared/component/brand/brand-logo/brand-logo.component';
import { Router, RouterLink } from '@angular/router';
import { NavigationMenuItem, NavMenuItemComponent } from './nav-menu-item/nav-menu-item.component';
import { ThemeManager } from '../service/theme-manager/theme-manager.service';

type MenuType = 'theme-picker';


const NAVIGATION_ITEMS: NavigationMenuItem[] = [
  {
    label: 'Search',
    route: '/search',
    icon: 'pi pi-search',
  },
  {
    label: 'Inventory',
    route: '/inventory',
    icon: 'pi pi-box',
  },
  {
    label: 'Settings',
    route: '/configurator',
    icon: 'pi pi-cog',
  },
];

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div.bp-nav',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss', './nav-item.scss'],
  imports: [
    CommonModule,
    RouterLink,
    ThemePickerMenuComponent,
    MobileLogoButtonComponent,
    BrandLogoComponent,
    NavMenuItemComponent,
    PopoverModule
  ]
})
export class NavigationComponent {
  private readonly navigationState = inject(NavigationState);
  readonly #themeManager = inject(ThemeManager);
  readonly #router = inject(Router);

  navigationItems = NAVIGATION_ITEMS;

  isMobileNavigationOpened = this.navigationState.isMobileNavVisible;
  isMobileNavigationOpened$ = toObservable(this.isMobileNavigationOpened);


  activeRouteItem = this.navigationState.primaryActiveRouteItem;
  theme = this.#themeManager.theme;


  openedMenu: MenuType | null = null;

  miniMenuPositions = [
    new ConnectionPositionPair(
      { originX: 'end', originY: 'center' },
      { overlayX: 'start', overlayY: 'center' },
    ),
    new ConnectionPositionPair(
      { originX: 'end', originY: 'top' },
      { overlayX: 'start', overlayY: 'top' },
    ),
  ];

  // mobile nav
  openMobileNav($event: MouseEvent): void {
    $event.stopPropagation();
    this.navigationState.setMobileNavigationListVisibility(true);
  }

  closeMobileNav(): void {
    this.navigationState.setMobileNavigationListVisibility(false);
  }
  // end mobile nav

  openMenu(menuType: MenuType): void {
    this.openedMenu = menuType;
  }

  closeMenu(): void {
    this.openedMenu = null;
  }

  onNavigationItemSelected(item: NavigationMenuItem): void {
    this.#router.navigate([item.route]);
  }

}
