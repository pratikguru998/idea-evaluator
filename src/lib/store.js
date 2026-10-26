// Browser-only persistence, share links and export. Every storage access is
// wrapped in try/catch: private windows or blocked storage must not break the page.
import {CRITERIA, SECTIONS} from '../data/criteria.js';
import {fmt} from './scoring.js';

const KEY = 'idea-evaluator:v1';

export const newId = () => Math.random().toString(36).slice(2, 10);

export function blankIdea(name = 'Untitled idea') {
  return {id: newId(), name, pitch: '', icp: '', scores: {}, evidence: {}, notes: {}, concerns: '', updated: Date.now()};
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
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : base.id,
    name: str(raw.name, 120) || base.name,
    pitch: str(raw.pitch, 500),
    icp: str(raw.icp, 500),
    concerns: str(raw.concerns, 10000),
    scores,
    evidence,
    notes,
    updated: Number(raw.updated) || Date.now(),
  };
}

// --- Share links: the idea is packed into the URL hash, never sent to a server.
const b64encode = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64decode = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encodeShare(idea) {
  const packed = {
    n: idea.name,
    p: idea.pitch || undefined,
    i: idea.icp || undefined,
    s: CRITERIA.map((c) => idea.scores[c.id] || 0).join(''),
    e: CRITERIA.map((c) => (idea.evidence[c.id] ? 1 : 0)).join(''),
    o: Object.keys(idea.notes).length ? idea.notes : undefined,
    c: idea.concerns || undefined,
  };
  return b64encode(JSON.stringify(packed));
}

export function decodeShare(str) {
  try {
    const p = JSON.parse(b64decode(str));
    const scores = {};
    const evidence = {};
    CRITERIA.forEach((c, i) => {
      const v = Number(p.s?.[i]);
      if (v >= 1 && v <= 5) scores[c.id] = v;
      if (p.e?.[i] === '1') evidence[c.id] = true;
    });
    return normalize({name: p.n, pitch: p.p, icp: p.i, concerns: p.c, notes: p.o, scores, evidence, id: newId()});
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
