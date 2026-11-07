export interface MaterialCost { id: number; name: string; count: number; }
export interface LevelCost { level: number; items: MaterialCost[]; }

export interface Talent {
  name: string;
  description: string;
  icon: string | null;
  labels: string[];                       // ex. "1-Hit DMG|{param1:F1P}"
  parameters: Record<string, number[]>;   // param1 → valeurs par niveau (index 0 = niv. 1)
}

export interface Talents {
  normalAttack: Talent | null;
  skill: Talent | null;
  burst: Talent | null;
  alternateSprint: Talent | null;
  passives: Talent[];
  costs: LevelCost[];
}

export interface Constellation {
  level: number;
  name: string;
  description: string;
  icon: string | null;
}

// A signature weapon or a special dish
export interface Item {
  name: string;
  rarity: number;
  icon: string | null;
}

export type DishType = 'attack' | 'defense' | 'heal' | 'adventure';

export interface Dish extends Item {
  /** Category key, translated with dishTypes.<type> */
  type: DishType | null;
  /** Effect text, already translated, e.g. "Increases all party members' DEF by 165 for 300s." */
  effect: string;
}

export interface CharacterStats {
  level: number;
  ascension: number;
  hp: number;
  atk: number;
  def: number;
  special: number;
}

export interface Character {
  id: number;
  name: string;
  title: string;
  description: string;
  element: string | null;
  weapon: string;
  rarity: 4 | 5;
  /** Stable nation key (see Nations in characters/filters.ts), null if the character has none */
  nation: string | null;
  affiliation: string;
  birthday: string;
  constellationName: string;
  substat: string;
  voiceActors: Record<string, string>;
  version: string;
  /** Release date of the version the character came with (yyyy-mm-dd), null if unknown */
  releaseDate: string | null;
  images: { portrait: string | null };
  /** null for the characters without one (most 4-stars, standard 5-stars) */
  signatureWeapon: Item | null;
  specialDish: Dish | null;
  stats: CharacterStats[];
  ascension: LevelCost[];
  talents: Talents | null;
  constellations: Constellation[];
}