export interface HubTile {
  key: string; label: string; img: string;
  route?: string;
  size?: 'xl' | 'wide' | 'tall';
}

const IMG = 'assets/img/nation/';
export const HUB_TILES: HubTile[] = [
  { key: 'chars',        label: 'Personnages', img: IMG + 'Inazuma/5.jpg',  route: '/characters', size: 'xl' },
  { key: 'weapons',      label: 'Armes',       img: IMG + 'Liyue/4.jpg',    route: '/weapons',    size: 'wide' },
  { key: 'artifacts',    label: 'Artéfacts',   img: IMG + 'Fontaine/10.jpg', route: '/artifacts', size: 'tall' },
  { key: 'banners',      label: 'Bannières',   img: IMG + 'Inazuma/7.jpg' },
  { key: 'events',       label: 'Évènements',  img: IMG + 'Mondstadt/4.jpg' },
  { key: 'versions',     label: 'Versions',    img: IMG + 'Liyue/5.jpg' },
  { key: 'materials',    label: 'Matériaux',   img: IMG + 'Sumeru/4.jpg',   route: '/materials' },
  { key: 'achievements', label: 'Succès',      img: IMG + 'Natlan/8.jpg' },
  { key: 'enemies',      label: 'Ennemis',     img: IMG + 'Nod-krai/3.jpg' },
  { key: 'food',         label: 'Nourriture',  img: IMG + 'Sumeru/2.jpg',   route: '/food',       size: 'wide' },
];