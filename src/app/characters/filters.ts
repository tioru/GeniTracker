export interface Filter {
    key: string;
    color?: string;
    img: string;
}

const IMG = 'assets/img/';

export const Elements: Filter[] = [
    { key: 'Anemo', color: 'rgb(0,182,167)' , img: IMG + 'elements/anemo.webp'},
    { key: 'Geo', color: 'rgb(255,205,0)', img: IMG + 'elements/geo.webp'},
    { key: 'Electro', color: 'rgb(124,0,182)', img: IMG + 'elements/electro.webp'},
    { key: 'Dendro', color: 'rgb(0,182,9)', img: IMG + 'elements/dendro.webp'},
    { key: 'Hydro', color: 'rgb(0,94,182)', img: IMG + 'elements/hydro.webp'},
    { key: 'Pyro', color: 'rgb(182,0,0)', img: IMG + 'elements/pyro.webp'},
    { key: 'Cryo', color: 'rgb(0,238,255)', img: IMG + 'elements/cryo.webp'},
];

const nation = (key: string): Filter => ({ key, img: IMG + 'nation/' + key + '/emblem.webp' });

// Keys match the `nation` field of the character data
export const Nations: Filter[] = [
    nation('mondstadt'),
    nation('liyue'),
    nation('inazuma'),
    nation('sumeru'),
    nation('fontaine'),
    nation('natlan'),
    nation('nod-krai'),
    nation('snezhnaya'),
];

export const WeaponFilter: Filter[] = [
    { key: 'Bow', img: IMG + 'weapons/bow.webp'},
    { key: 'Catalyst', img: IMG + 'weapons/catalyst.webp'},
    { key: 'Claymore', img: IMG + 'weapons/claymore.webp'},
    { key: 'Polearm', img: IMG + 'weapons/polearm.webp'},
    { key: 'Sword', img: IMG + 'weapons/sword.webp'}
]