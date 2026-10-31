export interface Filter {
  key: string;
  img: string;
}

const IMG = 'assets/img/';

export const ElementFilter: Filter[] = [
    { key: 'Anemo', img: IMG + 'elements/anemo.webp'},
    { key: 'Geo', img: IMG + 'elements/geo.webp'},
    { key: 'Electro', img: IMG + 'elements/electro.webp'},
    { key: 'Dendro', img: IMG + 'elements/dendro.webp'},
    { key: 'Hydro', img: IMG + 'elements/hydro.webp'},
    { key: 'Pyro', img: IMG + 'elements/pyro.webp'},
    { key: 'Cryo', img: IMG + 'elements/cryo.webp'},
];

export const WeaponFilter: Filter[] = [
    { key: 'Bow', img: IMG + 'weapons/bow.webp'},
    { key: 'Catalyst', img: IMG + 'weapons/catalyst.webp'},
    { key: 'Claymore', img: IMG + 'weapons/claymore.webp'},
    { key: 'Polearm', img: IMG + 'weapons/polearm.webp'},
    { key: 'Sword', img: IMG + 'weapons/sword.webp'}
]