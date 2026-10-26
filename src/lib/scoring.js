// Pure scoring functions. An idea's `scores` is {criterionId: 1..5}; missing = unscored.
import {SECTIONS, CRITERIA, CRITERION_BY_ID} from '../data/criteria.js';
import {LENSES} from '../data/lenses.js';

const isScored = (v) => Number.isInteger(v) && v >= 1 && v <= 5;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function sectionScores(scores) {
  return SECTIONS.map((s) => {
    const vals = s.criteria.map((c) => scores[c.id]).filter(isScored);
    return {id: s.id, title: s.title, icon: s.icon, score: mean(vals), scored: vals.length, total: s.criteria.length};
  });
}

export function lensScores(scores) {
  return LENSES.map((lens) => {
    let sum = 0;
    let wsum = 0;
    let wtotal = 0;
    const drivers = [];
    for (const [id, w] of Object.entries(lens.weights)) {
      wtotal += w;
      const v = scores[id];
      if (isScored(v)) {
        sum += v * w;
        wsum += w;
        drivers.push({id, label: CRITERION_BY_ID[id].label, score: v, weight: w});
      }
    }
    // Strongest/weakest drivers: by score, ties broken by weight.
    const strongest = [...drivers].sort((a, b) => b.score - a.score || b.weight - a.weight).filter((d) => d.score >= 4).slice(0, 2);
    const weakest = [...drivers].sort((a, b) => a.score - b.score || b.weight - a.weight).filter((d) => d.score <= 2).slice(0, 2);
    return {
      ...lens,
      score: wsum ? sum / wsum : null,
      coverage: wtotal ? wsum / wtotal : 0,
      strongest,
      weakest,
    };
  });
}

const BANDS = [
  {min: 4.0, key: 'strong', label: 'Strong: pursue it', tone: 'good'},
  {min: 3.3, key: 'promising', label: 'Promising: validate the risks', tone: 'ok'},
  {min: 2.5, key: 'weak', label: 'Weak: rework the idea', tone: 'warn'},
  {min: 0, key: 'rethink', label: 'Rethink or drop it', tone: 'bad'},
];
const ORDER = BANDS.map((b) => b.key);

export function evaluate(scores = {}, evidence = {}) {
  const scoredIds = CRITERIA.filter((c) => isScored(scores[c.id])).map((c) => c.id);
  const sections = sectionScores(scores);
  const sectionVals = sections.map((s) => s.score).filter((v) => v != null);
  const overall = mean(sectionVals);
  const coverage = scoredIds.length / CRITERIA.length;
  const confidence = scoredIds.length ? scoredIds.filter((id) => evidence[id]).length / scoredIds.length : 0;

  const knockouts = CRITERIA.filter((c) => c.critical && isScored(scores[c.id]) && scores[c.id] <= 2);
  const redFlags = CRITERIA.filter((c) => isScored(scores[c.id]) && scores[c.id] <= 2)
    .sort((a, b) => scores[a.id] - scores[b.id] || (b.critical ? 1 : 0) - (a.critical ? 1 : 0));

  // Validate next: low criticals, unknown criticals, then other unknowns, then 3s without evidence.
  const rank = (c) => {
    const v = scores[c.id];
    if (c.critical && isScored(v) && v <= 2) return 0;
    if (c.critical && !isScored(v)) return 1;
    if (!isScored(v)) return 2;
    if (v === 3 && !evidence[c.id]) return 3;
    if (v <= 2) return 4;
    return null;
  };
  const validateNext = CRITERIA.map((c) => ({c, r: rank(c)}))
    .filter((x) => x.r != null)
    .sort((a, b) => a.r - b.r)
    .slice(0, 6)
    .map(({c, r}) => ({...c, reason: ['Critical risk', 'Critical unknown', 'Unknown', 'Unproven guess', 'Weak'][r], score: scores[c.id]}));

  let verdict = null;
  const warnings = [];
  if (overall != null && scoredIds.length >= 5) {
    let band = BANDS.find((b) => overall >= b.min);
    if (knockouts.length) {
      warnings.push(`Knockout: ${knockouts.map((k) => k.label).join(', ')} scored ≤ 2. A single fatal flaw can sink an otherwise good idea.`);
      const idx = Math.max(ORDER.indexOf(band.key), ORDER.indexOf('weak'));
      band = BANDS[idx];
    }
    if (coverage < 0.6) {
      warnings.push(`Only ${Math.round(coverage * 100)}% of criteria are scored, so treat this verdict as provisional.`);
    }
    if (confidence < 0.4) {
      warnings.push('Most scores are not marked as evidence-backed. Collect evidence before you commit.');
    }
    verdict = {...band, provisional: coverage < 0.6};
  }

  return {
    overall,
    coverage,
    confidence,
    scoredCount: scoredIds.length,
    total: CRITERIA.length,
    sections,
    lenses: lensScores(scores),
    verdict,
    warnings,
    knockouts,
    redFlags,
    validateNext,
  };
}

export const fmt = (v) => (v == null ? '–' : v.toFixed(1));
export const toneFor = (v) => (v == null ? 'none' : v >= 4 ? 'good' : v >= 3.3 ? 'ok' : v >= 2.5 ? 'warn' : 'bad');
