// Writes one JSON file per character and per language with everything the detail page needs
// (profile, stats by level, ascension costs, talents, constellations), and downloads the
// talent and constellation icons. Like export-characters.mjs, genshin-db is only used here,
// never by the Angular app.
// Run it after export-characters.mjs: npm run data:character-details
//
// Portraits (character only, no background) come from two sources, the larger image wins:
//  - the genshindev/api GitHub repo, downloaded automatically and cached in scripts/portraits-repo/
//  - the Genshin Impact Fandom wiki, downloaded by hand (the wiki blocks scripts) into
//    scripts/portraits-wiki/ as "<English name>_Portrait.<ext>" (spaces or underscores both work)
// The chosen image gets its white background removed when it has one, is resized to fit
// PORTRAIT_MAX and saved as src/assets/img/characters/portrait/<id>.webp.
//
// Images already downloaded or generated are kept; add --force-icons to download and generate them all again.
// The repo listing uses the GitHub API (60 requests/hour without token, 1 per run). Set GITHUB_TOKEN to raise it.
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import genshindb from 'genshin-db';
import sharp from 'sharp';
import { removeWhiteBackground } from './remove-white-background.mjs';

const OUTPUT_DIR = 'src/assets/data/characters';
const LANGUAGES = { en: 'English', fr: 'French' };

const ICON_URL = 'https://enka.network/ui/';
// genshin-db's gacha splash has a background, so portraits come from the repo behind genshin.jmp.blue or the wiki
const REPO_LIST = 'https://api.github.com/repos/genshindev/api/contents/assets/images/characters?ref=mistress';
const REPO_RAW = 'https://raw.githubusercontent.com/genshindev/api/mistress/assets/images/characters/';
const REPO_CACHE = 'scripts/portraits-repo';
const WIKI_DIR = 'scripts/portraits-wiki';
const PORTRAIT_DIR = 'characters/portrait';
const PORTRAIT_MAX = { width: 1000, height: 1600 };
// genshin-db English name -> repo folder, when the names don't match
const REPO_ALIASES = { 'Raiden Shogun': 'raiden', 'Aether': 'traveler-anemo', 'Lumine': 'traveler-anemo' };
// genshin-db English name -> wiki file name (without "_Portrait"), when the names don't match
const WIKI_ALIASES = {};
// Portrait id -> [x, y] points (in the resized portrait) of enclosed white areas that are part of
// the character but would be taken for background, such as the white of an eye
const KEEP_WHITE = { gorou: [[428, 421]] };
const DOWNLOAD_BATCH = 8;
const forceIcons = process.argv.includes('--force-icons');

// [level, ascension phase]: the two rows at 20, 40… are before and after ascending
const LEVELS = [[1, 0], [20, 0], [20, 1], [40, 1], [40, 2], [50, 2], [50, 3], [60, 3], [60, 4], [70, 4], [70, 5], [80, 5], [80, 6], [90, 6]];

// Game version -> release date, as genshin-db only gives the version. It's the date the version
// came out: a character from the second banner phase arrived about 3 weeks later.
// Add each new version here (one every 6 weeks).
const VERSION_DATES = {
  '1.0': '2020-09-28', '1.1': '2020-11-11', '1.2': '2020-12-23', '1.3': '2021-02-03', '1.4': '2021-03-17',
  '1.5': '2021-04-28', '1.6': '2021-06-09',
  '2.0': '2021-07-21', '2.1': '2021-09-01', '2.2': '2021-10-13', '2.3': '2021-11-24', '2.4': '2022-01-05',
  '2.5': '2022-02-16', '2.6': '2022-03-30', '2.7': '2022-05-31', '2.8': '2022-07-13',
  '3.0': '2022-08-24', '3.1': '2022-09-28', '3.2': '2022-11-02', '3.3': '2022-12-07', '3.4': '2023-01-18',
  '3.5': '2023-03-01', '3.6': '2023-04-12', '3.7': '2023-05-24', '3.8': '2023-07-05',
  '4.0': '2023-08-16', '4.1': '2023-09-27', '4.2': '2023-11-08', '4.3': '2023-12-20', '4.4': '2024-01-31',
  '4.5': '2024-03-13', '4.6': '2024-04-24', '4.7': '2024-06-05', '4.8': '2024-07-17',
  '5.0': '2024-08-28', '5.1': '2024-10-09', '5.2': '2024-11-20', '5.3': '2025-01-01', '5.4': '2025-02-12',
  '5.5': '2025-03-26', '5.6': '2025-05-07', '5.7': '2025-06-18', '5.8': '2025-07-30',
  '6.0': '2025-09-10', '6.1': '2025-10-22', '6.2': '2025-12-03', '6.3': '2026-01-14', '6.4': '2026-02-25',
  '6.5': '2026-04-08', '6.6': '2026-05-20', '6.7': '2026-07-01',
  '7.0': '2026-08-12', '7.1': '2026-09-23', '7.2': '2026-11-04',
};

const ELEMENTS = {
  ELEMENT_ANEMO: 'Anemo', ELEMENT_GEO: 'Geo', ELEMENT_ELECTRO: 'Electro', ELEMENT_DENDRO: 'Dendro',
  ELEMENT_HYDRO: 'Hydro', ELEMENT_PYRO: 'Pyro', ELEMENT_CRYO: 'Cryo',
};
// genshin-db association -> nation key, also the folder in src/assets/img/nation.
// Characters with another association (Traveler, Aloy, Nicole, Skirk…) have no nation.
const NATIONS = {
  ASSOC_MONDSTADT: 'mondstadt', ASSOC_LIYUE: 'liyue', ASSOC_INAZUMA: 'inazuma',
  ASSOC_SUMERU: 'sumeru', ASSOC_FONTAINE: 'fontaine', ASSOC_NATLAN: 'natlan',
  ASSOC_NODKRAI: 'nod-krai', ASSOC_NODKRAI_ZIBAI: 'nod-krai',
  ASSOC_SNEZHNAYA: 'snezhnaya', ASSOC_FATUI: 'snezhnaya', ASSOC_SNEZHNAYA_STAR: 'snezhnaya',
};
const WEAPONS = {
  WEAPON_BOW: 'Bow', WEAPON_CATALYST: 'Catalyst', WEAPON_CLAYMORE: 'Claymore',
  WEAPON_POLE: 'Polearm', WEAPON_SWORD_ONE_HAND: 'Sword',
};

// genshin-db English character name -> English name of their signature weapon, as genshin-db
// doesn't link weapons to characters. Characters missing here have none (most 4-stars and the
// standard 5-stars). Add each new 5-star character here.
const SIGNATURE_WEAPONS = {
  'Aether': 'Exaiphanes Blade', 'Lumine': 'Exaiphanes Blade',
  'Venti': 'The Daybreak Chronicles', 'Tartaglia': 'Polar Star', 'Zhongli': 'Vortex Vanquisher',
  'Hu Tao': 'Staff of Homa', 'Xiao': 'Primordial Jade Winged-Spear', 'Eula': 'Song of Broken Pines',
  'Kaedehara Kazuha': 'Freedom-Sworn',
  'Kamisato Ayaka': 'Mistsplitter Reforged', 'Yoimiya': 'Thundering Pulse', 'Raiden Shogun': 'Engulfing Lightning',
  'Sangonomiya Kokomi': 'Everlasting Moonglow', 'Arataki Itto': 'Redhorn Stonethresher', 'Shenhe': 'Calamity Queller',
  'Yae Miko': "Kagura's Verity", 'Kamisato Ayato': 'Haran Geppaku Futsu', 'Yelan': 'Aqua Simulacra',
  'Tighnari': "Hunter's Path", 'Cyno': 'Staff of the Scarlet Sands', 'Nilou': 'Key of Khaj-Nisut',
  'Nahida': 'A Thousand Floating Dreams', 'Wanderer': "Tulaytullah's Remembrance",
  'Alhaitham': 'Light of Foliar Incision', 'Dehya': 'Beacon of the Reed Sea', 'Baizhu': "Jadefall's Splendor",
  'Lyney': 'The First Great Magic', 'Neuvillette': 'Tome of the Eternal Flow', 'Wriothesley': 'Cashflow Supervision',
  'Furina': 'Splendor of Tranquil Waters', 'Navia': 'Verdict', 'Xianyun': "Crane's Echoing Call",
  'Chiori': 'Uraku Misugiri', 'Arlecchino': "Crimson Moon's Semblance", 'Clorinde': 'Absolution',
  'Sigewinne': 'Silvershower Heartstrings', 'Emilie': 'Lumidouce Elegy',
  'Kinich': 'Fang of the Mountain King', 'Mualani': "Surf's Up", 'Xilonen': 'Peak Patrol Song',
  'Chasca': "Astral Vulture's Crimson Plumage", 'Mavuika': 'A Thousand Blazing Suns', 'Citlali': "Starcaller's Watch",
  'Yumemizuki Mizuki': 'Sunny Morning Sleep-In', 'Varesa': 'Vivid Notions', 'Escoffier': 'Symphonist of Scents',
  'Skirk': 'Azurelight', 'Ineffa': 'Fractured Halo',
  'Flins': 'Bloodsoaked Ruins', 'Lauma': "Nightweaver's Looking Glass", 'Nefer': 'Reliquary of Truth',
  'Durin': 'Athame Artis', 'Columbina': "Nocturne's Curtain Call", 'Zibai': 'Lightbearing Moonshard',
  'Varka': 'Gest of the Mighty Wolf', 'Linnea': 'Golden Frostbound Oath', 'Lohen': 'Disaster and Remorse',
  'Nicole': "Angelos' Heptades", 'Sandrone': 'A Teaspoon of Transcendence',
  'Odette': 'Whitelake Frostfeather', 'Vesna': 'Beyond the Chrysalis', 'Vodyanitsa': 'Hymn of the Maelstrom',
};

// Character id -> English name of their special dish (genshin-db links dishes to characters)
const SPECIAL_DISHES = new Map(genshindb.foods('names', { matchCategories: true, resultLanguage: 'English' })
  .map(n => genshindb.foods(n, { resultLanguage: 'English' }))
  .filter(f => f?.characterId)
  .map(f => [f.characterId, f.name]));

// local file name -> { dir, urls }, filled while building the JSON, downloaded at the end.
// `urls` are tried in order until one answers with an image.
const downloads = new Map();
const image = (fileName, dir, ...urls) => {
  if (!fileName) return null;
  downloads.set(fileName, { dir: 'src/assets/img/' + dir, urls });
  return 'assets/img/' + dir + '/' + fileName;
};
const icon = fileName => fileName ? image(fileName + '.png', 'skills', ICON_URL + fileName + '.png') : null;
// Weapon and dish icons: enka.network lacks the recent dishes, Project Yatta has them
const ITEM_ICON_FALLBACK = 'https://gi.yatta.moe/assets/UI/';
const itemIcon = (fileName, dir) => fileName
  ? image(fileName + '.png', dir, ICON_URL + fileName + '.png', ITEM_ICON_FALLBACK + fileName + '.png')
  : null;

// { name, rarity, icon } of an item (weapon or dish), or null
const item = (found, dir) => found ? { name: found.name, rarity: found.rarity, icon: itemIcon(found.images?.filename_icon, dir) } : null;

// genshin-db dish category -> stable key (translated in the app, like the nations)
const DISH_TYPES = {
  COOK_FOOD_ATTACK: 'attack', COOK_FOOD_DEFENSE: 'defense', COOK_FOOD_HEAL: 'heal', COOK_FOOD_FUNCTION: 'adventure',
};
// Adds the dish effect (translated text) and its category to item()
const dish = found => found ? { ...item(found, 'foods'), type: DISH_TYPES[found.filterType] ?? null, effect: found.effect ?? '' } : null;

const slug = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// null = GitHub unreachable: only portraits already on disk are used
let repoIds = null;
async function loadRepoIds() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'geni-tracker' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
  try {
    const response = await fetch(REPO_LIST, { headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    repoIds = new Set((await response.json()).filter(e => e.type === 'dir').map(e => e.name));
  } catch (e) {
    console.warn(`GitHub unreachable (${e.message}): portraits are not downloaded, existing files are kept.`);
  }
}

// The repo files have no extension: the format is read from the first bytes
const EXTS = ['png', 'webp', 'jpg'];
const sniff = b => b[0] === 0x89 && b[1] === 0x50 ? 'png'
  : b[0] === 0xff && b[1] === 0xd8 ? 'jpg'
  : b.subarray(8, 12).toString() === 'WEBP' ? 'webp' : null;
const repoCached = id => EXTS.map(ext => `${REPO_CACHE}/${id}.${ext}`).find(existsSync) ?? null;

function repoId(enName) {
  const candidates = [REPO_ALIASES[enName] ?? slug(enName), slug(enName.split(' ').pop())];   // "Kamisato Ayaka" -> also try "ayaka"
  return candidates.find(id => repoIds ? repoIds.has(id) : repoCached(id)) ?? null;
}

// Returns the cached repo file, downloading it when needed, or null
async function repoPortrait(id) {
  const cached = repoCached(id);
  if (cached && (!forceIcons || !repoIds)) return cached;
  if (!repoIds) return null;
  const url = REPO_RAW + id + '/portrait';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = sniff(buffer);
  if (!ext) throw new Error(`${url}: not an image`);
  if (cached) rmSync(cached);
  writeFileSync(`${REPO_CACHE}/${id}.${ext}`, buffer);
  portraitsDownloaded++;
  return `${REPO_CACHE}/${id}.${ext}`;
}
let portraitsDownloaded = 0;

// "Kamisato_Ayaka_Portrait.webp" -> "kamisato ayaka"
const wikiKey = name => name.replace(/\.[a-z]+$/i, '').replaceAll('_', ' ').replace(/ portrait$/i, '').trim().toLowerCase();
const wikiFiles = new Map(existsSync(WIKI_DIR)
  ? readdirSync(WIKI_DIR).filter(f => /\.(png|webp|jpe?g)$/i.test(f)).map(f => [wikiKey(f), `${WIKI_DIR}/${f}`])
  : []);

// An image has a real cut-out when some of its pixels are fully transparent
async function isCutOut(file) {
  const { channels, isOpaque } = await sharp(file).stats();
  return !isOpaque && channels.length === 4 && channels[3].min === 0;
}

async function pixels(file) {
  const { width, height } = await sharp(file).metadata();
  return width * height;
}

// Picks the larger source, writes <id>.webp and returns { path, source }
async function buildPortrait(id, sources) {
  const sized = await Promise.all(sources.map(async s => ({ ...s, pixels: await pixels(s.file) })));
  const best = sized.toSorted((a, b) => b.pixels - a.pixels)[0];
  const target = `src/assets/img/${PORTRAIT_DIR}/${id}.webp`;
  const result = { path: `assets/img/${PORTRAIT_DIR}/${id}.webp`, source: best.source };
  if (!forceIcons && existsSync(target) && statSync(target).mtimeMs >= statSync(best.file).mtimeMs) return result;

  let image = sharp(best.file).resize({ ...PORTRAIT_MAX, fit: 'inside', withoutEnlargement: true });
  if (!await isCutOut(best.file)) {
    const { data, info } = await image.flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
    const rgba = removeWhiteBackground(data, info.width, info.height, KEEP_WHITE[id]);
    image = sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } });
    result.cutOut = true;
  }
  await image.webp({ quality: 90, alphaQuality: 100, effort: 5 }).toFile(target);
  // Drop files left by older runs under another extension
  for (const ext of EXTS.filter(e => e !== 'webp')) rmSync(`src/assets/img/${PORTRAIT_DIR}/${id}.${ext}`, { force: true });
  result.generated = true;
  return result;
}

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

function details(enName, language, portrait) {
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
    nation: NATIONS[c.associationType] ?? null,
    affiliation: c.affiliation ?? '',
    birthday: c.birthdaymmdd ?? '',
    constellationName: c.constellation ?? '',
    substat: c.substatText ?? c.substatType ?? '',
    voiceActors: c.cv ?? {},
    version: c.version ?? '',
    releaseDate: VERSION_DATES[c.version] ?? null,
    images: { portrait },
    signatureWeapon: SIGNATURE_WEAPONS[enName]
      ? item(genshindb.weapons(SIGNATURE_WEAPONS[enName], opts), 'weapons/signature') : null,
    specialDish: SPECIAL_DISHES.has(c.id)
      ? dish(genshindb.foods(SPECIAL_DISHES.get(c.id), opts)) : null,
    stats: stats(c),
    ascension: costs(c.costs, 'ascend'),
    talents: talents(genshindb.talents(enName, opts)),
    constellations: constellations(genshindb.constellations(enName, opts)),
  };
}

async function download(fileName) {
  const { dir, urls } = downloads.get(fileName);
  const target = `${dir}/${fileName}`;
  if (!forceIcons && existsSync(target)) return false;
  const errors = [];
  for (const url of urls) {
    const response = await fetch(url);
    const type = response.headers.get('content-type') ?? '';
    if (response.ok && type.startsWith('image/')) {
      writeFileSync(target, Buffer.from(await response.arrayBuffer()));
      return true;
    }
    errors.push(`${url}: HTTP ${response.status} (${type})`);
  }
  throw new Error(errors.join(', '));
}

const names = genshindb.characters('names', { matchCategories: true, resultLanguage: 'English' });
await loadRepoIds();

// Portraits first, so each JSON knows whether its character has one
mkdirSync(`src/assets/img/${PORTRAIT_DIR}`, { recursive: true });
mkdirSync(REPO_CACHE, { recursive: true });
// portrait id -> { repo, wiki } (Aether and Lumine share one)
const portraitIds = new Map();
const portraitSources = new Map();
const usedWikiFiles = new Set();
for (const enName of names) {
  const repo = repoId(enName);
  const wikiName = wikiKey(WIKI_ALIASES[enName] ?? enName);
  const wiki = wikiFiles.get(wikiName);
  if (!repo && !wiki) continue;
  const id = repo ?? slug(enName);
  portraitIds.set(enName, id);
  const sources = portraitSources.get(id) ?? {};
  if (repo) sources.repo = repo;
  if (wiki) { sources.wiki = wiki; usedWikiFiles.add(wikiName); }
  portraitSources.set(id, sources);
}

const portraitPaths = new Map();
const failed = [];
const portraitStats = { generated: 0, cutOut: 0, wiki: 0, repo: 0 };
const ids = [...portraitSources.keys()];
for (let i = 0; i < ids.length; i += DOWNLOAD_BATCH) {
  const batch = ids.slice(i, i + DOWNLOAD_BATCH);
  const results = await Promise.allSettled(batch.map(async id => {
    const { repo, wiki } = portraitSources.get(id);
    const sources = [];
    if (wiki) sources.push({ source: 'wiki', file: wiki });
    if (repo) {
      try {
        const file = await repoPortrait(repo);
        if (file) sources.push({ source: 'repo', file });
      } catch (e) {
        // Some repo folders have no portrait: fine as long as the wiki has one
        if (!sources.length) throw e;
      }
    }
    return sources.length ? buildPortrait(id, sources) : null;
  }));
  results.forEach((result, j) => {
    if (result.status === 'rejected') failed.push(`${batch[j]}: ${result.reason.message}`);
    else if (result.value) {
      const { path, source, generated, cutOut } = result.value;
      portraitPaths.set(batch[j], path);
      portraitStats[source]++;
      if (generated) portraitStats.generated++;
      if (cutOut) portraitStats.cutOut++;
    }
  });
}
console.log(`${portraitPaths.size} portraits (${portraitStats.wiki} from the wiki, ${portraitStats.repo} from the repo): `
  + `${portraitStats.generated} generated (${portraitStats.cutOut} with their white background removed), `
  + `${portraitPaths.size - portraitStats.generated} already up to date, ${portraitsDownloaded} downloaded from the repo`);
const unusedWiki = [...wikiFiles.keys()].filter(k => !usedWikiFiles.has(k));
if (unusedWiki.length) console.warn(`Wiki portraits matching no genshin-db character: ${unusedWiki.map(k => wikiFiles.get(k).split('/').pop()).join(', ')} (add them to WIKI_ALIASES if the names differ)`);

// Start from empty folders so characters removed from the game don't leave stale files
for (const lang of Object.keys(LANGUAGES)) {
  rmSync(`${OUTPUT_DIR}/${lang}`, { recursive: true, force: true });
  mkdirSync(`${OUTPUT_DIR}/${lang}`, { recursive: true });
}

const incomplete = [], noImages = [];
for (const enName of names) {
  const portrait = portraitPaths.get(portraitIds.get(enName)) ?? null;
  for (const [lang, language] of Object.entries(LANGUAGES)) {
    const data = details(enName, language, portrait);
    if (!data) continue;
    if (lang === 'en' && (!data.talents || !data.constellations.length)) incomplete.push(enName);
    if (lang === 'en' && !portrait) noImages.push(enName);
    writeFileSync(`${OUTPUT_DIR}/${lang}/${data.id}.json`, JSON.stringify(data) + '\n');
  }
}
console.log(`${names.length} characters written to ${OUTPUT_DIR}/{${Object.keys(LANGUAGES).join(',')}}`);
if (incomplete.length) console.warn(`No talents or constellations found for: ${incomplete.join(', ')}`);
const undated = [...new Set(names.map(n => genshindb.characters(n)?.version).filter(v => v && !VERSION_DATES[v]))];
if (undated.length) console.warn(`No release date for version ${undated.join(', ')}: add it to VERSION_DATES`);
const unknownWeapons = Object.entries(SIGNATURE_WEAPONS).filter(([, w]) => !genshindb.weapons(w, { queryLanguages: ['English'] }));
if (unknownWeapons.length) console.warn(`Signature weapons not found in genshin-db: ${unknownWeapons.map(([c, w]) => w + ' (' + c + ')').join(', ')}`);
const noSignature = names.filter(n => genshindb.characters(n)?.rarity === 5 && !SIGNATURE_WEAPONS[n]);
if (noSignature.length) console.log(`5-star characters without a signature weapon: ${noSignature.join(', ')}`);
if (noImages.length) console.warn(`No portrait for: ${noImages.join(', ')} (add one to ${WIKI_DIR}, or an alias to REPO_ALIASES or WIKI_ALIASES)`
  + (repoIds ? '' : '. GitHub was unreachable: only repo portraits already cached were used.'));

for (const { dir } of downloads.values()) mkdirSync(dir, { recursive: true });
const list = [...downloads.keys()];
let downloaded = 0;
const portraitFailures = failed.length;
for (let i = 0; i < list.length; i += DOWNLOAD_BATCH) {
  const batch = list.slice(i, i + DOWNLOAD_BATCH);
  const results = await Promise.allSettled(batch.map(download));
  results.forEach((result, j) => {
    if (result.status === 'rejected') failed.push(`${batch[j]}: ${result.reason.message}`);
    else if (result.value) downloaded++;
  });
}
console.log(`${downloaded} icons (skills, signature weapons, dishes) downloaded to src/assets/img, ${list.length - downloaded - (failed.length - portraitFailures)} already there`);
if (failed.length) {
  console.error(`${failed.length} images could not be downloaded:\n  ${failed.join('\n  ')}`);
  process.exitCode = 1;
}
