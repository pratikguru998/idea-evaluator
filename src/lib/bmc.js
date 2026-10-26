// Pure helpers for the Business Model Canvas.
import {BMC_BLOCKS, NOTE_COLORS} from '../data/bmc.js';
import {lines, adlibText, uid} from './vpc.js';
import {marketSizing, money} from './frameworks.js';

export const blankBmc = () => Object.fromEntries(BMC_BLOCKS.map((b) => [b.id, []]));

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const colors = NOTE_COLORS.map((c) => c.id);

export function normalizeBmc(raw = {}) {
  const out = blankBmc();
  for (const b of BMC_BLOCKS) {
    const types = (b.types || []).map((t) => t.id);
    out[b.id] = (Array.isArray(raw[b.id]) ? raw[b.id].slice(0, 40) : []).map((n) => {
      const note = {
        id: typeof n?.id === 'string' && /^[a-z0-9]{1,16}$/i.test(n.id) ? n.id : uid(),
        text: str(n?.text, 400),
        color: colors.includes(n?.color) ? n.color : colors[0],
        validated: Boolean(n?.validated),
      };
      if (b.money) {
        const amt = Number(n?.amount);
        note.amount = Number.isFinite(amt) && amt >= 0 ? String(amt) : '';
        note.type = types.includes(n?.type) ? n.type : types[0];
      }
      return note;
    });
  }
  return out;
}

export function bmcSummary(bmc) {
  const filled = BMC_BLOCKS.filter((b) => bmc[b.id].some((n) => n.text.trim()));
  const notes = BMC_BLOCKS.flatMap((b) => bmc[b.id].filter((n) => n.text.trim()));
  const validated = notes.filter((n) => n.validated).length;
  const sum = (id) => bmc[id].reduce((a, n) => a + (Number(n.amount) || 0), 0);
  const revenue = sum('rev');
  const costs = sum('cost');
  const fixed = bmc.cost.filter((n) => n.type === 'fixed').reduce((a, n) => a + (Number(n.amount) || 0), 0);
  const hasMoney = revenue > 0 || costs > 0;
  const empty = BMC_BLOCKS.filter((b) => !filled.includes(b));
  const warnings = [];
  if (empty.length && empty.length < 9) warnings.push(`Empty blocks: ${empty.map((b) => b.title).join(', ')}.`);
  if (bmc.cs.filter((n) => n.text.trim()).length > 1 && bmc.vp.filter((n) => n.text.trim()).length < 2) warnings.push('Several customer segments but only one value proposition. Does each segment really want the same thing?');
  if (filled.length >= 7 && notes.length && validated / notes.length < 0.3) warnings.push('Most of the model is untested assumptions. Mark notes ✓ once you have evidence.');
  if (hasMoney && revenue < costs) warnings.push(`Monthly costs exceed revenue by ${Math.round(costs - revenue).toLocaleString('en-US')}. What volume makes it break even?`);
  return {
    filled: filled.length, notes: notes.length, validated,
    validatedPct: notes.length ? validated / notes.length : 0,
    revenue, costs, fixed, profit: revenue - costs, hasMoney, warnings,
  };
}

// Pull what other tabs already know into the canvas, skipping duplicates.
export function prefillFromIdea(idea) {
  const bmc = {...idea.bmc};
  let added = 0;
  const push = (block, texts, extra = {}) => {
    const seen = new Set(bmc[block].map((n) => n.text.trim().toLowerCase()));
    const fresh = texts.map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase()))
      .map((text) => ({id: uid(), text: text.slice(0, 400), color: 'yellow', validated: false, ...extra}));
    bmc[block] = [...bmc[block], ...fresh];
    added += fresh.length;
  };
  const personas = idea.personas || [];
  push('cs', personas.length ? personas.map((p) => `${p.avatar} ${p.name}${p.role ? `: ${p.role}` : ''}`) : [idea.icp || '']);
  const v = idea.vpc;
  const fav = v?.adlibs?.find((a) => a.fav) || v?.adlibs?.[0];
  push('vp', fav ? [adlibText(fav)] : [idea.pitch || '']);
  push('ch', personas.flatMap((p) => lines(p.channels)).slice(0, 6));
  push('kr', (v?.products || []).map((p) => p.text).slice(0, 4));
  const ms = marketSizing(idea.market);
  if (ms.price) push('rev', [`Main revenue: about ${money(ms.price, idea.market.currency)} per customer per year`], {amount: '', type: 'subscription'});
  return {bmc, added};
}
