import { Talent } from './models/character';

export interface TalentStat {
  name: string;
  value: string;
  delta: string | null;
  constant: boolean;
}

// Placeholder formats found in genshin-db labels: F1P, F2P, P (percent with 1, 2 or 0 decimals),
// F1, F2, I (plain number with 1, 2 or 0 decimals)
const FORMAT = /^(?:F(\d))?(P)?$|^I$/;

function formatValue(value: number, format: string, lang: string): string {
  const match = FORMAT.exec(format);
  const decimals = match?.[1] ? Number(match[1]) : 0;
  const percent = !!match?.[2];
  return new Intl.NumberFormat(lang, {
    style: percent ? 'percent' : 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Turns the labels of a talent into name/value pairs at the given level (1-15).
 * "1-Hit DMG|{param1:F1P}" at level 1 → { name: "1-Hit DMG", value: "94.4%" }
 */
export function talentStats(talent: Talent, level: number, lang: string): TalentStat[] {
  return talent.labels.map(label => {
    const [name, tpl] = label.split('|');
    // Fills the template with pick(values, format) for each placeholder
    const fill = (pick: (values: number[], format: string) => string) =>
      tpl.replace(/\{(param\d+):([^}]+)\}/g, (_, param: string, format: string) => {
        const values = talent.parameters[param];
        return values?.length ? pick(values, format) : '—';
      });
    // Some talents don't scale with the level and only have one value
    const at = (values: number[], lvl: number) => values[Math.min(lvl, values.length) - 1];

    return {
      name,
      value: fill((v, f) => formatValue(at(v, level), f, lang)),
      delta: level > 1 ? fill((v, f) => formatValue(at(v, level) - at(v, level - 1), f, lang)) : null,
      constant: isConstant(tpl, talent.parameters),
    };
  });
}

// True when every parameter used by the label has the same value at levels 1 to 10
const isConstant = (tpl: string, parameters: Record<string, number[]>) =>
  [...tpl.matchAll(/\{(param\d+):/g)]
    .map(m => parameters[m[1]] ?? [])
    .every(values => values.slice(0, 10).every(v => v === values[0]));

export interface StatTerm { sep: string; num: string; unit: string; }

// "3 389", "1,213.1", "0,42" + optional "%"
const NUM = /^((?:\d{1,3}(?:[\s\u202f\u00a0,]\d{3})+|\d+)(?:[.,]\d+)?\s?%?)\s*(.*)$/;

export function splitStatValue(value: string): { terms: StatTerm[]; mult: string | null } {
  let body = value.trim(), mult: string | null = null;
  const m = body.match(/\s*×\s?(\d+)$/);
  if (m) { mult = '×' + m[1]; body = body.slice(0, m.index).trim().replace(/^\((.*)\)$/, '$1'); }
  // "+" or "/" followed by a number = new term
  const parts = body.split(/\s*([+/])\s*(?=\d)/);
  const terms: StatTerm[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const n = parts[i].match(NUM);
    terms.push({ sep: i ? parts[i - 1] : '', num: n ? n[1].trim() : parts[i], unit: n ? n[2] : '' });
  }
  return { terms, mult };
}