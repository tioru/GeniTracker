export type Token = { text: string; kind?: 'element' | 'number' | 'quote' | 'bold'; el?: string };
export type Block =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'text' | 'bullet'; tokens: Token[] };

const ELEMENTS: Record<string, string> = {
  anémo: 'anemo', anemo: 'anemo', géo: 'geo', geo: 'geo', électro: 'electro', electro: 'electro',
  dendro: 'dendro', hydro: 'hydro', pyro: 'pyro', cryo: 'cryo',
};

const TOKEN = /((?<!\p{L})(?:Anémo|Anemo|Géo|Geo|Électro|Electro|Dendro|Hydro|Pyro|Cryo)(?!\p{L})|\d+(?:[,.]\d+)?(?:\s?(?:%|pts?|s)\b|\s?%)|«[^»]+»)/gu;

/** "**Title**" -> "Title" */
const stripBold = (line: string) => line.replace(/^\*\*(.+)\*\*$/, '$1');

/** A short line without final punctuation = title */
const isTitle = (line: string) => {
  const l = stripBold(line);
  return l.length <= 45 && !/[.:!?,;]$/.test(l) && !l.startsWith('·');
};

/** Elements, numbers, « quotes » inside a plain chunk */
function tokenizeInline(text: string): Token[] {
  return text.split(TOKEN).filter(Boolean).map(part => {
    const el = ELEMENTS[part.toLowerCase()];
    if (el) return { text: part, kind: 'element', el };
    if (/^\d/.test(part)) return { text: part, kind: 'number' };
    if (part.startsWith('«')) return { text: part, kind: 'quote' };
    return { text: part };
  });
}

/** "**word**" = bold; odd parts after split are the bold ones */
function tokenize(text: string): Token[] {
  const parts = text.replace(/\s+([.,])/g, '$1').split('**');
  // even number of parts = one "**" is not closed: keep the last one as plain text
  if (parts.length % 2 === 0) parts[parts.length - 2] += '**' + parts.pop();
  return parts.flatMap((chunk, i) =>
    !chunk ? [] : i % 2 ? [{ text: chunk, kind: 'bold' as const }] : tokenizeInline(chunk));
}

export function parseDescription(raw: string | null | undefined): Block[] {
  const blocks: Block[] = [];
  for (const section of (raw ?? '').split(/\n\s*\n/)) {
    const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach((line, i) => {
      const next = lines[i + 1];
      if (isTitle(line) && next) {
        blocks.push({ type: i === 0 || isTitle(next) ? 'heading' : 'subheading', text: stripBold(line) });
      } else if (line.startsWith('·')) {
        blocks.push({ type: 'bullet', tokens: tokenize(line.replace(/^·\s*/, '')) });
      } else {
        blocks.push({ type: 'text', tokens: tokenize(line) });
      }
    });
  }
  return blocks;
}