import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ElementFilter, WeaponFilter } from './filters';
import { CharactersService } from './characters.service';
import { Characters } from './characters';
import { OverflowTooltipDirective } from '../../utilities/directives/overflowTooltip';
import { CachedSrcDirective } from '../../utilities/directives/cachedSrc';
import { RouterLink } from '@angular/router';

type ExclusiveFilter = 'element' | 'weapon' | 'rarity';

interface CharacterFilters {
  element: string | null;
  weapon: string | null;
  rarity: string | null;
  owned: boolean;
}

const NO_FILTERS: CharacterFilters = { element: null, weapon: null, rarity: null, owned: false };

@Component({
  imports: [TranslocoModule, OverflowTooltipDirective, CachedSrcDirective, RouterLink],
  selector: 'app-characters',
  styleUrl: './characters.component.scss',
  templateUrl: './characters.component.html',
})
export class CharactersComponent {

  private transloco = inject(TranslocoService);
  private charactersService = inject(CharactersService);

  elementFilter = ElementFilter;
  weaponFilter = WeaponFilter;

  filters = signal<CharacterFilters>(NO_FILTERS);

  search = signal('');

  private lang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  characters = computed(() => {
    const { element, weapon, rarity, owned } = this.filters();
    const mine = false; //this.charactersService.owned();
    const q = this.normalize(this.search().trim());
    return this.charactersService.characters().filter(c =>
      (!element || c.element === element) &&
      (!weapon || c.weapon === weapon) &&
      (!rarity || `${c.rarity}-star` === rarity) &&
      (!owned || false /* mine.has(c.id) */) &&
      (!q || this.normalize(c.name.fr).includes(q) || this.normalize(c.name.en).includes(q))
    );
  });

  hasFilters = computed(() => {
    const { element, weapon, rarity, owned } = this.filters();
    return !!(element || weapon || rarity || owned || this.search());
  });

  toggleFilter(category: ExclusiveFilter, key: string): void {
    this.filters.update(f => ({ ...f, [category]: f[category] === key ? null : key }));
  }

  toggleOwned(): void {
    this.filters.update(f => ({ ...f, owned: !f.owned }));
  }

  resetFilters(): void {
    this.filters.set(NO_FILTERS);
    this.search.set('');
  }

  displayName(character: Characters): string {
    return this.lang() === 'fr' ? character.name.fr : character.name.en;
  }
  
  getElementUrl(element: string | null): string {
    return element ? ElementFilter.find(e => e.key === element)?.img || '' : '';
  }

  private normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');  
}
