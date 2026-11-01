// Extracts the character fields the app needs from genshin-db into a small JSON file,
// and downloads the character icons next to the other app images.
// genshin-db is ~187 MB: it must never be imported by the Angular app itself.
// Run it again after a game update: npm run data:characters
// Icons already downloaded are kept; add --force-icons to download them all again.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import genshindb from 'genshin-db';

const OUTPUT = 'src/assets/data/characters.json';

// Game UI icons served by file name. genshin-db's mihoyo_icon often 404s for recent characters,
// and hoyowiki_icon isn't always a profile picture.
const ICON_URL = 'https://enka.network/ui/';
const ICON_DIR = 'src/assets/img/characters';
// Path of ICON_DIR as seen by the app
const ICON_PATH = 'assets/img/characters/';
// Downloads at the same time, to stay polite with the icon server
const DOWNLOAD_BATCH = 8;

const forceIcons = process.argv.includes('--force-icons');

// genshin-db codes -> keys used by the filters in src/app/characters/filters.ts
const ELEMENTS = {
  ELEMENT_ANEMO: 'Anemo',
  ELEMENT_GEO: 'Geo',
  ELEMENT_ELECTRO: 'Electro',
  ELEMENT_DENDRO: 'Dendro',
  ELEMENT_HYDRO: 'Hydro',
  ELEMENT_PYRO: 'Pyro',
  ELEMENT_CRYO: 'Cryo',
};

const WEAPONS = {
  WEAPON_BOW: 'Bow',
  WEAPON_CATALYST: 'Catalyst',
  WEAPON_CLAYMORE: 'Claymore',
  WEAPON_POLE: 'Polearm',
  WEAPON_SWORD_ONE_HAND: 'Sword',
};

function allCharacters(language) {
  return genshindb.characters('names', { matchCategories: true, verboseCategories: true, resultLanguage: language });
}

// Returns true if the icon was downloaded, false if it was already there.
async function downloadIcon(fileName) {
  const target = `${ICON_DIR}/${fileName}`;
  if (!forceIcons && existsSync(target)) {
    return false;
  }
  const response = await fetch(ICON_URL + fileName);
  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || !type.startsWith('image/')) {
    throw new Error(`${ICON_URL + fileName}: HTTP ${response.status} (${type})`);
  }
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return true;
}

const french = new Map(allCharacters('French').map(c => [c.id, c]));

const characters = allCharacters('English')
  .map(c => ({
    id: c.id,
    name: { en: c.name, fr: french.get(c.id)?.name ?? c.name },
    element: ELEMENTS[c.elementType] ?? null, // null for the Traveler and Manekin(a)
    weapon: WEAPONS[c.weaponType],
    rarity: c.rarity,
    icon: ICON_PATH + c.images.filename_icon + '.png',
  }))
  .sort((a, b) => a.name.en.localeCompare(b.name.en));

mkdirSync(ICON_DIR, { recursive: true });

let downloaded = 0;
const failed = [];
for (let i = 0; i < characters.length; i += DOWNLOAD_BATCH) {
  const batch = characters.slice(i, i + DOWNLOAD_BATCH);
  const results = await Promise.allSettled(batch.map(c => downloadIcon(c.icon.slice(ICON_PATH.length))));
  results.forEach((result, j) => {
    if (result.status === 'rejected') {
      failed.push(`${batch[j].name.en}: ${result.reason.message}`);
    } else if (result.value) {
      downloaded++;
    }
  });
}

writeFileSync(OUTPUT, JSON.stringify(characters, null, 2) + '\n');
console.log(`${characters.length} characters written to ${OUTPUT}`);
console.log(`${downloaded} icons downloaded to ${ICON_DIR}, ${characters.length - downloaded - failed.length} already there`);

if (failed.length > 0) {
  console.error(`${failed.length} icons could not be downloaded:\n  ${failed.join('\n  ')}`);
  process.exitCode = 1;
}
