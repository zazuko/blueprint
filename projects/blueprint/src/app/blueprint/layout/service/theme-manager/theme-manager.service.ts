import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal, DOCUMENT } from '@angular/core';
import { LOCAL_STORAGE } from 'projects/blueprint/src/app/core/providers/storage/local-storage';
import { Subject } from 'rxjs';

export type Theme = 'dark' | 'light' | 'auto';

export const THEME_PREFERENCE_LOCAL_STORAGE_KEY = 'themePreference';
export const DARK_MODE_CLASS_NAME = 'bp-dark-mode';
export const LIGHT_MODE_CLASS_NAME = 'bp-light-mode';
export const PREFERS_COLOR_SCHEME_DARK = '(prefers-color-scheme: dark)';

@Injectable({
  providedIn: 'root'
})
export class ThemeManager {
  readonly #document = inject(DOCUMENT);
  readonly #localStorage = inject(LOCAL_STORAGE);
  readonly #platformId = inject(PLATFORM_ID);

  readonly theme = signal<Theme | null>(this.#getThemeFromLocalStorageValue());
  // Zoneless - it's required to notify that theme was changed. It could be removed when signal-based components will be available.
  readonly themeChanged$ = new Subject<void>();

  constructor() {

    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    this.loadThemePreference();
    this.#watchPreferredColorScheme();
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.#setThemeInLocalStorage();
    this.setThemeBodyClasses(theme === 'auto' ? preferredScheme() : theme);

  }

  private switchPrimeNgTheme(theme: Theme): void {
    const color = 'blue';
    const mode = theme === 'auto' ? preferredScheme() : theme;
    const linkElement = this.#document.getElementById('app-theme') as HTMLLinkElement;
    if (linkElement) {
      linkElement.href = `blueprint-${mode}-${color}.css`;
    }
  }

  // 1. Read theme preferences stored in localStorage
  // 2. In case when there are no stored user preferences, then read them from device preferences.
  private loadThemePreference(): void {
    const savedUserPreference = this.#getThemeFromLocalStorageValue();
    const useTheme = savedUserPreference ?? 'auto';
    this.theme.set(useTheme);
    this.setThemeBodyClasses(useTheme === 'auto' ? preferredScheme() : useTheme);
  }

  // Set theme classes on the body element
  private setThemeBodyClasses(theme: 'dark' | 'light'): void {
    const documentClassList = this.#document.documentElement.classList;
    if (theme === 'dark') {
      documentClassList.add(DARK_MODE_CLASS_NAME);
      documentClassList.remove(LIGHT_MODE_CLASS_NAME);
      this.#document.documentElement.style.colorScheme = 'dark';
    } else {
      documentClassList.add(LIGHT_MODE_CLASS_NAME);
      documentClassList.remove(DARK_MODE_CLASS_NAME);
      this.#document.documentElement.style.colorScheme = 'light';

    }
    this.switchPrimeNgTheme(theme);

    this.themeChanged$.next();
  }

  #getThemeFromLocalStorageValue(): Theme | null {
    const theme = this.#localStorage?.getItem(THEME_PREFERENCE_LOCAL_STORAGE_KEY) as Theme | null;
    return theme ?? null;
  }

  #setThemeInLocalStorage(): void {
    if (this.theme()) {
      this.#localStorage?.setItem(THEME_PREFERENCE_LOCAL_STORAGE_KEY, this.theme()!);
    }
  }

  #watchPreferredColorScheme() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      const preferredScheme = event.matches ? 'dark' : 'light';
      this.setThemeBodyClasses(preferredScheme);
    });
  }
}

function preferredScheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
