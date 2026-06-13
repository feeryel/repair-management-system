import { Injectable } from '@angular/core';

const KEY_THEME = 'techdoctor_theme';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private current: Theme = 'light';

  /**
   * À appeler au démarrage de l'application (AppComponent.ngOnInit)
   * pour restaurer le thème sauvegardé.
   */
  init(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(KEY_THEME) as Theme | null;
    this.setTheme(saved === 'dark' ? 'dark' : 'light');
  }

  getTheme(): Theme {
    return this.current;
  }

  setTheme(theme: Theme): void {
    this.current = theme;
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY_THEME, theme);
  }

  toggleTheme(): void {
    this.setTheme(this.current === 'dark' ? 'light' : 'dark');
  }

  isDark(): boolean {
    return this.current === 'dark';
  }
}
