import React from 'react';
import {CURRENCIES} from '../../data/frameworks.js';
import {marketSizing, money, count, symbolFor} from '../../lib/frameworks.js';

const LAYERS = [
  {key: 'tam', label: 'TAM', name: 'Total addressable market', color: '#6366f1', desc: 'Everyone who could ever buy this, worldwide.'},
  {key: 'sam', label: 'SAM', name: 'Serviceable available market', color: '#0ea5e9', desc: 'The part your product, geography and channels can actually serve.'},
  {key: 'som', label: 'SOM', name: 'Serviceable obtainable market', color: '#10b981', desc: 'What you can realistically win in 3–5 years.'},
];

// Nested circles with area proportional to value, bottom-aligned like the classic TAM/SAM/SOM picture.
export function MarketCircles({ms, currency}) {
  const W = 720;
  const H = 440;
  const R = 200;
  const cx = 230;
  const base = H - 20;
  const top = ms.tam || ms.sam || ms.som;
  if (!top) return <div className="ie-empty">Enter your numbers to draw the TAM / SAM / SOM chart.</div>;
  const rad = (v) => (v ? Math.max(8, R * Math.sqrt(v / top)) : 0);
  return (
    <svg className="ie-market" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Market size: TAM ${money(ms.tam, currency)}, SAM ${money(ms.sam, currency)}, SOM ${money(ms.som, currency)}`}>
      {LAYERS.map((l, i) => {
        const r = rad(ms[l.key]);
        if (!r) return null;
        const cy = base - r;
        const ly = 70 + i * 120;
        return (
          <g key={l.key}>
            <circle cx={cx} cy={cy} r={r} style={{fill: l.color, stroke: l.color}} className="ie-market-circle" />
            <line x1={cx + r * 0.71} y1={cy - r * 0.71} x2={470} y2={ly} className="ie-market-leader" style={{stroke: l.color}} />
            <circle cx={cx + r * 0.71} cy={cy - r * 0.71} r={4} style={{fill: l.color}} />
            <text x={480} y={ly - 8} className="ie-market-label" style={{fill: l.color}}>{l.label} · {money(ms[l.key], currency)}</text>
            <text x={480} y={ly + 16} className="ie-market-sub">{l.name}</text>
            {ms.accounts[l.key] != null && <text x={480} y={ly + 36} className="ie-market-sub">≈ {count(ms.accounts[l.key])} customers</text>}
          </g>
        );
      })}
    </svg>
  );
}

// Log-scale bars: keeps a tiny SOM and the revenue goal readable next to a huge TAM.
export function MarketBars({ms, currency}) {
  const rows = [...LAYERS.map((l) => ({label: l.label, v: ms[l.key], color: l.color})), {label: 'Goal', v: ms.goal, color: '#f59e0b'}].filter((r) => r.v);
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.v));
  const min = Math.min(...rows.map((r) => r.v));
  const lo = Math.log10(Math.max(1, min)) - 0.5;
  const hi = Math.log10(max);
  const pct = (v) => (hi - lo <= 0 ? 100 : Math.max(4, ((Math.log10(Math.max(1, v)) - lo) / (hi - lo)) * 100));
  return (
    <div className="ie-mbars">
      {rows.map((r) => (
        <div key={r.label} className="ie-mbar">
          <span className="ie-mbar-label">{r.label}</span>
          <div className="ie-mbar-track"><div className="ie-mbar-fill" style={{width: `${pct(r.v)}%`, background: r.color}} /></div>
          <span className="ie-mbar-val">{money(r.v, currency)}</span>
        </div>
      ))}
      <div className="ie-small">Log scale, so each step is roughly 10×.</div>
    </div>
  );
}

function Field({label, hint, suffix, prefix, value, onChange}) {
  return (
    <label className="ie-field">
      <span>{label}</span>
      <div className="ie-affix">
        {prefix && <em>{prefix}</em>}
        <input className="ie-input" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
        {suffix && <em>{suffix}</em>}
      </div>
      {hint && <small className="ie-small">{hint}</small>}
    </label>
  );
}

export default function MarketSizing({idea, update}) {
  const m = idea.market;
  const ms = marketSizing(m);
  const cur = m.currency;
  const sym = symbolFor(cur);
  const set = (k) => (v) => update((d) => ({market: {...d.market, [k]: v}}));
  const applyScore = () => update((d) => ({scores: {...d.scores, market: ms.suggestedScore}}));

  return (
    <>
      <div className="ie-card">
        <div className="ie-card-head">
          <div>
            <h2 className="ie-h2">Market size: TAM · SAM · SOM</h2>
            <p className="ie-small ie-m0">Investors trust a <b>bottom-up</b> estimate (number of customers × price) far more than a top-down “1% of a $50B market”.</p>
          </div>
          <div className="ie-row-tools">
            <div className="ie-seg">
              <button type="button" className={m.mode !== 'topdown' ? 'on' : ''} onClick={() => set('mode')('bottomup')}>Bottom-up</button>
              <button type="button" className={m.mode === 'topdown' ? 'on' : ''} onClick={() => set('mode')('topdown')}>Top-down</button>
            </div>
            <select className="ie-input ie-select ie-select-sm" value={cur} onChange={(e) => set('currency')(e.target.value)} aria-label="Currency">
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
            </select>
          </div>
        </div>

        <div className="ie-market-grid">
          <div className="ie-market-inputs">
            {m.mode === 'topdown' ? (
              <>
                <Field label="TAM: total annual market" prefix={sym} value={m.tam} onChange={set('tam')} hint="From an industry report or analyst estimate." />
                <Field label="SAM: the part you can serve" prefix={sym} value={m.sam} onChange={set('sam')} hint="Limit by geography, segment, language or channel." />
                <Field label="SOM: what you can win in 3–5 yrs" prefix={sym} value={m.som} onChange={set('som')} hint="Usually 1–5% of SAM for a startup." />
                <Field label="Price per customer per year (optional)" prefix={sym} value={m.price} onChange={set('price')} hint="Used to convert values into customer counts." />
              </>
            ) : (
              <>
                <Field label="Potential customers (TAM count)" value={m.accounts} onChange={set('accounts')} hint="Every person or business with this problem, e.g. 1,500,000 freelancers." />
                <Field label="Annual revenue per customer" prefix={sym} value={m.price} onChange={set('price')} hint="Price × purchases per year." />
                <Field label="Serviceable share (SAM)" suffix="% of TAM" value={m.samPct} onChange={set('samPct')} hint="The share your product, region and channels can reach." />
                <Field label="Obtainable share (SOM)" suffix="% of SAM" value={m.somPct} onChange={set('somPct')} hint="Realistic share in 3–5 years. Startups rarely exceed 1–5%." />
              </>
            )}
            <Field label="Your revenue goal (annual)" prefix={sym} value={m.goal} onChange={set('goal')} hint="e.g. 1,000,000 for a $1M ARR business." />
          </div>
          <div className="ie-market-chart">
            <MarketCircles ms={ms} currency={cur} />
            <MarketBars ms={ms} currency={cur} />
          </div>
        </div>

        {ms.warnings.map((w) => <div key={w} className="ie-warn">⚠️ {w}</div>)}

        {ms.goalCheck && (
          <div className={`ie-goal t-${ms.suggestedScore >= 4 ? 'good' : ms.suggestedScore === 3 ? 'ok' : 'bad'}`}>
            <div><b>Goal check:</b> your SOM is <b>{ms.goalCheck.ratio.toFixed(1)}×</b> your revenue goal.</div>
            {ms.goalCheck.customersNeeded != null && <div>You need about <b>{count(ms.goalCheck.customersNeeded)}</b> paying customers to hit {money(ms.goal, cur)}/yr.</div>}
            {ms.goalCheck.shareOfSam != null && <div>That is <b>{(ms.goalCheck.shareOfSam * 100).toFixed(ms.goalCheck.shareOfSam < 0.01 ? 2 : 1)}%</b> of your serviceable market.</div>}
            <div className="ie-goal-score">
              This suggests a <b>Market size</b> score of <b>{ms.suggestedScore}</b>
              {idea.scores.market !== ms.suggestedScore
                ? <button type="button" className="ie-btn no-print" onClick={applyScore}>Apply to scorecard (currently {idea.scores.market ?? '?'})</button>
                : <span className="ie-small"> ✓ matches your scorecard</span>}
            </div>
          </div>
        )}

        <label className="ie-field">
          <span>Sources and assumptions</span>
          <textarea className="ie-input" rows={3} value={m.source} onChange={(e) => set('source')(e.target.value)}
            placeholder="Where do these numbers come from? Census data, LinkedIn counts, competitor revenue, reports…" />
        </label>
      </div>
      <div className="ie-grid-3">
        {LAYERS.map((l) => (
          <div key={l.key} className="ie-card" style={{borderTop: `4px solid ${l.color}`}}>
            <h3>{l.label}: {money(ms[l.key], cur)}</h3>
            <div className="ie-small">{l.name}. {l.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}
