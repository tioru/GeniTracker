// Writes one JSON file per character and per language with everything the detail page needs
// (profile, stats by level, ascension costs, talents, constellations), and downloads the
// talent and constellation icons. Like export-characters.mjs, genshin-db is only used here,
// never by the Angular app.
// Run it after export-characters.mjs: npm run data:character-details
// Icons already downloaded are kept; add --force-icons to download them all again.
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import genshindb from 'genshin-db';

const OUTPUT_DIR = 'src/assets/data/characters';
const LANGUAGES = { en: 'English', fr: 'French' };

const ICON_URL = 'https://enka.network/ui/';
const ICON_DIR = 'src/assets/img/skills';
const ICON_PATH = 'assets/img/skills/';
const DOWNLOAD_BATCH = 8;
const forceIcons = process.argv.includes('--force-icons');

// [level, ascension phase]: the two rows at 20, 40… are before and after ascending
const LEVELS = [[1, 0], [20, 0], [20, 1], [40, 1], [40, 2], [50, 2], [50, 3], [60, 3], [60, 4], [70, 4], [70, 5], [80, 5], [80, 6], [90, 6]];

const ELEMENTS = {
  ELEMENT_ANEMO: 'Anemo', ELEMENT_GEO: 'Geo', ELEMENT_ELECTRO: 'Electro', ELEMENT_DENDRO: 'Dendro',
  ELEMENT_HYDRO: 'Hydro', ELEMENT_PYRO: 'Pyro', ELEMENT_CRYO: 'Cryo',
};
const WEAPONS = {
  WEAPON_BOW: 'Bow', WEAPON_CATALYST: 'Catalyst', WEAPON_CLAYMORE: 'Claymore',
  WEAPON_POLE: 'Polearm', WEAPON_SWORD_ONE_HAND: 'Sword',
};

const icons = new Set();
const icon = fileName => {
  if (!fileName) return null;
  icons.add(fileName + '.png');
  return ICON_PATH + fileName + '.png';
};

// Keeps only id, name and count so the app can link each material to its own page
const materials = list => (list ?? []).map(({ id, name, count }) => ({ id, name, count }));
const costs = (obj, prefix) => Object.entries(obj ?? {})
  .filter(([key]) => key.startsWith(prefix))
  .map(([key, items]) => ({ level: Number(key.slice(prefix.length)), items: materials(items) }));

function stats(character) {
  if (typeof character.stats !== 'function') return [];
  return LEVELS.map(([level, ascension]) => {
    const s = character.stats(level, ascension);
    return { level, ascension, hp: Math.round(s.hp), atk: Math.round(s.attack), def: Math.round(s.defense), special: s.specialized };
  });
}

// Talent values are kept raw: labels like "1-Hit DMG|{param1:F1P}" and one array of values per
// parameter (index 0 = talent level 1). The app formats them for the selected level.
function talent(t, image) {
  if (!t) return null;
  return {
    name: t.name,
    description: t.description ?? t.info ?? '',
    icon: icon(image),
    labels: t.attributes?.labels ?? [],
    parameters: t.attributes?.parameters ?? {},
  };
}

function talents(t) {
  if (!t) return null;
  const img = t.images ?? {};
  return {
    normalAttack: talent(t.combat1, img.filename_combat1),
    skill: talent(t.combat2, img.filename_combat2),
    burst: talent(t.combat3, img.filename_combat3),
    alternateSprint: talent(t.combatsp, img.filename_combatsp),
    passives: [1, 2, 3, 4].map(n => talent(t['passive' + n], img['filename_passive' + n])).filter(Boolean),
    costs: costs(t.costs, 'lvl'),
  };
}

function constellations(c) {
  if (!c) return [];
  const img = c.images ?? {};
  return [1, 2, 3, 4, 5, 6].map(n => c['c' + n] && {
    level: n,
    name: c['c' + n].name,
    description: c['c' + n].description,
    icon: icon(img['filename_c' + n]),
  }).filter(Boolean);
}

function details(enName, language) {
  const opts = { queryLanguages: ['English'], resultLanguage: language };
  const c = genshindb.characters(enName, opts);
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    title: c.title ?? '',
    description: c.description ?? '',
    element: ELEMENTS[c.elementType] ?? null,
    weapon: WEAPONS[c.weaponType],
    rarity: c.rarity,
    region: c.region ?? '',
    affiliation: c.affiliation ?? '',
    birthday: c.birthdaymmdd ?? '',
    constellationName: c.constellation ?? '',
    substat: c.substatText ?? c.substatType ?? '',
    voiceActors: c.cv ?? {},
    version: c.version ?? '',
    stats: stats(c),
    ascension: costs(c.costs, 'ascend'),
    talents: talents(genshindb.talents(enName, opts)),
    constellations: constellations(genshindb.constellations(enName, opts)),
  };
}

async function downloadIcon(fileName) {
  const target = `${ICON_DIR}/${fileName}`;
  if (!forceIcons && existsSync(target)) return false;
  const response = await fetch(ICON_URL + fileName);
  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || !type.startsWith('image/')) {
    throw new Error(`${ICON_URL + fileName}: HTTP ${response.status} (${type})`);
  }
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return true;
}

const names = genshindb.characters('names', { matchCategories: true, resultLanguage: 'English' });

// Start from empty folders so characters removed from the game don't leave stale files
for (const lang of Object.keys(LANGUAGES)) {
  rmSync(`${OUTPUT_DIR}/${lang}`, { recursive: true, force: true });
  mkdirSync(`${OUTPUT_DIR}/${lang}`, { recursive: true });
}

const incomplete = [];
for (const enName of names) {
  for (const [lang, language] of Object.entries(LANGUAGES)) {
    const data = details(enName, language);
    if (!data) continue;
    if (lang === 'en' && (!data.talents || !data.constellations.length)) incomplete.push(enName);
    writeFileSync(`${OUTPUT_DIR}/${lang}/${data.id}.json`, JSON.stringify(data) + '\n');
  }
}
console.log(`${names.length} characters written to ${OUTPUT_DIR}/{${Object.keys(LANGUAGES).join(',')}}`);
if (incomplete.length) console.warn(`No talents or constellations found for: ${incomplete.join(', ')}`);

mkdirSync(ICON_DIR, { recursive: true });
const list = [...icons];
let downloaded = 0;
const failed = [];
for (let i = 0; i < list.length; i += DOWNLOAD_BATCH) {
  const batch = list.slice(i, i + DOWNLOAD_BATCH);
  const results = await Promise.allSettled(batch.map(downloadIcon));
  results.forEach((result, j) => {
    if (result.status === 'rejected') failed.push(`${batch[j]}: ${result.reason.message}`);
    else if (result.value) downloaded++;
  });
}
console.log(`${downloaded} skill icons downloaded to ${ICON_DIR}, ${list.length - downloaded - failed.length} already there`);
if (failed.length) {
  console.error(`${failed.length} icons could not be downloaded:\n  ${failed.join('\n  ')}`);
  process.exitCode = 1;
}
