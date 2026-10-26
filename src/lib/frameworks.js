// Pure functions for the strategy frameworks (Five Forces, 3C, TAM/SAM/SOM).
import {FORCES, THREE_C, CURRENCIES} from '../data/frameworks.js';

const isScore = (v) => Number.isInteger(v) && v >= 1 && v <= 5;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// ---------- Porter's Five Forces ----------
export function forcesSummary(forces = {}, scores = {}) {
  const items = FORCES.map((f) => {
    const fav = f.suggest.map((id) => scores[id]).filter(isScore);
    const suggested = fav.length ? Math.min(5, Math.max(1, Math.round(6 - mean(fav)))) : null;
    return {...f, intensity: isScore(forces[f.id]) ? forces[f.id] : null, suggested};
  });
  const rated = items.filter((f) => f.intensity != null);
  // Attractiveness on the same 1–5 "higher is better" scale as the scorecard.
  const attractiveness = rated.length ? mean(rated.map((f) => 6 - f.intensity)) : null;
  const strongest = [...rated].sort((a, b) => b.intensity - a.intensity).filter((f) => f.intensity >= 4);
  return {items, rated: rated.length, attractiveness, strongest};
}

export const attractivenessLabel = (v) =>
  v == null ? 'Not rated yet'
    : v >= 4 ? 'Highly attractive industry'
    : v >= 3.3 ? 'Attractive, with some pressure'
    : v >= 2.5 ? 'Tough industry: you need a sharp edge'
    : 'Brutal industry: profits get competed away';

// ---------- 3C ----------
export function threeC(scores = {}) {
  return THREE_C.map((c) => {
    const vals = c.criteria.map((id) => scores[id]).filter(isScore);
    return {...c, score: mean(vals), scored: vals.length, total: c.criteria.length};
  });
}

// ---------- TAM / SAM / SOM ----------
const num = (v) => {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(/[, _]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function marketSizing(m = {}) {
  const price = num(m.price);
  let tam;
  let sam;
  let som;
  let accounts = null;
  if (m.mode === 'topdown') {
    tam = num(m.tam);
    sam = num(m.sam);
    som = num(m.som);
  } else {
    accounts = num(m.accounts);
    const samPct = num(m.samPct);
    const somPct = num(m.somPct);
    tam = accounts != null && price != null ? accounts * price : null;
    sam = tam != null && samPct != null ? (tam * Math.min(samPct, 100)) / 100 : null;
    som = sam != null && somPct != null ? (sam * Math.min(somPct, 100)) / 100 : null;
  }
  const goal = num(m.goal);
  const warnings = [];
  if (tam != null && sam != null && sam > tam) warnings.push('SAM is larger than TAM. SAM must be a subset of TAM.');
  if (sam != null && som != null && som > sam) warnings.push('SOM is larger than SAM. SOM must be a subset of SAM.');
  if (m.mode !== 'topdown' && num(m.somPct) > 10) warnings.push('Winning more than 10% of your serviceable market within 3–5 years is rare. Double-check the SOM %.');

  const customers = (v) => (v != null && price ? v / price : null);
  let suggestedScore = null;
  let goalCheck = null;
  if (goal && som != null) {
    const ratio = som / goal;
    suggestedScore = ratio >= 3 ? 5 : ratio >= 1.5 ? 4 : ratio >= 1 ? 3 : ratio >= 0.5 ? 2 : 1;
    goalCheck = {
      ratio,
      customersNeeded: price ? goal / price : null,
      shareOfSam: sam ? goal / sam : null,
    };
  }
  return {
    tam, sam, som, goal, price,
    accounts: {tam: m.mode === 'topdown' ? customers(tam) : accounts, sam: customers(sam), som: customers(som)},
    warnings, goalCheck, suggestedScore,
    complete: tam != null && sam != null && som != null,
  };
}

export function symbolFor(code) {
  return (CURRENCIES.find((c) => c.code === code) || CURRENCIES[0]).symbol;
}

export function money(v, code = 'USD') {
  if (v == null) return '–';
  const s = symbolFor(code);
  const abs = Math.abs(v);
  const units = code === 'INR'
    ? [[1e7, 'Cr'], [1e5, 'L'], [1e3, 'K']]
    : [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
  for (const [d, u] of units) {
    if (abs >= d) return `${s}${(v / d).toFixed(v / d >= 100 ? 0 : 1).replace(/\.0$/, '')}${u}`;
  }
  return `${s}${Math.round(v).toLocaleString('en-US')}`;
}

export function count(v) {
  if (v == null) return '–';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1e4) return `${(v / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return Math.round(v).toLocaleString('en-US');
}
