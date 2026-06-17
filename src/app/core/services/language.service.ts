import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const KEY_LANG = 'techdoctor_lang';

export type Lang = 'fr' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  readonly available: Lang[] = ['fr', 'en'];

  constructor(private translate: TranslateService) {}

  /**
   * À appeler au démarrage de l'application (AppComponent.ngOnInit)
   * pour restaurer la langue sauvegardée.
   */
  init(): void {
    this.translate.addLangs(this.available);
    this.translate.setDefaultLang('fr');
    this.use(this.getSavedLang());
  }

  private getSavedLang(): Lang {
    if (typeof window === 'undefined') return 'fr';
    const saved = localStorage.getItem(KEY_LANG) as Lang | null;
    return saved === 'en' ? 'en' : 'fr';
  }

  getCurrent(): Lang {
    return (this.translate.currentLang as Lang) || 'fr';
  }

  use(lang: Lang): void {
    this.translate.use(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY_LANG, lang);
      document.documentElement.setAttribute('lang', lang);
    }
  }

  toggle(): void {
    this.use(this.getCurrent() === 'fr' ? 'en' : 'fr');
  }
}
