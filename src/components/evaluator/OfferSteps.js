import React from 'react';
import {CROWD, CORE_MARKETS, DRIVERS, STAGES, PROBLEM_DRIVERS, ATTENTION, EFFORT_LEVEL, MEDIUM, CHEAT_CODES} from '../../data/offer.js';
import {crowdScore, suggestCrowd, valueEquation, stackSummary, quadrant, QUADRANTS, prefillProblems, howTo} from '../../lib/offer.js';
import {uid, lines} from '../../lib/vpc.js';
import {money, symbolFor} from '../../lib/frameworks.js';

export const useOffer = (update) => (patch) =>
  update((d) => ({offer: {...d.offer, ...(typeof patch === 'function' ? patch(d.offer) : patch)}}));

function Scale10({value, onChange, label, invert}) {
  return (
    <div className="ie-scale10" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const good = invert ? 11 - n : n;
        return (
          <button key={n} type="button" role="radio" aria-checked={value === n}
            className={`${value === n ? 'on ' : ''}g${good >= 8 ? 'hi' : good >= 5 ? 'mid' : 'lo'}`}
            onClick={() => onChange(value === n ? null : n)}>{n}</button>
        );
      })}
    </div>
  );
}

export function StepIntro({title, children}) {
  return (
    <div className="ie-card ie-step-intro">
      <h2 className="ie-h2">{title}</h2>
      <div className="ie-small">{children}</div>
    </div>
  );
}

// ---------- 1. Starving crowd & pricing ----------
export function OfferMarket({idea, update}) {
  const o = idea.offer;
  const setO = useOffer(update);
  const cs = crowdScore(o);
  const suggested = suggestCrowd(idea.scores);
  const canSuggest = CROWD.some((c) => suggested[c.id] && !o.crowd[c.id]);
  const price = Number(o.price) || 0;
  const comp = Number(o.competitorPrice) || 0;
  const cur = idea.market.currency;
  const primary = idea.personas.find((p) => p.primary) || idea.personas[0];
  return (
    <>
      <StepIntro title="Step 1 · Find a starving crowd">
        The market matters more than the offer, and the offer matters more than your persuasion skills. Rate the market on four indicators (1–10).
        Then niche down: the narrower the avatar, the more you can charge. <i>After Hormozi, $100M Offers.</i>
      </StepIntro>
      <div className="ie-grid-2">
        <div className="ie-card">
          <div className="ie-card-head">
            <h3>🍖 Market indicators</h3>
            {canSuggest && <button type="button" className="ie-btn" onClick={() => setO((cur) => ({crowd: {...suggested, ...cur.crowd}}))}>✨ Fill from scorecard</button>}
          </div>
          {CROWD.map((c) => (
            <div key={c.id} className="ie-crowd-row">
              <div><b>{c.icon} {c.title}</b> <span className="ie-small">{c.q}</span></div>
              <Scale10 value={o.crowd[c.id]} label={c.title} onChange={(v) => setO((cur) => {
                const crowd = {...cur.crowd};
                if (v == null) delete crowd[c.id];
                else crowd[c.id] = v;
                return {crowd};
              })} />
              {suggested[c.id] && o.crowd[c.id] !== suggested[c.id] && <span className="ie-small">Scorecard implies ≈ {suggested[c.id]}</span>}
            </div>
          ))}
        </div>
        <div className="ie-card">
          <div className="ie-gauge">
            <div className={`ie-overall-num t-${cs.tone}`}>{cs.total}<small>/40</small></div>
            <div><b className={`t-${cs.tone}`}>{cs.label}</b>
              {cs.weakest && cs.rated === 4 && <div className="ie-small">Weakest indicator: {cs.weakest.title}</div>}
            </div>
          </div>
          <div className="ie-bar ie-bar-lg"><div className={`ie-bar-fill t-${cs.tone}`} style={{width: `${(cs.total / 40) * 100}%`}} /></div>
          <h3 className="ie-mt">🎯 Niche down</h3>
          <div className="ie-picks">
            {CORE_MARKETS.map((m) => (
              <button key={m.id} type="button" className={`ie-pick${o.core === m.id ? ' on' : ''}`} onClick={() => setO({core: o.core === m.id ? '' : m.id})}>{m.label}</button>
            ))}
          </div>
          <label className="ie-field">
            <span>Your niche (core market → sub-market → specific avatar)</span>
            <input className="ie-input" value={o.niche} onChange={(e) => setO({niche: e.target.value})}
              placeholder={primary ? `e.g. Wealth → freelancers → ${primary.role || primary.name}` : 'e.g. Wealth → freelancers → solo brand designers'} />
          </label>
        </div>
      </div>
      <div className="ie-card">
        <h3>💲 Charge what it’s worth</h3>
        <p className="ie-small">If you compete on price you become a commodity. Raise the price and make the offer so valuable that the comparison stops making sense. Higher prices fund better delivery, which gets better results, which justifies the price.</p>
        <div className="ie-form-grid">
          <label className="ie-field"><span>Your offer price</span><div className="ie-affix"><em>{symbolFor(cur)}</em><input className="ie-input" inputMode="decimal" value={o.price} onChange={(e) => setO({price: e.target.value.replace(/[^0-9.]/g, '')})} placeholder="e.g. 997" /></div></label>
          <label className="ie-field"><span>Typical competitor price</span><div className="ie-affix"><em>{symbolFor(cur)}</em><input className="ie-input" inputMode="decimal" value={o.competitorPrice} onChange={(e) => setO({competitorPrice: e.target.value.replace(/[^0-9.]/g, '')})} placeholder="e.g. 199" /></div></label>
        </div>
        {price > 0 && comp > 0 && (
          <div className={`ie-goal t-${price >= comp * 2 ? 'good' : price >= comp ? 'ok' : 'bad'}`}>
            <div>You charge <b>{(price / comp).toFixed(1)}×</b> the market price ({money(price, cur)} vs {money(comp, cur)}).</div>
            <div className="ie-small">{price < comp ? 'You are cheaper than competitors, which is a race to the bottom. Add value and raise the price instead.' : price >= comp * 2 ? 'Premium positioning. Make sure the stack makes the price look like a steal.' : 'At market price. What would justify charging 2–10× more?'}</div>
          </div>
        )}
      </div>
    </>
  );
}

// ---------- 2. Value equation ----------
export function OfferValue({idea, update}) {
  const o = idea.offer;
  const setO = useOffer(update);
  const ve = valueEquation(o);
  const goals = [...(idea.vpc?.gains || []).filter((g) => g.text.trim()).sort((a, b) => b.weight - a.weight).map((g) => g.text), ...idea.personas.flatMap((p) => lines(p.goals))].slice(0, 4);
  const box = (id) => {
    const d = DRIVERS.find((x) => x.id === id);
    return <div className={`ie-ve-box ${d.side}`}>{d.icon} {d.title}<b>{o.ve[id] ?? '?'}</b></div>;
  };
  return (
    <>
      <StepIntro title="Step 2 · Maximise the value equation">
        People pay for perceived value. Push the <b>top</b> of the equation up (a bigger dream outcome, more certainty it will work) and the <b>bottom</b> down (less waiting, less effort and sacrifice).
        The bottom is where most of the leverage is.
      </StepIntro>
      <div className="ie-card">
        <label className="ie-field ie-m0">
          <span>🌈 The dream outcome, in the customer’s words</span>
          <textarea className="ie-input" rows={2} value={o.dream} onChange={(e) => setO({dream: e.target.value})}
            placeholder="e.g. Never panic about taxes again: know exactly what you owe, every day, in 10 minutes a month." />
        </label>
        {goals.length > 0 && (
          <div className="ie-suggest ie-suggest-left">From your canvas and personas:
            {goals.map((g) => <button key={g} type="button" className="ie-btn" onClick={() => setO({dream: g})}>{g.slice(0, 60)}</button>)}
          </div>
        )}
      </div>
      <div className="ie-grid-2">
        <div className="ie-card">
          {DRIVERS.map((d) => (
            <div key={d.id} className="ie-crowd-row">
              <div><b>{d.icon} {d.title}</b> <span className={`ie-chip ${d.side === 'up' ? 't-good' : 't-bad'}`}>{d.side === 'up' ? '↑ raise' : '↓ lower'}</span></div>
              <Scale10 value={o.ve[d.id]} label={d.title} invert={d.side === 'down'} onChange={(v) => setO((cur) => {
                const next = {...cur.ve};
                if (v == null) delete next[d.id];
                else next[d.id] = v;
                return {ve: next};
              })} />
              <div className="ie-scale-caption ie-small"><span>1 · {d.low}</span><span>10 · {d.high}</span></div>
              <div className="ie-small">💡 {d.tip}</div>
            </div>
          ))}
        </div>
        <div className="ie-card ie-ve">
          <h3>Perceived value</h3>
          <div className="ie-ve-frac">
            <div className="ie-ve-row">{box('outcome')}<span>×</span>{box('likelihood')}</div>
            <div className="ie-ve-line" />
            <div className="ie-ve-row">{box('time')}<span>×</span>{box('effort')}</div>
          </div>
          {ve.value != null ? (
            <>
              <div className="ie-gauge">
                <div className={`ie-overall-num t-${ve.score >= 7 ? 'good' : ve.score >= 5 ? 'ok' : ve.score >= 3 ? 'warn' : 'bad'}`}>{ve.score.toFixed(1)}<small>/10</small></div>
                <div className="ie-small">Raw ratio {ve.value >= 10 ? ve.value.toFixed(0) : ve.value.toFixed(2)}, shown on a log scale (1 = balanced).</div>
              </div>
              <div className="ie-bar ie-bar-lg"><div className="ie-bar-fill t-neutral" style={{width: `${ve.score * 10}%`}} /></div>
              <div className="ie-goal t-ok ie-mt"><div><b>Biggest lever right now: {ve.weakest.icon} {ve.weakest.title}</b></div><div className="ie-small">{ve.weakest.tip}</div></div>
            </>
          ) : <p className="ie-small">Rate all four drivers to calculate perceived value.</p>}
        </div>
      </div>
    </>
  );
}

// ---------- 3. Problems → solutions ----------
export function OfferProblems({idea, update, setNotice}) {
  const o = idea.offer;
  const setO = useOffer(update);
  const set = (id, patch) => setO((cur) => ({problems: cur.problems.map((p) => (p.id === id ? {...p, ...patch} : p))}));
  const counts = Object.fromEntries(PROBLEM_DRIVERS.map((d) => [d.id, o.problems.filter((p) => p.driver === d.id && p.text.trim()).length]));
  const importProblems = () => {
    const fresh = prefillProblems(idea);
    setO((cur) => ({problems: [...cur.problems, ...fresh]}));
    setNotice?.(fresh.length ? `Imported ${fresh.length} problem(s) from your Value Proposition Canvas pains and persona frustrations.` : 'No new pains or frustrations to import.');
  };
  return (
    <>
      <StepIntro title="Step 3 · List every problem, then flip each into a solution">
        Walk through what happens <b>before, during and after</b> they buy. List every obstacle and doubt that could stop them getting the dream outcome.
        Tag each with the value driver it attacks, then rewrite it as a <b>“How to…”</b> solution.
      </StepIntro>
      <div className="ie-card">
        <div className="ie-card-head">
          <div className="ie-picks">
            {PROBLEM_DRIVERS.map((d) => <span key={d.id} className={`ie-chip ${counts[d.id] ? 't-good' : 't-bad'}`}>{d.icon} {d.label}: <b>{counts[d.id]}</b></span>)}
          </div>
          <div className="ie-row-tools">
            <button type="button" className="ie-btn" onClick={importProblems}>✨ Import pains from canvas</button>
            <button type="button" className="ie-btn ie-btn-primary" onClick={() => setO((cur) => ({problems: [...cur.problems, {id: uid(), text: '', solution: '', stage: 'during', driver: 'effort'}]}))}>＋ Problem</button>
          </div>
        </div>
        <div className="ie-problems">
          {o.problems.map((p, i) => (
            <div key={p.id} className="ie-problem">
              <span className="ie-problem-n">{i + 1}</span>
              <div className="ie-problem-body">
                <div className="ie-item-row">
                  <input className="ie-input" value={p.text} placeholder="Problem or doubt, e.g. “I don’t have time to track receipts”" onChange={(e) => set(p.id, {text: e.target.value})} />
                  <button type="button" className="ie-x" aria-label="Remove problem" onClick={() => setO((cur) => ({
                    problems: cur.problems.filter((x) => x.id !== p.id),
                    vehicles: cur.vehicles.map((v) => (v.problemId === p.id ? {...v, problemId: ''} : v)),
                  }))}>✕</button>
                </div>
                <div className="ie-item-meta">
                  <select className="ie-input ie-select ie-select-xs" value={p.stage} onChange={(e) => set(p.id, {stage: e.target.value})} aria-label="When">
                    {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select className="ie-input ie-select ie-select-xs" value={p.driver} onChange={(e) => set(p.id, {driver: e.target.value})} aria-label="Value driver">
                    {PROBLEM_DRIVERS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
                  </select>
                </div>
                <div className="ie-item-row">
                  <span className="ie-arrow">→</span>
                  <input className="ie-input ie-solution" value={p.solution} placeholder="Solution: How to…" onChange={(e) => set(p.id, {solution: e.target.value})} />
                  {!p.solution && p.text.trim() && <button type="button" className="ie-btn" onClick={() => set(p.id, {solution: howTo(p)})}>✨ How-to</button>}
                </div>
              </div>
            </div>
          ))}
          {!o.problems.length && <div className="ie-empty">No problems yet. Import them from your canvas, or add the first one.</div>}
        </div>
      </div>
    </>
  );
}

// ---------- 4. Delivery vehicles ----------
const blankVehicle = (problemId) => ({id: uid(), text: '', problemId, attention: 'many', effort: 'dwy', medium: 'recorded', value: 3, cost: 3, include: false, worth: ''});

function VehicleRow({v, onChange, onDelete}) {
  return (
    <div className="ie-item">
      <div className="ie-item-row">
        <input className="ie-input" value={v.text} placeholder="What exactly you deliver, e.g. “Weekly 15-min review call”" onChange={(e) => onChange({text: e.target.value})} />
        <button type="button" className="ie-x" aria-label="Remove" onClick={onDelete}>✕</button>
      </div>
      <div className="ie-item-meta ie-item-meta-left">
        {[[ATTENTION, 'attention'], [EFFORT_LEVEL, 'effort'], [MEDIUM, 'medium']].map(([opts, k]) => (
          <select key={k} className="ie-input ie-select ie-select-xs" value={v[k]} onChange={(e) => onChange({[k]: e.target.value})} aria-label={k}>
            {opts.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        ))}
      </div>
    </div>
  );
}

export function OfferDelivery({idea, update}) {
  const o = idea.offer;
  const setO = useOffer(update);
  const setV = (id, patch) => setO((cur) => ({vehicles: cur.vehicles.map((v) => (v.id === id ? {...v, ...patch} : v))}));
  const del = (id) => setO((cur) => ({vehicles: cur.vehicles.filter((v) => v.id !== id)}));
  const add = (problemId) => setO((cur) => ({vehicles: [...cur.vehicles, blankVehicle(problemId)]}));
  const probs = o.problems.filter((p) => p.text.trim());
  const loose = o.vehicles.filter((v) => !v.problemId);
  return (
    <>
      <StepIntro title="Step 4 · Brainstorm delivery vehicles (“the how”)">
        For each solution, list <b>every</b> way you could deliver it. Think divergently here and don’t judge yet; you’ll trim in the next step.
        Vary the attention, effort and medium to get many options for the same solution.
      </StepIntro>
      <div className="ie-delivery-layout">
        <div>
          {probs.map((p) => {
            const vs = o.vehicles.filter((v) => v.problemId === p.id);
            return (
              <div key={p.id} className="ie-card">
                <div className="ie-card-head">
                  <div><div className="ie-small">Problem: {p.text}</div><h3 className="ie-m0">→ {p.solution || <span className="t-bad">No solution yet (step 3)</span>}</h3></div>
                  <button type="button" className="ie-btn" onClick={() => add(p.id)}>＋ Delivery idea</button>
                </div>
                <div className="ie-items">{vs.map((v) => <VehicleRow key={v.id} v={v} onChange={(patch) => setV(v.id, patch)} onDelete={() => del(v.id)} />)}</div>
                {!vs.length && <div className="ie-small">No delivery ideas yet.</div>}
              </div>
            );
          })}
          <div className="ie-card">
            <div className="ie-card-head"><h3>Other deliverables (not tied to one problem)</h3><button type="button" className="ie-btn" onClick={() => add('')}>＋ Add</button></div>
            <div className="ie-items">{loose.map((v) => <VehicleRow key={v.id} v={v} onChange={(patch) => setV(v.id, patch)} onDelete={() => del(v.id)} />)}</div>
          </div>
        </div>
        <aside className="ie-card ie-cheats">
          <h3>🎮 Cheat codes</h3>
          <ol className="ie-prompts">{CHEAT_CODES.map((c) => <li key={c}>{c}</li>)}</ol>
          <div className="ie-small"><b>{o.vehicles.length}</b> delivery ideas so far. Aim for 2–5 per problem.</div>
        </aside>
      </div>
    </>
  );
}

// ---------- 5. Trim & stack ----------
function Scatter({vehicles, onPick}) {
  const W = 420;
  const H = 360;
  const pad = 44;
  const gw = W - pad * 2;
  const gh = H - pad * 2;
  // Each 1–5 rating gets its own cell; dots sit in the cell centre.
  const x = (c) => pad + ((c - 0.5) / 5) * gw;
  const y = (v) => H - pad - ((v - 0.5) / 5) * gh;
  // Dividers match the quadrant rules: cost ≤ 2 is "low", value ≥ 4 is "high".
  const xs = pad + (2 / 5) * gw;
  const ys = pad + (2 / 5) * gh;
  const seen = {};
  return (
    <svg className="ie-scatter" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Value versus cost matrix">
      <rect x={pad} y={pad} width={xs - pad} height={ys - pad} className="q-gold" />
      <rect x={xs} y={pad} width={W - pad - xs} height={ys - pad} className="q-premium" />
      <rect x={pad} y={ys} width={xs - pad} height={H - pad - ys} className="q-filler" />
      <rect x={xs} y={ys} width={W - pad - xs} height={H - pad - ys} className="q-cut" />
      <text x={pad + 6} y={pad + 14} className="ie-q-label">KEEP</text>
      <text x={W - pad - 6} y={pad + 14} textAnchor="end" className="ie-q-label">KEEP IF PROFITABLE</text>
      <text x={pad + 6} y={H - pad - 6} className="ie-q-label">OPTIONAL</text>
      <text x={W - pad - 6} y={H - pad - 6} textAnchor="end" className="ie-q-label">CUT</text>
      {[1, 2, 3, 4, 5].map((n) => (
        <g key={n}>
          <text x={x(n)} y={H - pad + 14} textAnchor="middle" className="ie-radar-tick">{n}</text>
          <text x={pad - 8} y={y(n) + 4} textAnchor="end" className="ie-radar-tick">{n}</text>
        </g>
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" className="ie-axis-label">Cost to you →</text>
      <text x={14} y={H / 2} textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`} className="ie-axis-label">Value to customer →</text>
      {vehicles.map((v, i) => {
        const key = `${v.cost}-${v.value}`;
        const k = (seen[key] = (seen[key] || 0) + 1) - 1;
        const [dx, dy] = [[0, 0], [20, 0], [-20, 0], [0, 20], [20, 20], [-20, 20]][k % 6];
        return (
          <g key={v.id} className={`ie-pt${v.include ? ' in' : ''}`} onClick={() => onPick(v.id)} style={{cursor: 'pointer'}}>
            <circle cx={x(v.cost) + dx} cy={y(v.value) + dy} r={10} />
            <text x={x(v.cost) + dx} y={y(v.value) + dy + 4} textAnchor="middle">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Dots({value, onChange, label}) {
  return (
    <div className="ie-weight" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} title={`${label} ${n}`} className={value >= n ? 'on' : ''} onClick={() => onChange(n)} />
      ))}
    </div>
  );
}

export function OfferStack({idea, update}) {
  const o = idea.offer;
  const setO = useOffer(update);
  const st = stackSummary(o);
  const cur = idea.market.currency;
  const vs = o.vehicles.filter((v) => v.text.trim());
  const setV = (id, patch) => setO((c) => ({vehicles: c.vehicles.map((v) => (v.id === id ? {...v, ...patch} : v))}));
  const autoTrim = () => setO((c) => ({vehicles: c.vehicles.map((v) => ({...v, include: v.text.trim() ? quadrant(v) === 'gold' || quadrant(v) === 'premium' : v.include}))}));
  return (
    <>
      <StepIntro title="Step 5 · Trim & stack">
        Rate each delivery idea on <b>value to the customer</b> (does it raise the outcome or certainty, or cut time or effort?) and <b>cost to you</b>.
        Cut high-cost, low-value items first, then low-cost, low-value ones. Keep the rest, put a believable price tag on each, and stack them into one offer.
      </StepIntro>
      <div className="ie-grid-2">
        <div className="ie-card">
          <div className="ie-card-head"><h3>Value × cost matrix</h3><button type="button" className="ie-btn" onClick={autoTrim}>✂️ Auto-trim (keep high value)</button></div>
          {vs.length ? <Scatter vehicles={vs} onPick={(id) => setV(id, {include: !vs.find((v) => v.id === id).include})} /> : <div className="ie-empty">Add delivery ideas in step 4 first.</div>}
          <div className="ie-small">Filled dots are in the stack. Click a dot to toggle it.</div>
        </div>
        <div className="ie-card">
          <h3>📦 The stack</h3>
          {st.items.length ? (
            <table className="ie-table ie-stack-table">
              <tbody>
                {st.items.map((v) => <tr key={v.id}><td>✅ {v.text}</td><td className="ie-num">{v.worth ? money(Number(v.worth), cur) : '—'}</td></tr>)}
                {o.bonuses.filter((b) => b.name.trim()).map((b) => <tr key={b.id} className="ie-bonus-row"><td>🎁 Bonus: {b.name}</td><td className="ie-num">{b.worth ? money(Number(b.worth), cur) : '—'}</td></tr>)}
                <tr className="ie-stack-total"><th>Total value</th><th className="ie-num">{money(st.total, cur)}</th></tr>
                {st.price > 0 && <tr><th>Your price</th><th className="ie-num">{money(st.price, cur)}</th></tr>}
              </tbody>
            </table>
          ) : <p className="ie-small">Nothing in the stack yet. Tick items below or use auto-trim.</p>}
          {st.ratio != null && (
            <div className={`ie-goal t-${st.ratio >= 10 ? 'good' : st.ratio >= 3 ? 'ok' : 'bad'}`}>
              <div>Value-to-price ratio: <b>{st.ratio.toFixed(1)}×</b></div>
              <div className="ie-small">{st.ratio >= 10 ? 'The price looks like a steal next to the value.' : 'Aim for 10×: add high-value, low-cost items or bonuses rather than discounting.'}</div>
            </div>
          )}
          {st.cuts.length > 0 && <div className="ie-warn">⚠️ The stack contains {st.cuts.length} low-value, high-cost item(s). Consider cutting them.</div>}
        </div>
      </div>
      <div className="ie-card">
        <h3>Rate & choose</h3>
        <div className="ie-table-wrap">
          <table className="ie-table ie-rate-table">
            <thead><tr><th>#</th><th>Delivery item</th><th>Value</th><th>Cost</th><th>Verdict</th><th>Perceived worth</th><th>In stack</th></tr></thead>
            <tbody>
              {vs.map((v, i) => {
                const q = QUADRANTS[quadrant(v)];
                return (
                  <tr key={v.id}>
                    <td>{i + 1}</td>
                    <td>{v.text}</td>
                    <td><Dots value={v.value} label="Value" onChange={(n) => setV(v.id, {value: n})} /></td>
                    <td><Dots value={v.cost} label="Cost" onChange={(n) => setV(v.id, {cost: n})} /></td>
                    <td><span className={`ie-chip t-${q.tone}`}>{q.label.split(':')[0]}</span></td>
                    <td><div className="ie-affix"><em>{symbolFor(cur)}</em><input className="ie-input ie-input-sm" inputMode="decimal" value={v.worth} placeholder="0" onChange={(e) => setV(v.id, {worth: e.target.value.replace(/[^0-9.]/g, '')})} /></div></td>
                    <td><input type="checkbox" checked={v.include} aria-label="Include in stack" onChange={() => setV(v.id, {include: !v.include})} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
