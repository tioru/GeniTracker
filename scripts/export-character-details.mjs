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

const ELEMENTS = {
  ELEMENT_ANEMO: 'Anemo', ELEMENT_GEO: 'Geo', ELEMENT_ELECTRO: 'Electro', ELEMENT_DENDRO: 'Dendro',
  ELEMENT_HYDRO: 'Hydro', ELEMENT_PYRO: 'Pyro', ELEMENT_CRYO: 'Cryo',
};
const WEAPONS = {
  WEAPON_BOW: 'Bow', WEAPON_CATALYST: 'Catalyst', WEAPON_CLAYMORE: 'Claymore',
  WEAPON_POLE: 'Polearm', WEAPON_SWORD_ONE_HAND: 'Sword',
};

// local file name -> { dir, url }, filled while building the JSON, downloaded at the end
const downloads = new Map();
const image = (fileName, dir, url) => {
  if (!fileName) return null;
  downloads.set(fileName, { dir: 'src/assets/img/' + dir, url });
  return 'assets/img/' + dir + '/' + fileName;
};
const icon = fileName => fileName ? image(fileName + '.png', 'skills', ICON_URL + fileName + '.png') : null;

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
    region: c.region ?? '',
    affiliation: c.affiliation ?? '',
    birthday: c.birthdaymmdd ?? '',
    constellationName: c.constellation ?? '',
    substat: c.substatText ?? c.substatType ?? '',
    voiceActors: c.cv ?? {},
    version: c.version ?? '',
    images: { portrait },
    stats: stats(c),
    ascension: costs(c.costs, 'ascend'),
    talents: talents(genshindb.talents(enName, opts)),
    constellations: constellations(genshindb.constellations(enName, opts)),
  };
}

async function download(fileName) {
  const { dir, url } = downloads.get(fileName);
  const target = `${dir}/${fileName}`;
  if (!forceIcons && existsSync(target)) return false;
  const response = await fetch(url);
  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || !type.startsWith('image/')) {
    throw new Error(`${url}: HTTP ${response.status} (${type})`);
  }
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return true;
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
console.log(`${downloaded} skill icons downloaded to src/assets/img/skills, ${list.length - downloaded - (failed.length - portraitFailures)} already there`);
if (failed.length) {
  console.error(`${failed.length} images could not be downloaded:\n  ${failed.join('\n  ')}`);
  process.exitCode = 1;
}
