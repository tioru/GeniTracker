import { Component, OnInit, ChangeDetectionStrategy, inject, DOCUMENT } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { availableLangs, langStorageKey } from '../../utilities/core/i18n/transloco-loader';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive, TranslocoDirective],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements  OnInit {

  private transloco = inject(TranslocoService);
  private document = inject(DOCUMENT);

  account : any = {};

  langs : string[] = availableLangs;

  selectedLang : string = this.transloco.getActiveLang();

  ngOnInit(): void {
    this.document.documentElement.lang = this.selectedLang;
  }

  public selectLang(lang: string): void {
    this.selectedLang = lang;
    this.transloco.setActiveLang(lang);
    this.document.documentElement.lang = lang;
    try {
      localStorage.setItem(langStorageKey, lang);
    } catch {}
  }

  public positionLangMenu(event: Event, menu: HTMLElement, button: HTMLElement): void {
    const isNativePopover = CSS.supports('selector(:popover-open)');
    if ((event as ToggleEvent).newState !== 'open' || !isNativePopover || CSS.supports('anchor-name', '--a')) {
      return;
    }
    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 8}px`;
    menu.style.right = `${this.document.documentElement.clientWidth - rect.right}px`;
  }
}
