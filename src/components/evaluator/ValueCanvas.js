import React, {useState} from 'react';
import {PROFILE, VALUE_MAP, GREAT_VP, FIT_STAGES, TEST_STATUS} from '../../data/vpc.js';
import {uid, vpcFit, adlibText} from '../../lib/vpc.js';

const pct = (v) => (v == null ? '–' : `${Math.round(v * 100)}%`);
const tone = (v) => (v == null ? 'none' : v >= 0.8 ? 'good' : v >= 0.6 ? 'ok' : v >= 0.4 ? 'warn' : 'bad');
const byWeight = (xs) => [...xs].filter((x) => x.text.trim()).sort((a, b) => b.weight - a.weight);

// ---------- The canvas picture: value map (square) ⇄ customer profile (circle) ----------
function Zone({x, y, w, h, title, items, addressed, empty}) {
  return (
    <foreignObject x={x} y={y} width={w} height={h}>
      <div className="ie-zone" xmlns="http://www.w3.org/1999/xhtml">
        <div className="ie-zone-title">{title}</div>
        {items.length ? (
          <ul>
            {items.slice(0, 6).map((it) => (
              <li key={it.id} className={addressed ? (addressed.has(it.id) ? 'hit' : 'miss') : ''}>
                {it.weight != null && <b className={`w${it.weight}`}>{it.weight}</b>}
                {it.text}
              </li>
            ))}
            {items.length > 6 && <li className="more">+{items.length - 6} more</li>}
          </ul>
        ) : (
          <div className="ie-zone-empty">{empty}</div>
        )}
      </div>
    </foreignObject>
  );
}

export function CanvasDiagram({v, segment}) {
  const hitPains = new Set(v.relievers.flatMap((r) => r.targets));
  const hitGains = new Set(v.creators.flatMap((c) => c.targets));
  const cx = 770;
  const cy = 260;
  const r = 235;
  const ray = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const [ax, ay] = ray(-60);
  const [bx, by] = ray(60);
  const named = (xs) => xs.filter((x) => x.text.trim());
  return (
    <svg className="ie-vpc" viewBox="0 0 1020 520" role="img" aria-label="Value Proposition Canvas">
      {/* Value map */}
      <rect x="20" y="25" width="470" height="470" rx="6" className="ie-vpc-shape" />
      <line x1="20" y1="25" x2="255" y2="260" className="ie-vpc-div" />
      <line x1="20" y1="495" x2="255" y2="260" className="ie-vpc-div" />
      <line x1="255" y1="260" x2="490" y2="260" className="ie-vpc-div" />
      <text x="255" y="275" textAnchor="middle" className="ie-vpc-icon">🎁</text>
      <Zone x={205} y={34} w={278} h={196} title="🚀 Gain creators" items={named(v.creators)} empty="How do you create the gains?" />
      <Zone x={205} y={290} w={278} h={198} title="💊 Pain relievers" items={named(v.relievers)} empty="How do you relieve the pains?" />
      <Zone x={28} y={150} w={150} h={220} title="🎁 Products & services" items={named(v.products)} empty="What do you offer?" />
      <text x="255" y="18" textAnchor="middle" className="ie-vpc-label">VALUE MAP</text>

      {/* Fit arrows */}
      <text x="512" y="250" textAnchor="middle" className="ie-vpc-fit">⇄</text>
      <text x="512" y="278" textAnchor="middle" className="ie-vpc-fitlabel">FIT</text>

      {/* Customer profile */}
      <circle cx={cx} cy={cy} r={r} className="ie-vpc-shape" />
      <line x1={cx} y1={cy} x2={ax} y2={ay} className="ie-vpc-div" />
      <line x1={cx} y1={cy} x2={bx} y2={by} className="ie-vpc-div" />
      <line x1={cx} y1={cy} x2={cx - r} y2={cy} className="ie-vpc-div" />
      <text x={cx + 8} y={cy + 14} textAnchor="middle" className="ie-vpc-icon">🙂</text>
      <Zone x={600} y={92} w={168} h={160} title="🌟 Gains" items={byWeight(v.gains)} addressed={hitGains} empty="What outcomes do they want?" />
      <Zone x={600} y={272} w={168} h={160} title="😣 Pains" items={byWeight(v.pains)} addressed={hitPains} empty="What annoys or blocks them?" />
      <Zone x={826} y={150} w={146} h={220} title="🧰 Jobs" items={byWeight(v.jobs)} empty="What are they trying to get done?" />
      <text x={cx} y="18" textAnchor="middle" className="ie-vpc-label">CUSTOMER PROFILE{segment ? ` · ${segment.avatar} ${segment.name}` : ''}</text>
    </svg>
  );
}

// ---------- Editable list for one block of the canvas ----------
function Weight({value, onChange, label}) {
  return (
    <div className="ie-weight" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} title={`${label} ${n}`}
          className={`w${n}${value >= n ? ' on' : ''}`} onClick={() => onChange(n)} />
      ))}
    </div>
  );
}

function ItemList({block, items, onChange, targets, targetLabel}) {
  const [showTriggers, setShowTriggers] = useState(false);
  const set = (id, patch) => onChange(items.map((x) => (x.id === id ? {...x, ...patch} : x)));
  const add = () => onChange([...items, {id: uid(), text: '', ...(block.types ? {type: block.types[0].id} : {}), ...(block.weightLabel ? {weight: 3} : {}), ...(targets ? {targets: []} : {})}]);
  return (
    <div className="ie-card ie-block">
      <div className="ie-card-head">
        <h3>{block.icon} {block.title}</h3>
        <span className="ie-small">{items.length}</span>
      </div>
      <p className="ie-small ie-m0">{block.help}</p>
      {block.triggers && (
        <>
          <button type="button" className="ie-link" onClick={() => setShowTriggers(!showTriggers)}>{showTriggers ? 'Hide' : 'Show'} trigger questions</button>
          {showTriggers && <ul className="ie-prompts ie-triggers">{block.triggers.map((t) => <li key={t}>{t}</li>)}</ul>}
        </>
      )}
      <div className="ie-items">
        {items.map((it) => (
          <div key={it.id} className="ie-item">
            <div className="ie-item-row">
              <input className="ie-input" value={it.text} placeholder="Describe it concretely…" onChange={(e) => set(it.id, {text: e.target.value})} />
              <button type="button" className="ie-x" aria-label="Remove" onClick={() => onChange(items.filter((x) => x.id !== it.id))}>✕</button>
            </div>
            {(block.types || block.weightLabel) && (
              <div className="ie-item-meta">
                {block.types && (
                  <select className="ie-input ie-select ie-select-xs" value={it.type} onChange={(e) => set(it.id, {type: e.target.value})} aria-label="Type">
                    {block.types.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                )}
                {block.weightLabel && (
                  <span className="ie-weight-wrap">
                    <span className="ie-small">{block.weightLabel}</span>
                    <Weight value={it.weight} label={block.weightLabel} onChange={(w) => set(it.id, {weight: w})} />
                  </span>
                )}
              </div>
            )}
            {targets && (
              <div className="ie-targets">
                <span className="ie-small">{targetLabel}:</span>
                {targets.filter((t) => t.text.trim()).length ? targets.filter((t) => t.text.trim()).map((t) => {
                  const on = it.targets.includes(t.id);
                  return (
                    <button key={t.id} type="button" className={`ie-target${on ? ' on' : ''}`}
                      onClick={() => set(it.id, {targets: on ? it.targets.filter((x) => x !== t.id) : [...it.targets, t.id]})}>
                      {on ? '✓ ' : ''}{t.text}
                    </button>
                  );
                }) : <span className="ie-small">add some first</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="ie-btn ie-add" onClick={add}>＋ Add</button>
    </div>
  );
}

// ---------- Fit matrix ----------
function Matrix({rows, cols, toggle, rowLabel, colLabel}) {
  const r = byWeight(rows);
  const c = cols.filter((x) => x.text.trim());
  if (!r.length || !c.length) return <p className="ie-small">Add {rowLabel.toLowerCase()} and {colLabel.toLowerCase()} to see the matrix.</p>;
  return (
    <div className="ie-table-wrap">
      <table className="ie-table ie-matrix">
        <thead>
          <tr><th>{rowLabel} ↓ · {colLabel} →</th>{c.map((x) => <th key={x.id} title={x.text}><span>{x.text}</span></th>)}</tr>
        </thead>
        <tbody>
          {r.map((row) => {
            const hit = c.some((x) => x.targets.includes(row.id));
            return (
              <tr key={row.id} className={hit ? 'hit' : 'miss'}>
                <th><b className={`ie-wbadge w${row.weight}`}>{row.weight}</b> {row.text}</th>
                {c.map((x) => {
                  const on = x.targets.includes(row.id);
                  return (
                    <td key={x.id}>
                      <button type="button" className={`ie-cell${on ? ' on' : ''}`} aria-pressed={on} aria-label={`${x.text} addresses ${row.text}`}
                        onClick={() => toggle(x.id, row.id)}>{on ? '✓' : ''}</button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Main tab ----------
export default function ValueCanvas({idea, update}) {
  const v = idea.vpc;
  const fit = vpcFit(v);
  const segment = idea.personas.find((p) => p.id === v.personaId);
  const setV = (patch) => update((d) => ({vpc: {...d.vpc, ...(typeof patch === 'function' ? patch(d.vpc) : patch)}}));
  const setList = (key) => (items) => setV((cur) => {
    const next = {[key]: items};
    // Removing a pain/gain also unlinks it from relievers/creators.
    if (key === 'pains' || key === 'gains') {
      const ids = new Set(items.map((x) => x.id));
      const linkKey = key === 'pains' ? 'relievers' : 'creators';
      next[linkKey] = cur[linkKey].map((x) => ({...x, targets: x.targets.filter((t) => ids.has(t))}));
    }
    return next;
  });
  const toggleLink = (linkKey) => (sourceId, targetId) => setV((cur) => ({
    [linkKey]: cur[linkKey].map((x) => (x.id !== sourceId ? x : {
      ...x, targets: x.targets.includes(targetId) ? x.targets.filter((t) => t !== targetId) : [...x.targets, targetId],
    })),
  }));

  const newAdlib = () => {
    const top = (xs) => byWeight(xs)[0]?.text || '';
    const a = {
      id: uid(), fav: false,
      product: v.products.find((p) => p.text.trim())?.text || idea.name,
      segment: segment ? segment.role || segment.name : idea.icp,
      job: top(v.jobs), verb1: 'eliminating', pain: top(v.pains), verb2: 'enabling', gain: top(v.gains), competitor: '',
    };
    setV((cur) => ({adlibs: [...cur.adlibs, a]}));
  };
  const setAdlib = (id, patch) => setV((cur) => ({adlibs: cur.adlibs.map((a) => (a.id === id ? {...a, ...patch} : a))}));

  const newTest = (seed = {}) => setV((cur) => ({tests: [...cur.tests, {id: uid(), hypothesis: '', test: '', metric: '', criteria: '', learning: '', status: 'planned', ...seed}]}));
  const setTest = (id, patch) => setV((cur) => ({tests: cur.tests.map((t) => (t.id === id ? {...t, ...patch} : t))}));
  const who = segment?.name || 'our customers';
  const gapTests = [...fit.pains.gaps.slice(0, 2).map((p) => ({
    hypothesis: `We believe ${who} experience “${p.text}” as a severe pain (${p.weight}/5).`,
    test: 'Run 10 problem interviews and ask for the last time it happened.',
    metric: 'Share of interviewees who mention it unprompted',
    criteria: 'At least 6 of 10 mention it without prompting',
  })), ...fit.gains.gaps.slice(0, 1).map((g) => ({
    hypothesis: `We believe ${who} would value “${g.text}”.`,
    test: 'Landing page with this gain as the headline, plus a sign-up button.',
    metric: 'Visitor → sign-up conversion',
    criteria: 'At least 10% sign up',
  }))];

  return (
    <>
      <div className="ie-card">
        <div className="ie-card-head">
          <div>
            <h2 className="ie-h2">Value Proposition Canvas</h2>
            <p className="ie-small ie-m0">
              Right: the <b>customer profile</b> (jobs, pains, gains) of one segment. Left: your <b>value map</b> (products, pain relievers, gain creators).
              You have <b>fit</b> when your relievers and creators match the pains and gains that matter most. Based on the canvas from <i>Value Proposition Design</i> (Osterwalder et al., 2014).
            </p>
          </div>
          <label className="ie-field ie-seg-pick">
            <span>Customer segment</span>
            <select className="ie-input ie-select" value={v.personaId} onChange={(e) => setV({personaId: e.target.value})}>
              <option value="">{idea.personas.length ? '— choose a persona —' : 'No personas yet'}</option>
              {idea.personas.map((p) => <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>)}
            </select>
          </label>
        </div>
        <div className="ie-kpis">
          <div className="ie-kpi"><span className="ie-small">Overall fit</span><b className={`t-${tone(fit.fit)}`}>{pct(fit.fit)}</b><span className="ie-kpi-sub">of pain + gain weight addressed</span></div>
          <div className="ie-kpi"><span className="ie-small">Pains relieved</span><b className={`t-${tone(fit.pains.fit)}`}>{pct(fit.pains.fit)}</b><span className="ie-kpi-sub">{fit.pains.topCovered}/{fit.pains.top} extreme pains covered</span></div>
          <div className="ie-kpi"><span className="ie-small">Gains created</span><b className={`t-${tone(fit.gains.fit)}`}>{pct(fit.gains.fit)}</b><span className="ie-kpi-sub">{fit.gains.topCovered}/{fit.gains.top} essential gains covered</span></div>
          <div className="ie-kpi"><span className="ie-small">Great-VP checklist</span><b className={`t-${tone(fit.great / 10)}`}>{fit.great}<small>/10</small></b><span className="ie-kpi-sub">characteristics met</span></div>
        </div>
        {fit.suggestedScore && (
          <div className="ie-suggest">
            This fit suggests a <b>Value proposition</b> score of <b>{fit.suggestedScore}</b>.
            {idea.scores.value !== fit.suggestedScore
              ? <button type="button" className="ie-btn no-print" onClick={() => update((d) => ({scores: {...d.scores, value: fit.suggestedScore}}))}>Apply to scorecard (currently {idea.scores.value ?? '?'})</button>
              : <span className="ie-small">✓ matches your scorecard</span>}
          </div>
        )}
        <CanvasDiagram v={v} segment={segment} />
        <div className="ie-legend ie-vpc-legend">
          <span><span className="ie-dotkey hit" /> pain/gain addressed by your value map</span>
          <span><span className="ie-dotkey miss" /> not addressed yet</span>
          <span>numbers = severity / relevance / importance (1–5)</span>
        </div>
        {fit.warnings.map((w) => <div key={w} className="ie-warn">⚠️ {w}</div>)}
      </div>

      <h3 className="ie-band">🙂 Customer profile: observe the customer</h3>
      <div className="ie-grid-3">
        <ItemList block={PROFILE.jobs} items={v.jobs} onChange={setList('jobs')} />
        <ItemList block={PROFILE.pains} items={v.pains} onChange={setList('pains')} />
        <ItemList block={PROFILE.gains} items={v.gains} onChange={setList('gains')} />
      </div>

      <h3 className="ie-band">🎁 Value map: design the value</h3>
      <div className="ie-grid-3">
        <ItemList block={VALUE_MAP.products} items={v.products} onChange={setList('products')} />
        <ItemList block={VALUE_MAP.relievers} items={v.relievers} onChange={setList('relievers')} targets={v.pains} targetLabel="Relieves" />
        <ItemList block={VALUE_MAP.creators} items={v.creators} onChange={setList('creators')} targets={v.gains} targetLabel="Creates" />
      </div>

      <div className="ie-card">
        <h3>🔗 Fit matrix</h3>
        <p className="ie-small">Click a cell to link a reliever or creator to the pain or gain it addresses. Rows are sorted by severity or relevance. Red rows are gaps.</p>
        <div className="ie-matrices">
          <div><h4>Pains × pain relievers</h4><Matrix rows={v.pains} cols={v.relievers} toggle={toggleLink('relievers')} rowLabel="Pains" colLabel="Relievers" /></div>
          <div><h4>Gains × gain creators</h4><Matrix rows={v.gains} cols={v.creators} toggle={toggleLink('creators')} rowLabel="Gains" colLabel="Creators" /></div>
        </div>
      </div>

      <div className="ie-card">
        <div className="ie-card-head">
          <h3>✍️ Value proposition statements (ad-libs)</h3>
          <button type="button" className="ie-btn ie-btn-primary" onClick={newAdlib} disabled={v.adlibs.length >= 10}>＋ New statement from canvas</button>
        </div>
        <p className="ie-small">Fill in the blanks to write 3–5 alternative one-sentence value propositions, then ⭐ the strongest. Each new statement is pre-filled from your top-ranked items.</p>
        {v.adlibs.map((a) => (
          <div key={a.id} className={`ie-adlib${a.fav ? ' fav' : ''}`}>
            <p className="ie-adlib-text">{adlibText(a)}</p>
            <div className="ie-adlib-fields">
              {[['product', 'Our…'], ['segment', 'help…'], ['job', 'who want to…'], ['verb1', 'by (verb)'], ['pain', 'pain'], ['verb2', 'and (verb)'], ['gain', 'gain'], ['competitor', 'unlike… (optional)']].map(([k, ph]) => (
                <label key={k}><span>{ph}</span><input className="ie-input" value={a[k]} onChange={(e) => setAdlib(a.id, {[k]: e.target.value})} /></label>
              ))}
            </div>
            <div className="ie-row-tools">
              <button type="button" className="ie-link" onClick={() => setAdlib(a.id, {fav: !a.fav})}>{a.fav ? '★ Favourite' : '☆ Mark as favourite'}</button>
              {a.fav && idea.pitch !== adlibText(a) && <button type="button" className="ie-link" onClick={() => update({pitch: adlibText(a).slice(0, 500)})}>Use as idea pitch</button>}
              <button type="button" className="ie-link" onClick={() => setV((cur) => ({adlibs: cur.adlibs.filter((x) => x.id !== a.id)}))}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="ie-grid-2">
        <div className="ie-card">
          <h3>🏆 10 characteristics of a great value proposition</h3>
          <p className="ie-small">Tick the ones your value proposition honestly meets.</p>
          <ol className="ie-check">
            {GREAT_VP.map((g, i) => {
              const on = v.great.includes(i);
              return (
                <li key={g}>
                  <label className={on ? 'on' : ''}>
                    <input type="checkbox" checked={on} onChange={() => setV((cur) => ({great: on ? cur.great.filter((x) => x !== i) : [...cur.great, i]}))} />
                    {g}
                  </label>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="ie-card">
          <h3>🧭 Where are you on the path to fit?</h3>
          <div className="ie-stages">
            {FIT_STAGES.map((s, i) => {
              const st = v.stages[s.id] || {done: false, note: ''};
              return (
                <div key={s.id} className={`ie-stage${st.done ? ' done' : ''}`}>
                  <label className="ie-stage-head">
                    <input type="checkbox" checked={st.done} onChange={() => setV((cur) => ({stages: {...cur.stages, [s.id]: {...st, done: !st.done}}}))} />
                    <span className="ie-stage-n">{i + 1}</span> <b>{s.title}</b>
                  </label>
                  <div className="ie-small">{s.desc}</div>
                  <input className="ie-input" value={st.note} placeholder="Evidence so far…"
                    onChange={(e) => setV((cur) => ({stages: {...cur.stages, [s.id]: {...st, note: e.target.value}}}))} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ie-card">
        <div className="ie-card-head">
          <h3>🧪 Test cards</h3>
          <button type="button" className="ie-btn ie-btn-primary" onClick={() => newTest()}>＋ Blank test card</button>
        </div>
        <p className="ie-small">Turn your riskiest assumptions into experiments: what you believe, how you'll check it, what you'll measure, and what result proves you right.</p>
        {gapTests.length > 0 && (
          <div className="ie-suggest ie-suggest-left">
            💡 Suggested from canvas gaps:
            {gapTests.map((t) => (
              <button key={t.hypothesis} type="button" className="ie-btn" onClick={() => newTest(t)}>{t.hypothesis.slice(0, 60)}…</button>
            ))}
          </div>
        )}
        <div className="ie-tests">
          {v.tests.map((t) => (
            <div key={t.id} className={`ie-test s-${t.status}`}>
              <div className="ie-test-head">
                <select className="ie-input ie-select ie-select-xs" value={t.status} onChange={(e) => setTest(t.id, {status: e.target.value})}>
                  {TEST_STATUS.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>
                <button type="button" className="ie-x" aria-label="Delete test card" onClick={() => setV((cur) => ({tests: cur.tests.filter((x) => x.id !== t.id)}))}>✕</button>
              </div>
              {[['hypothesis', 'We believe that…'], ['test', 'To verify that, we will…'], ['metric', 'And measure…'], ['criteria', 'We are right if…'], ['learning', 'We learned… (after the test)']].map(([k, label]) => (
                <label key={k} className="ie-test-field">
                  <span>{label}</span>
                  <textarea className="ie-input" rows={2} value={t[k]} onChange={(e) => setTest(t.id, {[k]: e.target.value})} />
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
