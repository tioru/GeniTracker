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
  stats: { level: number; ascension: number; hp: number; atk: number; def: number; special: number }[];
}
