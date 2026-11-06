export interface HubTile {
  key: string; img: string;
  route?: string;
  size?: 'xl' | 'wide' | 'tall';
}

const IMG = 'assets/img/nation/';
export const HUB_TILES: HubTile[] = [
  { key: 'chars', img: IMG + 'inazuma/5.jpg', route: '/characters', size: 'xl' },
  { key: 'weapons', img: IMG + 'liyue/4.jpg', route: '/weapons', size: 'wide' },
  { key: 'artifacts', img: IMG + 'fontaine/10.jpg', route: '/artifacts', size: 'tall' },
  { key: 'banners', img: IMG + 'inazuma/7.jpg' },
  { key: 'events', img: IMG + 'mondstadt/4.jpg' },
  { key: 'versions', img: IMG + 'liyue/5.jpg' },
  { key: 'materials', img: IMG + 'sumeru/4.jpg', route: '/materials' },
  { key: 'achievements', img: IMG + 'natlan/8.jpg' },
  { key: 'enemies', img: IMG + 'nod-krai/3.jpg' },
  { key: 'food', img: IMG + 'sumeru/2.jpg', route: '/food', size: 'wide' },
];