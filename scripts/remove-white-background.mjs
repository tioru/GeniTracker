// Removes the white background of a character portrait, used by export-character-details.mjs.
//
// 1. Background: the near-white pixels reached from the image borders, plus the enclosed
//    near-white areas (inside a bow, between the legs, between hair strands) that are a flat,
//    pure white AND outlined by dark line art. White clothes are either shaded or outlined by
//    light shading, so they are kept.
// 2. Edges: each pixel next to the background is a mix of the character's color and white.
//    Its alpha is how far it is from white toward the closest character color, and the white
//    is taken out of its color, so hair tips and outlines keep no light halo.

const BG_HARD = 18;      // distance from white (255 - darkest channel) under which a pixel is near-white
const EDGE = 3;          // width in px of the edge band where colors are unmixed from white
const SEARCH = 5;        // radius in px where the character color of an edge pixel is looked for
const MIN_COLOR = 40;    // a character color closer to white than this can't be unmixed: fade instead
const FADE_SOFT = 90;    // fallback fade: transparent at BG_HARD, opaque at FADE_SOFT

// An enclosed near-white area is background when all of these hold
const HOLE_MIN_AREA = 20;     // px
const HOLE_FLAT = 0.85;       // share of pure white pixels (distance <= 3)
const HOLE_MAX_MEAN = 1.5;    // average distance from white
const HOLE_RING = 4;          // px around the area checked for an outline
const HOLE_RING_DARK = 0.15;  // share of dark pixels (luminance < 110) in that ring

const neighbors = (i, w, n) => {
  const x = i % w;
  return [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < n - w ? i + w : -1];
};

// Fills from the seeds through near-white pixels not yet in `mark`; returns the filled pixels
function fillNearWhite(seeds, img, mark) {
  const { dist, w, n, stack } = img;
  const filled = [];
  let sp = 0;
  const push = i => {
    if (i >= 0 && !mark[i] && dist[i] <= BG_HARD) { mark[i] = 1; stack[sp++] = i; filled.push(i); }
  };
  seeds.forEach(push);
  while (sp) neighbors(stack[--sp], w, n).forEach(push);
  return filled;
}

function looksLikeHole(area, img, ringMark, id) {
  const { dist, rgb, w, n } = img;
  if (area.length < HOLE_MIN_AREA) return false;
  let flat = 0, sum = 0;
  for (const i of area) { sum += dist[i]; if (dist[i] <= 3) flat++; }
  if (flat / area.length < HOLE_FLAT || sum / area.length > HOLE_MAX_MEAN) return false;

  for (const i of area) ringMark[i] = id;
  let frontier = area, ring = 0, dark = 0;
  for (let d = 0; d < HOLE_RING; d++) {
    const next = [];
    for (const i of frontier) {
      for (const j of neighbors(i, w, n)) {
        if (j < 0 || ringMark[j] === id) continue;
        ringMark[j] = id;
        next.push(j);
        ring++;
        if (0.299 * rgb[j * 3] + 0.587 * rgb[j * 3 + 1] + 0.114 * rgb[j * 3 + 2] < 110) dark++;
      }
    }
    frontier = next;
  }
  return dark / ring >= HOLE_RING_DARK;
}

function findBackground(img, keep) {
  const { w, h, n } = img;
  const bg = new Uint8Array(n);
  const borders = [];
  for (let x = 0; x < w; x++) borders.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) borders.push(y * w, y * w + w - 1);
  fillNearWhite(borders, img, bg);

  const keepPixels = new Set(keep.map(([x, y]) => y * w + x));
  const seen = bg.slice();
  const ringMark = new Int32Array(n);
  let id = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s] || img.dist[s] > BG_HARD) continue;
    const area = fillNearWhite([s], img, seen);
    if (area.some(i => keepPixels.has(i))) continue;
    if (looksLikeHole(area, img, ringMark, ++id)) for (const i of area) bg[i] = 1;
  }
  return bg;
}

// near[i]: distance in px to the background, up to EDGE (255 = further)
function distanceToBackground(bg, img) {
  const { w, n } = img;
  const near = new Uint8Array(n).fill(255);
  let frontier = [];
  for (let i = 0; i < n; i++) if (bg[i]) { near[i] = 0; frontier.push(i); }
  for (let d = 1; d <= EDGE; d++) {
    const next = [];
    for (const i of frontier) for (const j of neighbors(i, w, n)) if (j >= 0 && near[j] === 255) { near[j] = d; next.push(j); }
    frontier = next;
  }
  return near;
}

// Closest pixel beyond the edge band: the color this edge pixel would have without the white
function characterColor(i, near, img) {
  const { rgb, w, h } = img;
  const x0 = i % w, y0 = Math.floor(i / w);
  let best = i, bestD = Infinity;
  for (let y = Math.max(0, y0 - SEARCH); y <= Math.min(h - 1, y0 + SEARCH); y++) {
    for (let x = Math.max(0, x0 - SEARCH); x <= Math.min(w - 1, x0 + SEARCH); x++) {
      const j = y * w + x, d = (x - x0) ** 2 + (y - y0) ** 2;
      if (near[j] === 255 && d < bestD) { bestD = d; best = j; }
    }
  }
  return [rgb[best * 3], rgb[best * 3 + 1], rgb[best * 3 + 2]];
}

function edgeAlpha(i, near, img) {
  const { rgb, dist } = img;
  const f = characterColor(i, near, img).map(v => v - 255);
  const p = [rgb[i * 3] - 255, rgb[i * 3 + 1] - 255, rgb[i * 3 + 2] - 255];
  const len2 = f[0] ** 2 + f[1] ** 2 + f[2] ** 2;
  const a = len2 >= MIN_COLOR ** 2
    ? (p[0] * f[0] + p[1] * f[1] + p[2] * f[2]) / len2
    : (dist[i] - BG_HARD) / (FADE_SOFT - BG_HARD);
  return Math.min(1, Math.max(0, a));
}

/**
 * @param rgb raw RGB pixels, flattened on white
 * @param keep [x, y] points: the enclosed white area holding one of them is never removed
 * @returns raw RGBA pixels
 */
export function removeWhiteBackground(rgb, w, h, keep = []) {
  const n = w * h;
  const dist = new Uint8Array(n);
  for (let i = 0; i < n; i++) dist[i] = 255 - Math.min(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
  const img = { rgb, dist, w, h, n, stack: new Int32Array(n) };

  const bg = findBackground(img, keep);
  const near = distanceToBackground(bg, img);

  const rgba = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    let a = 1;
    if (bg[i]) a = 0;
    else if (near[i] <= EDGE) a = edgeAlpha(i, near, img);
    for (let c = 0; c < 3; c++) {
      const v = rgb[i * 3 + c];
      rgba[i * 4 + c] = a > 0 && a < 1 ? Math.max(0, Math.min(255, Math.round((v - 255 * (1 - a)) / a))) : v;
    }
    rgba[i * 4 + 3] = Math.round(a * 255);
  }
  return rgba;
}
