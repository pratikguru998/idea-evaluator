// Pure helpers for the Grand Slam Offer builder.
import {CROWD, CORE_MARKETS, DRIVERS, STAGES, PROBLEM_DRIVERS, ATTENTION, EFFORT_LEVEL, MEDIUM, SCARCITY, URGENCY, GUARANTEES, BONUS_FORMATS, MAGIC} from '../data/offer.js';
import {uid, lines} from './vpc.js';

export const blankOffer = () => ({
  crowd: {}, core: '', niche: '',
  price: '', competitorPrice: '',
  dream: '', ve: {},
  problems: [], vehicles: [],
  scarcity: {type: '', detail: ''}, urgency: {type: '', detail: ''},
  bonuses: [],
  guarantee: {type: '', condition: '', remedy: '', name: ''},
  names: [],
});

const str = (v, max = 400) => (typeof v === 'string' ? v.slice(0, max) : typeof v === 'number' ? String(v) : '');
const oneOf = (v, list, dflt = list[0].id) => (list.some((x) => x.id === v) ? v : dflt);
const int = (v, lo, hi) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= lo && n <= hi ? n : null;
};
const amount = (v) => {
  const n = Number(v);
  return v !== '' && v != null && Number.isFinite(n) && n >= 0 ? String(n) : '';
};
const okId = (v) => (typeof v === 'string' && /^[a-z0-9]{1,16}$/i.test(v) ? v : uid());
const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

export function normalizeOffer(raw = {}) {
  const o = blankOffer();
  for (const c of CROWD) {
    const n = int(raw.crowd?.[c.id], 1, 10);
    if (n) o.crowd[c.id] = n;
  }
  o.core = oneOf(raw.core, [{id: ''}, ...CORE_MARKETS], '');
  o.niche = str(raw.niche);
  o.price = amount(raw.price);
  o.competitorPrice = amount(raw.competitorPrice);
  o.dream = str(raw.dream, 600);
  for (const d of DRIVERS) {
    const n = int(raw.ve?.[d.id], 1, 10);
    if (n) o.ve[d.id] = n;
  }
  o.problems = arr(raw.problems, 40).map((p) => ({
    id: okId(p?.id), text: str(p?.text), solution: str(p?.solution),
    stage: oneOf(p?.stage, STAGES), driver: oneOf(p?.driver, PROBLEM_DRIVERS),
  }));
  const pids = new Set(o.problems.map((p) => p.id));
  o.vehicles = arr(raw.vehicles, 80).map((v) => ({
    id: okId(v?.id), text: str(v?.text), problemId: pids.has(v?.problemId) ? v.problemId : '',
    attention: oneOf(v?.attention, ATTENTION), effort: oneOf(v?.effort, EFFORT_LEVEL), medium: oneOf(v?.medium, MEDIUM),
    value: int(v?.value, 1, 5) || 3, cost: int(v?.cost, 1, 5) || 3,
    include: Boolean(v?.include), worth: amount(v?.worth),
  }));
  o.scarcity = {type: oneOf(raw.scarcity?.type, SCARCITY, ''), detail: str(raw.scarcity?.detail)};
  o.urgency = {type: oneOf(raw.urgency?.type, URGENCY, ''), detail: str(raw.urgency?.detail)};
  o.bonuses = arr(raw.bonuses, 20).map((b) => ({
    id: okId(b?.id), name: str(b?.name, 200), detail: str(b?.detail),
    problemId: pids.has(b?.problemId) ? b.problemId : '', format: oneOf(b?.format, BONUS_FORMATS), worth: amount(b?.worth),
  }));
  o.guarantee = {
    type: oneOf(raw.guarantee?.type, GUARANTEES, ''),
    condition: str(raw.guarantee?.condition), remedy: str(raw.guarantee?.remedy), name: str(raw.guarantee?.name, 200),
  };
  o.names = arr(raw.names, 10).map((n) => ({
    id: okId(n?.id), fav: Boolean(n?.fav), ...Object.fromEntries(MAGIC.map((m) => [m.id, str(n?.[m.id], 120)])),
  }));
  return o;
}

// ---------- Starving crowd ----------
export function crowdScore(o) {
  const vals = CROWD.map((c) => o.crowd[c.id]).filter(Boolean);
  const total = vals.reduce((a, b) => a + b, 0);
  const weakest = CROWD.filter((c) => o.crowd[c.id]).sort((a, b) => o.crowd[a.id] - o.crowd[b.id])[0];
  const label = vals.length < 4 ? 'Rate all four indicators'
    : total >= 32 ? 'Starving crowd: a great market'
    : total >= 26 ? 'Good market, with one soft spot'
    : total >= 20 ? 'Average market: your offer must work harder'
    : 'Weak market: consider a different niche';
  return {total, rated: vals.length, label, weakest, tone: vals.length < 4 ? 'none' : total >= 32 ? 'good' : total >= 26 ? 'ok' : total >= 20 ? 'warn' : 'bad'};
}

export function suggestCrowd(scores = {}) {
  return Object.fromEntries(CROWD.filter((c) => scores[c.from]).map((c) => [c.id, scores[c.from] * 2]));
}

// ---------- Value equation ----------
export function valueEquation(o) {
  const {outcome, likelihood, time, effort} = o.ve;
  if (!outcome || !likelihood || !time || !effort) return {value: null, score: null, weakest: null};
  const value = (outcome * likelihood) / (time * effort);
  // Map 0.01…100 (log scale) onto 0…10.
  const score = Math.max(0, Math.min(10, ((Math.log10(value) + 2) / 4) * 10));
  // Weakest lever: lowest numerator driver or highest denominator driver.
  const levers = DRIVERS.map((d) => ({...d, bad: d.side === 'up' ? 10 - o.ve[d.id] : o.ve[d.id] - 1}));
  const weakest = levers.sort((a, b) => b.bad - a.bad)[0];
  return {value, score, weakest};
}

// ---------- Trim & stack ----------
export const quadrant = (v) => (v.value >= 4 && v.cost <= 2 ? 'gold' : v.value >= 4 ? 'premium' : v.cost <= 2 ? 'filler' : 'cut');
export const QUADRANTS = {
  gold: {label: 'Keep: high value, low cost', tone: 'good'},
  premium: {label: 'Keep if margins allow: high value, high cost', tone: 'ok'},
  filler: {label: 'Optional: low value, low cost', tone: 'warn'},
  cut: {label: 'Cut: low value, high cost', tone: 'bad'},
};

export function stackSummary(o) {
  const items = o.vehicles.filter((v) => v.include && v.text.trim());
  const coreValue = items.reduce((a, v) => a + (Number(v.worth) || 0), 0);
  const bonusValue = o.bonuses.filter((b) => b.name.trim()).reduce((a, b) => a + (Number(b.worth) || 0), 0);
  const total = coreValue + bonusValue;
  const price = Number(o.price) || 0;
  return {
    items, coreValue, bonusValue, total, price,
    ratio: price && total ? total / price : null,
    cuts: items.filter((v) => quadrant(v) === 'cut'),
  };
}

export function offerName(n) {
  const parts = MAGIC.map((m) => (n[m.id] || '').trim()).filter(Boolean);
  return parts.join(' ');
}

// ---------- Offer strength ----------
export function offerStrength(o) {
  const crowd = crowdScore(o);
  const ve = valueEquation(o);
  const st = stackSummary(o);
  const probs = o.problems.filter((p) => p.text.trim());
  const drivers = new Set(probs.map((p) => p.driver));
  const name = o.names.find((n) => n.fav) || o.names[0];
  const checks = [
    {id: 'crowd', label: 'Starving crowd scores at least 26/40', ok: crowd.rated === 4 && crowd.total >= 26, step: 'o-market'},
    {id: 'dream', label: 'Specific dream outcome written', ok: o.dream.trim().length >= 15, step: 'o-value'},
    {id: 've', label: 'Value equation is strong (score ≥ 6/10)', ok: ve.score != null && ve.score >= 6, step: 'o-value'},
    {id: 'problems', label: '5+ problems covering 3+ value drivers', ok: probs.length >= 5 && drivers.size >= 3, step: 'o-problems'},
    {id: 'solutions', label: 'Every problem has a solution', ok: probs.length > 0 && probs.every((p) => p.solution.trim()), step: 'o-problems'},
    {id: 'stack', label: '3+ delivery items in the stack, none “cut”', ok: st.items.length >= 3 && !st.cuts.length, step: 'o-stack'},
    {id: 'ratio', label: 'Total value is at least 10× the price', ok: st.ratio != null && st.ratio >= 10, step: 'o-stack'},
    {id: 'bonuses', label: 'Bonus value exceeds core value', ok: st.bonusValue > 0 && st.bonusValue >= st.coreValue, step: 'o-enhance'},
    {id: 'scarcity', label: 'Honest scarcity defined', ok: Boolean(o.scarcity.type && o.scarcity.detail.trim()), step: 'o-enhance'},
    {id: 'urgency', label: 'Honest urgency defined', ok: Boolean(o.urgency.type && o.urgency.detail.trim()), step: 'o-enhance'},
    {id: 'guarantee', label: 'Guarantee defined and named', ok: Boolean(o.guarantee.type && (o.guarantee.type === 'anti' || o.guarantee.condition.trim() || o.guarantee.remedy.trim())), step: 'o-enhance'},
    {id: 'name', label: 'Name uses all 5 MAGIC parts', ok: Boolean(name && MAGIC.every((m) => (name[m.id] || '').trim())), step: 'o-enhance'},
  ];
  const passed = checks.filter((c) => c.ok).length;
  const label = passed >= 11 ? 'Grand Slam Offer 🏆' : passed >= 8 ? 'Strong offer: polish the gaps' : passed >= 5 ? 'Decent offer: keep stacking value' : 'Commodity offer: easy to compare on price';
  return {checks, passed, total: checks.length, label, crowd, ve, stack: st, name};
}

// Pull what the earlier phases already know.
export function prefillProblems(idea) {
  const seen = new Set(idea.offer.problems.map((p) => p.text.trim().toLowerCase()));
  const fromPains = (idea.vpc?.pains || []).filter((p) => p.text.trim()).map((p) => p.text);
  const fromPersona = (idea.personas || []).flatMap((p) => lines(p.frustrations));
  return [...fromPains, ...fromPersona]
    .map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
    .slice(0, 12)
    .map((text) => ({id: uid(), text, solution: '', stage: 'during', driver: 'effort'}));
}

// "Problem → solution" reframing helper: turn an obstacle into a "How to…" headline.
export function howTo(problem) {
  const t = problem.text.trim().replace(/\.$/, '');
  if (!t) return '';
  const tails = {
    outcome: 'and make it obviously worth it',
    likelihood: 'even if you’ve failed before',
    time: 'fast, with a first win this week',
    effort: 'without the hard work',
  };
  return `How to beat “${t.charAt(0).toLowerCase()}${t.slice(1)}” ${tails[problem.driver]}`;
}
