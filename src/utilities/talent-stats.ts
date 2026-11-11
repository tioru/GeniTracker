import { Talent } from './models/character';

export interface TalentStat {
  name: string;
  value: string;
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
    const value = tpl.replace(/\{(param\d+):([^}]+)\}/g, (_, param: string, format: string) => {
      const values = talent.parameters[param];
      if (!values?.length) return '—';
      // Some talents don't scale with the level and only have one value
      return formatValue(values[Math.min(level, values.length) - 1], format, lang);
    });
    return { name, value, constant: isConstant(tpl, talent.parameters) };
  });
}

// True when every parameter used by the label has the same value at levels 1 to 10
const isConstant = (tpl: string, parameters: Record<string, number[]>) =>
  [...tpl.matchAll(/\{(param\d+):/g)]
    .map(m => parameters[m[1]] ?? [])
    .every(values => values.slice(0, 10).every(v => v === values[0]));
