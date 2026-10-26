import React from 'react';
import {INTENSITY} from '../../data/frameworks.js';
import {forcesSummary, attractivenessLabel} from '../../lib/frameworks.js';
import {fmt, toneFor} from '../../lib/scoring.js';

const HEAT = {1: '#16a34a', 2: '#65a30d', 3: '#ca8a04', 4: '#ea580c', 5: '#dc2626'};

// Classic Porter layout: rivalry in the centre, the other four forces pressing in.
export function FiveForcesDiagram({summary}) {
  const by = Object.fromEntries(summary.items.map((f) => [f.id, f]));
  const W = 760;
  const H = 520;
  const bw = 210;
  const bh = 96;
  const boxes = {
    entrants: {x: W / 2 - bw / 2, y: 12},
    substitutes: {x: W / 2 - bw / 2, y: H - bh - 12},
    suppliers: {x: 12, y: H / 2 - bh / 2},
    buyers: {x: W - bw - 12, y: H / 2 - bh / 2},
    rivalry: {x: W / 2 - 125, y: H / 2 - 70, w: 250, h: 140},
  };
  const centre = boxes.rivalry;
  const arrows = {
    entrants: [W / 2, 12 + bh, W / 2, centre.y],
    substitutes: [W / 2, H - bh - 12, W / 2, centre.y + centre.h],
    suppliers: [12 + bw, H / 2, centre.x, H / 2],
    buyers: [W - bw - 12, H / 2, centre.x + centre.w, H / 2],
  };

  return (
    <svg className="ie-forces" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Porter's Five Forces: ${summary.items.map((f) => `${f.title} ${f.intensity ?? 'not rated'}`).join(', ')}`}>
      <defs>
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <marker key={v} id={`ie-arrow-${v}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={HEAT[v] || 'var(--ie-muted)'} />
          </marker>
        ))}
      </defs>
      {Object.entries(arrows).map(([id, [x1, y1, x2, y2]]) => {
        const v = by[id].intensity || 0;
        return (
          <line key={id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={HEAT[v] || 'var(--ie-border)'}
            strokeWidth={v ? 2 + v * 1.6 : 2} strokeDasharray={v ? '' : '6 5'} markerEnd={`url(#ie-arrow-${v})`} />
        );
      })}
      {Object.entries(boxes).map(([id, b]) => {
        const f = by[id];
        const w = b.w || bw;
        const h = b.h || bh;
        const color = HEAT[f.intensity];
        return (
          <g key={id}>
            <rect x={b.x} y={b.y} width={w} height={h} rx={14} className="ie-force-box"
              style={color ? {stroke: color, fill: color, fillOpacity: 0.14} : undefined} />
            <text x={b.x + w / 2} y={b.y + h / 2 - (id === 'rivalry' ? 22 : 14)} textAnchor="middle" className="ie-force-title">
              {f.icon} {f.title}
            </text>
            <text x={b.x + w / 2} y={b.y + h / 2 + (id === 'rivalry' ? 14 : 14)} textAnchor="middle" className="ie-force-val" style={color ? {fill: color} : undefined}>
              {f.intensity ? `${f.intensity}/5 · ${INTENSITY[f.intensity - 1].label.replace(' force', '')}` : 'not rated'}
            </text>
            {id === 'rivalry' && (
              <text x={b.x + w / 2} y={b.y + h / 2 + 44} textAnchor="middle" className="ie-force-attr">
                Attractiveness {fmt(summary.attractiveness)}/5
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function FiveForces({idea, update}) {
  const summary = forcesSummary(idea.forces, idea.scores);
  const setForce = (id, v) => update((d) => {
    const forces = {...d.forces};
    if (v == null) delete forces[id];
    else forces[id] = v;
    return {forces};
  });
  const setNote = (id, v) => update((d) => ({forceNotes: {...d.forceNotes, [id]: v}}));
  const useSuggestions = () => update((d) => {
    const forces = {...d.forces};
    summary.items.forEach((f) => {
      if (f.suggested && !forces[f.id]) forces[f.id] = f.suggested;
    });
    return {forces};
  });
  const hasSuggestions = summary.items.some((f) => f.suggested && !f.intensity);

  return (
    <>
      <div className="ie-card">
        <div className="ie-card-head">
          <div>
            <h2 className="ie-h2">Porter's Five Forces</h2>
            <p className="ie-small ie-m0">
              Rate how <b>strong</b> each force is in your industry: <b>1 = weak</b> (good for you) to <b>5 = strong</b> (squeezes your profits).
              Together they show how attractive the industry is, whatever your product.
            </p>
          </div>
          <div className="ie-attr">
            <div className={`ie-overall-num t-${toneFor(summary.attractiveness)}`}>{fmt(summary.attractiveness)}<small>/5</small></div>
            <div className="ie-small">{attractivenessLabel(summary.attractiveness)}</div>
          </div>
        </div>
        <FiveForcesDiagram summary={summary} />
        {hasSuggestions && (
          <div className="ie-suggest no-print">
            💡 Your scorecard already implies values for some forces.
            <button type="button" className="ie-btn" onClick={useSuggestions}>Fill unrated forces from scorecard</button>
          </div>
        )}
        {summary.strongest.length > 0 && (
          <div className="ie-warn">⚠️ Strongest pressure: {summary.strongest.map((f) => f.title).join(', ')}. Your strategy must neutralise this.</div>
        )}
      </div>

      <div className="ie-grid-2">
        {summary.items.map((f) => (
          <div key={f.id} className="ie-card ie-force-card">
            <div className="ie-row-title">{f.icon} {f.title}</div>
            <div className="ie-row-q">{f.question}</div>
            <div className="ie-scale ie-scale-wide" role="radiogroup" aria-label={`${f.title} intensity`}>
              {INTENSITY.map((s) => (
                <button key={s.v} type="button" role="radio" aria-checked={f.intensity === s.v} title={`${s.v} = ${s.label}`}
                  className={`ie-dot f${s.v}${f.intensity === s.v ? ' on' : ''}`}
                  onClick={() => setForce(f.id, f.intensity === s.v ? null : s.v)}>{s.v}</button>
              ))}
              <button type="button" className={`ie-unk${!f.intensity ? ' on' : ''}`} onClick={() => setForce(f.id, null)} aria-label="Not rated">?</button>
            </div>
            <div className="ie-small ie-scale-caption"><span>weak force · good for you</span><span>strong force · bad for you</span></div>
            {f.suggested && (
              <div className="ie-small">Scorecard suggests <b>{f.suggested}</b>
                {f.intensity !== f.suggested && <button type="button" className="ie-link" onClick={() => setForce(f.id, f.suggested)}> · use it</button>}
              </div>
            )}
            <details className="ie-drivers">
              <summary className="ie-small">What makes this force strong?</summary>
              <ul>{f.drivers.map((d) => <li key={d}>{d}</li>)}</ul>
            </details>
            <textarea className="ie-input ie-note" rows={2} value={idea.forceNotes?.[f.id] || ''}
              placeholder="Evidence: who, how many, examples…" onChange={(e) => setNote(f.id, e.target.value)} />
          </div>
        ))}
      </div>
    </>
  );
}
