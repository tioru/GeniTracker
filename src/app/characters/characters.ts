export interface Characters {
  id: number;
  name: { en: string; fr: string };
  element: string | null;
  weapon: string;
  rarity: 4 | 5;
  icon: string;
}
