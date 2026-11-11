import { Component, computed, DestroyRef, effect, inject, linkedSignal, untracked, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CharactersService } from '../characters/characters.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { httpResource } from '@angular/common/http';
import { Character, Talent } from '../../utilities/models/character';
import { CachedSrcDirective } from '../../utilities/directives/cachedSrc';
import { IntlDatePipe } from '../../utilities/pipes/date.pipe';
import { BackgroundService } from '../../utilities/services/background.service';
import { Elements, Nations } from '../../utilities/game-data';
import { FormsModule } from '@angular/forms';
import { splitStatValue, talentStats } from '../../utilities/talent-stats';
import { TalentDescriptionComponent } from '../shared/talent-description/talent-description.component';

export type SkillTab = 'talents' | 'passives' | 'constellations';
export type ActiveSkillType = 'normalAttack' | 'skill' | 'burst' | 'alternateSprint';
const ACTIVE_SKILLS: ActiveSkillType[] = ['normalAttack', 'skill', 'burst', 'alternateSprint'];

@Component({
  imports: [CachedSrcDirective, TranslocoDirective, IntlDatePipe, FormsModule, TalentDescriptionComponent],
  selector: 'app-character',
  styleUrl: './character.component.scss',
  templateUrl: './character.component.html',
})
export class CharacterComponent {
  private transloco = inject(TranslocoService);
  private charactersService = inject(CharactersService);

  private name = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('name'))));
  public lang = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  public entry = computed(() => this.charactersService.characters().find(c => c.name.en === this.name()));
  public id = computed(() => this.entry()?.id);

  public character = httpResource<Character>(() => {
    const id = this.id();
    return id ? `assets/data/characters/${this.lang()}/${id}.json` : undefined;
  });

  public current = linkedSignal<Character | null | undefined, Character | undefined>({
    source: () => this.character.hasValue() ? this.character.value() : this.character.error() ? null : undefined,
    computation: (value, previous) => value === undefined ? previous?.value : value ?? undefined,
  });

  // undefined for the Traveler and Manekin(a), who have no element
  public element = computed(() => Elements.find(e => e.key === this.current()?.element));

  // undefined for characters with no nation (Traveler, Aloy, Nicole, Skirk…)
  public nation = computed(() => Nations.find(n => n.key === this.current()?.nation));

  public portrait = computed(() => this.current()?.images.portrait ?? this.entry()?.icon);

  // Reset whenever another portrait is shown, set by the <img> (load) event
  public portraitLoaded = linkedSignal({ source: this.portrait, computation: () => false });

  public elementClass = computed(() => this.current()?.element?.toLowerCase() ?? 'unknown');

  public backgrounds = computed(() => this.nation()?.backgrounds ?? []);
  
  // Back to the first image whenever the nation changes
  public slide = linkedSignal({ source: this.backgrounds, computation: () => 0 });

  public birthday = computed(() => {
    const [month, day] = (this.current()?.birthday ?? '').split('/').map(Number);
    return month && day ? new Date(2000, month - 1, day) : null;
  });

  private bg = inject(BackgroundService);

  constructor() {
    effect(() => {
      const src = this.backgrounds()[this.slide()];
      untracked(() => this.bg.show(src));
    });

    effect(onCleanup => {
      const count = this.backgrounds().length;
      this.slide();
      if (count < 2) return;
      const timer = setTimeout(() => this.slide.update(i => (i + 1) % count), 7000);
      onCleanup(() => clearTimeout(timer));
    });

    inject(DestroyRef).onDestroy(() => this.bg.show());
  }

  public readonly skillTabs: SkillTab[] = ['talents', 'passives', 'constellations'];
  public selectedSkill = signal<SkillTab>('talents');
  public selectedSubSkill = signal<ActiveSkillType>('normalAttack');
  public selectedLevel = signal(1);

  public activeSkills = computed(() => {
    const talents = this.current()?.talents;
    const level = this.selectedLevel();
    const lang = this.lang();
    return ACTIVE_SKILLS
      .map(type => ({ type, talent: talents?.[type] }))
      .filter((s): s is { type: ActiveSkillType; talent: Talent } => !!s.talent)
      .map(s => {
        const stats = talentStats(s.talent, level, lang);
        return {
          ...s,
          stats: stats.filter(x => !x.constant).map(x => {
            const split = splitStatValue(x.value);
            const gaps = x.delta ? splitStatValue(x.delta).terms : [];
            return {
              ...x,
              ...split,
              terms: split.terms.map((term, i) => ({ ...term, delta: gaps[i] ? '+' + gaps[i].num : null })),
            };
          }),
          infos: stats.filter(x => x.constant),    // stamina cost, CD, energy…
        };
      });
  });

  // The skill shown in the detail panel; falls back to the first one when the selected type
  // doesn't exist for this character (e.g. alternateSprint)
  public selectedActiveSkill = computed(() =>
    this.activeSkills().find(s => s.type === this.selectedSubSkill()) ?? this.activeSkills()[0]
  );

  public readonly maxLevel = 10;
  public readonly levels = Array.from({ length: this.maxLevel }, (_, i) => i + 1);

  public setLevel(level: number): void {
    const next = Math.min(this.maxLevel, Math.max(1, level));
    this.selectedLevel.set(next);
    if (next === 1) this.showDelta.set(false);
  }

  // Materials needed to go from (level - 1) to level; none at level 1
  public levelCosts = computed(() =>
    this.current()?.talents?.costs.find(c => c.level === this.selectedLevel())?.items ?? []
  );

  public passiveUnlock(index: number): number | null {
    return [1, 4][index] ?? null;
  }

  public showDelta = signal(false);
}
