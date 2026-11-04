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
  region: string;
  affiliation: string;
  birthday: string;
  constellationName: string;
  substat: string;
  voiceActors: Record<string, string>;
  version: string;
  images: { splash: string | null };
  stats: CharacterStats[];
  ascension: LevelCost[];
  talents: Talents | null;
  constellations: Constellation[];
}