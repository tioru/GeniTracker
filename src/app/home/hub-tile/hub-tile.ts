export interface HubTile {
  key: string; img: string;
  route?: string;
  size?: 'xl' | 'wide' | 'tall';
}

const IMG = 'assets/img/nation/';
export const HUB_TILES: HubTile[] = [
  { key: 'chars', img: IMG + 'Inazuma/5.jpg', route: '/characters', size: 'xl' },
  { key: 'weapons', img: IMG + 'Liyue/4.jpg', route: '/weapons', size: 'wide' },
  { key: 'artifacts', img: IMG + 'Fontaine/10.jpg', route: '/artifacts', size: 'tall' },
  { key: 'banners', img: IMG + 'Inazuma/7.jpg' },
  { key: 'events', img: IMG + 'Mondstadt/4.jpg' },
  { key: 'versions', img: IMG + 'Liyue/5.jpg' },
  { key: 'materials', img: IMG + 'Sumeru/4.jpg', route: '/materials' },
  { key: 'achievements', img: IMG + 'Natlan/8.jpg' },
  { key: 'enemies', img: IMG + 'Nod-krai/3.jpg' },
  { key: 'food', img: IMG + 'Sumeru/2.jpg', route: '/food', size: 'wide' },
];