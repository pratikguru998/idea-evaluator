// Pure helpers for the Value Proposition Canvas and personas.
import {PROFILE, VALUE_MAP, GREAT_VP, FIT_STAGES, TEST_STATUS, AVATARS, PERSONA_COLORS, BUYING_ROLES, TRAITS, PERSONA_LISTS} from '../data/vpc.js';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const blankVpc = () => ({
  personaId: '',
  jobs: [], pains: [], gains: [],
  products: [], relievers: [], creators: [],
  adlibs: [], great: [], stages: {}, tests: [],
});

export const blankPersona = (n = 1) => ({
  id: uid(),
  name: `Persona ${n}`,
  avatar: AVATARS[(n - 1) % AVATARS.length],
  color: PERSONA_COLORS[(n - 1) % PERSONA_COLORS.length],
  role: '', age: '', location: '', quote: '', bio: '', budget: '',
  goals: '', frustrations: '', jobs: '', tools: '', channels: '', day: '',
  roles: [], traits: {}, interviews: '', primary: false,
});

const str = (v, max = 500) => (typeof v === 'string' ? v.slice(0, max) : typeof v === 'number' ? String(v).slice(0, max) : '');
const w15 = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 3;
};
const arr = (v, max = 60) => (Array.isArray(v) ? v.slice(0, max) : []);
const okId = (v) => (typeof v === 'string' && /^[a-z0-9]{1,16}$/i.test(v) ? v : uid());

export function normalizeVpc(raw = {}) {
  const v = blankVpc();
  v.personaId = str(raw.personaId, 16);
  for (const key of ['jobs', 'pains', 'gains']) {
    const types = PROFILE[key].types.map((t) => t.id);
    v[key] = arr(raw[key]).map((x) => ({
      id: okId(x?.id), text: str(x?.text), weight: w15(x?.weight),
      type: types.includes(x?.type) ? x.type : types[0],
    }));
  }
  const ptypes = VALUE_MAP.products.types.map((t) => t.id);
  v.products = arr(raw.products).map((x) => ({id: okId(x?.id), text: str(x?.text), type: ptypes.includes(x?.type) ? x.type : ptypes[0]}));
  for (const key of ['relievers', 'creators']) {
    const valid = new Set(v[VALUE_MAP[key].target].map((x) => x.id));
    v[key] = arr(raw[key]).map((x) => ({
      id: okId(x?.id), text: str(x?.text),
      targets: arr(x?.targets).filter((t) => valid.has(t)),
    }));
  }
  v.adlibs = arr(raw.adlibs, 10).map((a) => ({
    id: okId(a?.id), fav: Boolean(a?.fav),
    ...Object.fromEntries(['product', 'segment', 'job', 'verb1', 'pain', 'verb2', 'gain', 'competitor'].map((k) => [k, str(a?.[k], 200)])),
  }));
  v.great = arr(raw.great, GREAT_VP.length).filter((i) => Number.isInteger(i) && i >= 0 && i < GREAT_VP.length);
  v.stages = Object.fromEntries(FIT_STAGES.filter((s) => raw.stages?.[s.id]).map((s) => [s.id, {
    done: Boolean(raw.stages[s.id].done), note: str(raw.stages[s.id].note, 1000),
  }]));
  const statuses = TEST_STATUS.map((s) => s.id);
  v.tests = arr(raw.tests, 40).map((t) => ({
    id: okId(t?.id),
    ...Object.fromEntries(['hypothesis', 'test', 'metric', 'criteria', 'learning'].map((k) => [k, str(t?.[k], 1000)])),
    status: statuses.includes(t?.status) ? t.status : 'planned',
  }));
  return v;
}

export function normalizePersona(raw = {}, n = 1) {
  const p = blankPersona(n);
  p.id = okId(raw.id);
  for (const k of ['name', 'role', 'age', 'location', 'budget', 'interviews']) p[k] = str(raw[k], 120) || (k === 'name' ? p.name : '');
  for (const k of ['quote', 'bio', 'day', ...PERSONA_LISTS.map((l) => l.id)]) p[k] = str(raw[k], 3000);
  if (AVATARS.includes(raw.avatar)) p.avatar = raw.avatar;
  if (PERSONA_COLORS.includes(raw.color)) p.color = raw.color;
  const roleIds = BUYING_ROLES.map((r) => r.id);
  p.roles = arr(raw.roles, 5).filter((r) => roleIds.includes(r));
  const valid = (x) => Number.isInteger(Number(x)) && Number(x) >= 1 && Number(x) <= 5;
  p.traits = Object.fromEntries(TRAITS.filter((t) => valid(raw.traits?.[t.id])).map((t) => [t.id, Number(raw.traits[t.id])]));
  p.primary = Boolean(raw.primary);
  return p;
}

export const lines = (text) => (text || '').split('\n').map((s) => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

// ---------- Fit ----------
// Fit = share of customer-profile weight (severity / relevance) that the value map addresses.
export function vpcFit(v) {
  const addressed = {
    pains: new Set(v.relievers.flatMap((r) => r.targets)),
    gains: new Set(v.creators.flatMap((c) => c.targets)),
  };
  const side = (key) => {
    const items = v[key].filter((x) => x.text.trim());
    const total = items.reduce((a, x) => a + x.weight, 0);
    const hit = items.filter((x) => addressed[key].has(x.id));
    const covered = hit.reduce((a, x) => a + x.weight, 0);
    const gaps = items.filter((x) => !addressed[key].has(x.id)).sort((a, b) => b.weight - a.weight);
    const top = items.filter((x) => x.weight >= 4);
    return {
      items: items.length, total, covered, fit: total ? covered / total : null, gaps,
      topCovered: top.filter((x) => addressed[key].has(x.id)).length, top: top.length,
    };
  };
  const pains = side('pains');
  const gains = side('gains');
  const total = pains.total + gains.total;
  const fit = total ? (pains.covered + gains.covered) / total : null;
  const orphans = [...v.relievers, ...v.creators].filter((x) => x.text.trim() && !x.targets.length);
  const jobs = v.jobs.filter((j) => j.text.trim()).sort((a, b) => b.weight - a.weight);
  const kinds = new Set(jobs.map((j) => j.type));
  const ready = pains.items + gains.items >= 3 && v.relievers.length + v.creators.length >= 1;
  const suggestedScore = ready && fit != null ? (fit >= 0.8 ? 5 : fit >= 0.6 ? 4 : fit >= 0.4 ? 3 : fit >= 0.2 ? 2 : 1) : null;
  const warnings = [];
  if (orphans.length) warnings.push(`${orphans.length} pain reliever(s) / gain creator(s) are not linked to any customer pain or gain. Are they solving a problem nobody has?`);
  if (jobs.length && !kinds.has('social') && !kinds.has('emotional')) warnings.push('Only functional jobs listed. Great value propositions also address social and emotional jobs.');
  if (pains.top && pains.topCovered < pains.top) warnings.push(`${pains.top - pains.topCovered} extreme pain(s) (severity ≥ 4) are not relieved yet.`);
  if (v.relievers.length + v.creators.length > 10) warnings.push('More than 10 relievers/creators. Focus on a few things done extremely well.');
  return {pains, gains, fit, orphans, jobs, suggestedScore, warnings, great: v.great.length};
}

export function adlibText(a) {
  const f = (x, ph) => (x && x.trim() ? x.trim() : `___ ${ph} ___`);
  let s = `Our ${f(a.product, 'products & services')} help ${f(a.segment, 'customer segment')} who want to ${f(a.job, 'job to be done')} by ${f(a.verb1, 'reducing')} ${f(a.pain, 'a pain')} and ${f(a.verb2, 'increasing')} ${f(a.gain, 'a gain')}`;
  if (a.competitor && a.competitor.trim()) s += `, unlike ${a.competitor.trim()}`;
  return `${s}.`;
}
