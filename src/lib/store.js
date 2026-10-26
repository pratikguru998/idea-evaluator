// Browser-only persistence, share links and export. Every storage access is
// wrapped in try/catch: private windows or blocked storage must not break the page.
import {CRITERIA, SECTIONS} from '../data/criteria.js';
import {fmt} from './scoring.js';
import {BLANK_MARKET, FORCES, THREE_C, CURRENCIES} from '../data/frameworks.js';
import {forcesSummary, threeC, marketSizing, money, count, attractivenessLabel} from './frameworks.js';
import {blankVpc, normalizeVpc, normalizePersona, vpcFit, lines, adlibText} from './vpc.js';
import {TEST_STATUS, BUYING_ROLES, TRAITS} from '../data/vpc.js';
import {blankBmc, normalizeBmc, bmcSummary} from './bmc.js';
import {BMC_BLOCKS} from '../data/bmc.js';

const KEY = 'idea-evaluator:v1';

export const newId = () => Math.random().toString(36).slice(2, 10);

export function blankIdea(name = 'Untitled idea') {
  return {id: newId(), name, pitch: '', icp: '', scores: {}, evidence: {}, notes: {}, concerns: '', forces: {}, forceNotes: {}, c3: {}, market: {...BLANK_MARKET}, vpc: blankVpc(), personas: [], bmc: blankBmc(), updated: Date.now()};
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.ideas) || !data.ideas.length) return null;
    return {ideas: data.ideas.map(normalize), activeId: data.activeId};
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// Coerce imported/stored data into a valid idea shape.
export function normalize(raw = {}) {
  const base = blankIdea();
  const scores = {};
  const evidence = {};
  const notes = {};
  for (const c of CRITERIA) {
    const v = Number(raw.scores?.[c.id]);
    if (Number.isInteger(v) && v >= 1 && v <= 5) scores[c.id] = v;
    if (raw.evidence?.[c.id]) evidence[c.id] = true;
    if (typeof raw.notes?.[c.id] === 'string' && raw.notes[c.id]) notes[c.id] = raw.notes[c.id].slice(0, 2000);
  }
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const forces = {};
  const forceNotes = {};
  for (const f of FORCES) {
    const v = Number(raw.forces?.[f.id]);
    if (Number.isInteger(v) && v >= 1 && v <= 5) forces[f.id] = v;
    if (str(raw.forceNotes?.[f.id], 2000)) forceNotes[f.id] = str(raw.forceNotes[f.id], 2000);
  }
  const c3 = {};
  for (const c of THREE_C) if (str(raw.c3?.[c.id], 5000)) c3[c.id] = str(raw.c3[c.id], 5000);
  const market = {...BLANK_MARKET};
  for (const k of Object.keys(BLANK_MARKET)) {
    const v = raw.market?.[k];
    if (typeof v === 'string' || typeof v === 'number') market[k] = String(v).slice(0, k === 'source' ? 3000 : 40);
  }
  if (!['bottomup', 'topdown'].includes(market.mode)) market.mode = 'bottomup';
  if (!CURRENCIES.some((c) => c.code === market.currency)) market.currency = 'USD';
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : base.id,
    name: str(raw.name, 120) || base.name,
    pitch: str(raw.pitch, 500),
    icp: str(raw.icp, 500),
    concerns: str(raw.concerns, 10000),
    scores,
    evidence,
    notes,
    forces,
    forceNotes,
    c3,
    market,
    vpc: normalizeVpc(raw.vpc),
    bmc: normalizeBmc(raw.bmc),
    personas: (Array.isArray(raw.personas) ? raw.personas.slice(0, 12) : []).map((p, i) => normalizePersona(p, i + 1)),
    updated: Number(raw.updated) || Date.now(),
  };
}

// --- Share links: the idea is packed into the URL hash, never sent to a server.
const b64encode = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64decode = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

const bytesToB64 = (bytes) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const b64ToBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

// v2 links: the whole idea as deflated JSON, prefixed "z". Falls back to the compact v1 format.
export async function encodeShare(idea) {
  if (typeof CompressionStream === 'undefined') return encodeShareV1(idea);
  const {id, updated, ...rest} = idea;
  const packed = await pipe(new TextEncoder().encode(JSON.stringify(rest)), new CompressionStream('deflate-raw'));
  return `z${bytesToB64(packed)}`;
}

export async function decodeShare(str) {
  if (str.startsWith('z')) {
    try {
      const json = new TextDecoder().decode(await pipe(b64ToBytes(str.slice(1)), new DecompressionStream('deflate-raw')));
      return normalize({...JSON.parse(json), id: newId()});
    } catch {
      return null;
    }
  }
  return decodeShareV1(str);
}

function encodeShareV1(idea) {
  const packed = {
    n: idea.name,
    p: idea.pitch || undefined,
    i: idea.icp || undefined,
    s: CRITERIA.map((c) => idea.scores[c.id] || 0).join(''),
    e: CRITERIA.map((c) => (idea.evidence[c.id] ? 1 : 0)).join(''),
    o: Object.keys(idea.notes).length ? idea.notes : undefined,
    c: idea.concerns || undefined,
    f: FORCES.map((f) => idea.forces?.[f.id] || 0).join(''),
    fn: Object.keys(idea.forceNotes || {}).length ? idea.forceNotes : undefined,
    k: Object.keys(idea.c3 || {}).length ? idea.c3 : undefined,
    m: Object.fromEntries(Object.entries(idea.market || {}).filter(([k, v]) => v !== '' && v !== BLANK_MARKET[k])),
  };
  return b64encode(JSON.stringify(packed));
}

function decodeShareV1(str) {
  try {
    const p = JSON.parse(b64decode(str));
    const scores = {};
    const evidence = {};
    CRITERIA.forEach((c, i) => {
      const v = Number(p.s?.[i]);
      if (v >= 1 && v <= 5) scores[c.id] = v;
      if (p.e?.[i] === '1') evidence[c.id] = true;
    });
    const forces = {};
    FORCES.forEach((f, i) => {
      const v = Number(p.f?.[i]);
      if (v >= 1 && v <= 5) forces[f.id] = v;
    });
    return normalize({name: p.n, pitch: p.p, icp: p.i, concerns: p.c, notes: p.o, scores, evidence, forces,
      forceNotes: p.fn, c3: p.k, market: {...BLANK_MARKET, ...(p.m || {})}, id: newId()});
  } catch {
    return null;
  }
}

// --- Markdown report
export function toMarkdown(idea, r) {
  const L = [];
  L.push(`# ${idea.name}`, '');
  if (idea.pitch) L.push(`**Pitch:** ${idea.pitch}`, '');
  if (idea.icp) L.push(`**Ideal customer:** ${idea.icp}`, '');
  L.push(`**Overall:** ${fmt(r.overall)} / 5 · **Verdict:** ${r.verdict ? r.verdict.label : 'Not enough scores yet'}`);
  L.push(`**Coverage:** ${r.scoredCount}/${r.total} scored · **Evidence-backed:** ${Math.round(r.confidence * 100)}%`, '');
  r.warnings.forEach((w) => L.push(`> ⚠️ ${w}`));
  if (r.warnings.length) L.push('');
  L.push('## Perspectives', '', '| Lens | Score | Covered |', '|---|---|---|');
  r.lenses.forEach((l) => L.push(`| ${l.icon} ${l.title} | ${fmt(l.score)} | ${Math.round(l.coverage * 100)}% |`));
  L.push('');
  for (const s of SECTIONS) {
    const ss = r.sections.find((x) => x.id === s.id);
    L.push(`## ${s.id}. ${s.title}: ${fmt(ss.score)}`, '', '| Criterion | Score | Evidence | Note |', '|---|---|---|---|');
    for (const c of s.criteria) {
      const note = (idea.notes[c.id] || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      L.push(`| ${c.label}${c.critical ? ' ★' : ''} | ${idea.scores[c.id] || '–'} | ${idea.evidence[c.id] ? '✔' : ''} | ${note} |`);
    }
    L.push('');
  }
  if (r.redFlags.length) {
    L.push('## Red flags', '');
    r.redFlags.forEach((c) => L.push(`- **${c.label}** scored ${idea.scores[c.id]}`));
    L.push('');
  }
  if (r.validateNext.length) {
    L.push('## Validate next', '');
    r.validateNext.forEach((c) => L.push(`- **${c.label}** (${c.reason}): ${c.test}`));
    L.push('');
  }
  const ms = marketSizing(idea.market);
  if (ms.tam != null || ms.sam != null || ms.som != null) {
    const cur = idea.market.currency;
    L.push('## Market size (TAM / SAM / SOM)', '', '| Layer | Annual value | Customers |', '|---|---|---|');
    L.push(`| TAM | ${money(ms.tam, cur)} | ${count(ms.accounts.tam)} |`);
    L.push(`| SAM | ${money(ms.sam, cur)} | ${count(ms.accounts.sam)} |`);
    L.push(`| SOM | ${money(ms.som, cur)} | ${count(ms.accounts.som)} |`);
    if (ms.goal) L.push(`| Revenue goal | ${money(ms.goal, cur)} | ${count(ms.goalCheck?.customersNeeded)} |`);
    L.push('');
    if (idea.market.source) L.push(`_Sources / assumptions:_ ${idea.market.source}`, '');
  }
  const fs = forcesSummary(idea.forces, idea.scores);
  if (fs.rated) {
    L.push(`## Porter's Five Forces: industry attractiveness ${fmt(fs.attractiveness)} / 5 (${attractivenessLabel(fs.attractiveness)})`, '',
      '| Force | Intensity (1 weak – 5 strong) | Note |', '|---|---|---|');
    fs.items.forEach((f) => L.push(`| ${f.title} | ${f.intensity || '–'} | ${(idea.forceNotes?.[f.id] || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`));
    L.push('');
  }
  const cs = threeC(idea.scores);
  L.push('## 3C analysis', '');
  cs.forEach((c) => {
    L.push(`### ${c.title}: ${fmt(c.score)}`, '');
    if (idea.c3?.[c.id]) L.push(idea.c3[c.id], '');
  });
  if (idea.personas?.length) {
    L.push('## Personas', '');
    for (const p of idea.personas) {
      L.push(`### ${p.avatar} ${p.name}${p.primary ? ' (primary)' : ''}`, '');
      const facts = [p.role, p.age && `age ${p.age}`, p.location, p.budget && `budget ${p.budget}`].filter(Boolean).join(' · ');
      if (facts) L.push(facts, '');
      if (p.quote) L.push(`> “${p.quote}”`, '');
      if (p.bio) L.push(p.bio, '');
      if (p.roles.length) L.push(`**Buying role:** ${p.roles.map((id) => BUYING_ROLES.find((r) => r.id === id).label).join(', ')}`, '');
      for (const [k, t] of [['goals', 'Goals'], ['frustrations', 'Frustrations'], ['jobs', 'Jobs to be done'], ['tools', 'Tools & behaviours'], ['channels', 'Where to reach them']]) {
        const xs = lines(p[k]);
        if (xs.length) L.push(`**${t}:**`, ...xs.map((x) => `- ${x}`), '');
      }
      const tr = TRAITS.filter((t) => p.traits[t.id]).map((t) => `${t.left} ${'▮'.repeat(p.traits[t.id])}${'▯'.repeat(5 - p.traits[t.id])} ${t.right}`);
      if (tr.length) L.push(...tr.map((x) => `- ${x}`), '');
      L.push(`_Based on ${p.interviews || 0} interview(s)._`, '');
    }
  }
  const v = idea.vpc;
  if (v && [v.jobs, v.pains, v.gains, v.products, v.relievers, v.creators].some((x) => x.length)) {
    const fit = vpcFit(v);
    const seg = idea.personas?.find((p) => p.id === v.personaId);
    L.push(`## Value Proposition Canvas${seg ? `: ${seg.name}` : ''}`, '', `**Fit:** ${fit.fit == null ? '–' : `${Math.round(fit.fit * 100)}%`} of pain/gain weight addressed · **Great-VP checklist:** ${fit.great}/10`, '');
    const list = (title, xs, wl) => {
      if (!xs.length) return;
      L.push(`**${title}**`, ...xs.map((x) => `- ${x.text}${x.weight ? ` _(${wl} ${x.weight})_` : ''}`), '');
    };
    list('Customer jobs', [...v.jobs].sort((a, b) => b.weight - a.weight), 'importance');
    list('Pains', [...v.pains].sort((a, b) => b.weight - a.weight), 'severity');
    list('Gains', [...v.gains].sort((a, b) => b.weight - a.weight), 'relevance');
    list('Products & services', v.products);
    const byId = Object.fromEntries([...v.pains, ...v.gains].map((x) => [x.id, x.text]));
    list('Pain relievers', v.relievers.map((x) => ({text: `${x.text}${x.targets.length ? ` → ${x.targets.map((t) => byId[t]).join('; ')}` : ''}`})));
    list('Gain creators', v.creators.map((x) => ({text: `${x.text}${x.targets.length ? ` → ${x.targets.map((t) => byId[t]).join('; ')}` : ''}`})));
    if (fit.pains.gaps.length || fit.gains.gaps.length) list('Gaps (not addressed)', [...fit.pains.gaps, ...fit.gains.gaps]);
    if (v.adlibs.length) L.push('**Value proposition statements**', ...v.adlibs.map((a) => `- ${a.fav ? '⭐ ' : ''}${adlibText(a)}`), '');
    if (v.tests.length) {
      L.push('**Test cards**', '', '| Hypothesis | Test | Metric | Pass if | Status | Learning |', '|---|---|---|---|---|---|');
      const c = (x) => (x || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      v.tests.forEach((t) => L.push(`| ${c(t.hypothesis)} | ${c(t.test)} | ${c(t.metric)} | ${c(t.criteria)} | ${TEST_STATUS.find((x) => x.id === t.status).label} | ${c(t.learning)} |`));
      L.push('');
    }
  }
  const bs = idea.bmc ? bmcSummary(idea.bmc) : null;
  if (bs && bs.notes) {
    L.push(`## Business Model Canvas (${bs.filled}/9 blocks · ${Math.round(bs.validatedPct * 100)}% validated)`, '');
    for (const b of BMC_BLOCKS) {
      const notes = idea.bmc[b.id].filter((n) => n.text.trim());
      if (!notes.length) continue;
      L.push(`**${b.icon} ${b.title}**`, ...notes.map((n) => {
        const extra = b.money ? ` _(${b.types.find((t) => t.id === n.type)?.label}${n.amount ? `, ${money(Number(n.amount), idea.market.currency)}/mo` : ''})_` : '';
        return `- ${n.validated ? '✓ ' : ''}${n.text}${extra}`;
      }), '');
    }
    if (bs.hasMoney) L.push(`Monthly revenue ${money(bs.revenue, idea.market.currency)} − costs ${money(bs.costs, idea.market.currency)} = ${bs.profit < 0 ? '−' : ''}${money(Math.abs(bs.profit), idea.market.currency)}`, '');
  }
  if (idea.concerns) L.push('## Additional concerns, assumptions, or observations', '', idea.concerns, '');
  L.push('_★ = critical criterion · scale 1 = very weak · 3 = uncertain/average · 5 = very strong_');
  return L.join('\n');
}

export function download(filename, text, type = 'text/plain') {
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slug = (s) => (s || 'idea').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'idea';
