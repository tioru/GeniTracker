import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ElementFilter, WeaponFilter } from './filters';

type ExclusiveFilter = 'element' | 'weapon' | 'rarity';

interface CharacterFilters {
  element: string | null;
  weapon: string | null;
  rarity: string | null;
  owned: boolean;
}

const NO_FILTERS: CharacterFilters = { element: null, weapon: null, rarity: null, owned: false };

@Component({
  imports: [TranslocoModule],
  selector: 'app-characters',
  styleUrl: './characters.component.scss',
  templateUrl: './characters.component.html',
})
export class CharactersComponent {

  charactersCount = 0;

  elementFilter = ElementFilter;
  weaponFilter = WeaponFilter;

  filters: CharacterFilters = NO_FILTERS;

  get hasFilters(): boolean {
    const { element, weapon, rarity, owned } = this.filters;
    return !!(element || weapon || rarity || owned);
  }

  toggleFilter(category: ExclusiveFilter, key: string): void {
    this.filters = { ...this.filters, [category]: this.filters[category] === key ? null : key };
  }

  toggleOwned(): void {
    this.filters = { ...this.filters, owned: !this.filters.owned };
  }

  resetFilters(): void {
    this.filters = NO_FILTERS;
  }
}
