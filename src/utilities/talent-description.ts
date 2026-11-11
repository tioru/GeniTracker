export type Token = { text: string; kind?: 'element' | 'number' | 'quote'; el?: string };
export type Block =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'text' | 'bullet'; tokens: Token[] };

const ELEMENTS: Record<string, string> = {
  anémo: 'anemo', anemo: 'anemo', géo: 'geo', geo: 'geo', électro: 'electro', electro: 'electro',
  dendro: 'dendro', hydro: 'hydro', pyro: 'pyro', cryo: 'cryo',
};

// Element names, numbers with a unit ("80 pts", "33,3 %", "6 cartouches" not included), « quoted names »
const TOKEN = /(\b(?:Anémo|Anemo|Géo|Geo|Électro|Electro|Dendro|Hydro|Pyro|Cryo)\b|\d+(?:[,.]\d+)?(?:\s?(?:%|pts?|s)\b|\s?%)|«[^»]+»)/g;

/** A short line without final punctuation = title */
const isTitle = (line: string) => line.length <= 45 && !/[.:!?,;]$/.test(line) && !line.startsWith('·');

function tokenize(text: string): Token[] {
  return text.split(TOKEN).filter(Boolean).map(part => {
    const el = ELEMENTS[part.toLowerCase()];
    if (el) return { text: part, kind: 'element', el };
    if (/^\d/.test(part)) return { text: part, kind: 'number' };
    if (part.startsWith('«')) return { text: part, kind: 'quote' };
    return { text: part };
  });
}

export function parseDescription(raw: string | null | undefined): Block[] {
  const blocks: Block[] = [];
  for (const section of (raw ?? '').split(/\n\s*\n/)) {
    const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach((line, i) => {
      const next = lines[i + 1];
      if (isTitle(line) && next && !isTitle(next)) {
        // first title of the section = heading, the next ones ("Appui simple") = subheading
        blocks.push({ type: i === 0 ? 'heading' : 'subheading', text: line });
      } else if (isTitle(line) && next && isTitle(next)) {
        blocks.push({ type: 'heading', text: line });       // "Visée multiple" followed by "Appui simple"
      } else if (line.startsWith('·')) {
        blocks.push({ type: 'bullet', tokens: tokenize(line.replace(/^·\s*/, '')) });
      } else {
        blocks.push({ type: 'text', tokens: tokenize(line) });
      }
    });
  }
  return blocks;
}