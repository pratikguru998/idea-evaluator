import React from 'react';
import {CRITERION_BY_ID} from '../../data/criteria.js';
import {threeC} from '../../lib/frameworks.js';
import {fmt, toneFor} from '../../lib/scoring.js';

// Three overlapping circles; the shared centre is where a strategy lives.
export function ThreeCDiagram({cs}) {
  const W = 640;
  const H = 520;
  const r = 165;
  const pos = {customers: [W / 2 - 105, 200], company: [W / 2 + 105, 200], competitors: [W / 2, 355]};
  const labelPos = {customers: [W / 2 - 175, 150], company: [W / 2 + 175, 150], competitors: [W / 2, 440]};
  return (
    <svg className="ie-threec" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`3C model: ${cs.map((c) => `${c.title} ${c.score == null ? 'unscored' : c.score.toFixed(1)}`).join(', ')}`}>
      {cs.map((c) => (
        <circle key={c.id} cx={pos[c.id][0]} cy={pos[c.id][1]} r={r}
          style={{fill: c.color, stroke: c.color, fillOpacity: c.score == null ? 0.06 : 0.07 + (c.score / 5) * 0.16}} className="ie-threec-circle" />
      ))}
      {cs.map((c) => (
        <g key={c.id}>
          <text x={labelPos[c.id][0]} y={labelPos[c.id][1]} textAnchor="middle" className="ie-threec-title">{c.icon} {c.title}</text>
          <text x={labelPos[c.id][0]} y={labelPos[c.id][1] + 34} textAnchor="middle" className="ie-threec-score" style={{fill: c.color}}>
            {fmt(c.score)}
          </text>
          <text x={labelPos[c.id][0]} y={labelPos[c.id][1] + 56} textAnchor="middle" className="ie-threec-asks">{c.asks}</text>
        </g>
      ))}
      <text x={W / 2} y={262} textAnchor="middle" className="ie-threec-centre">★ Your edge</text>
      <text x={W / 2} y={282} textAnchor="middle" className="ie-threec-asks">needs you meet better</text>
      <text x={W / 2} y={298} textAnchor="middle" className="ie-threec-asks">than rivals can</text>
    </svg>
  );
}

export default function ThreeC({idea, update}) {
  const cs = threeC(idea.scores);
  const weakest = cs.filter((c) => c.score != null).sort((a, b) => a.score - b.score)[0];
  return (
    <>
      <div className="ie-card">
        <h2 className="ie-h2">3C model: Customers · Company · Competitors</h2>
        <p className="ie-small">
          Kenichi Ohmae's 3C model: a strategy only works where <b>what customers need</b>, <b>what your company does well</b>,
          and <b>where competitors fall short</b> overlap. Scores come from the related scorecard criteria. Write your analysis in the boxes below.
        </p>
        <ThreeCDiagram cs={cs} />
        {weakest && weakest.score < 3.3 && (
          <div className="ie-warn">⚠️ Weakest C: <b>{weakest.title}</b> ({fmt(weakest.score)}). The overlap is only as strong as this circle.</div>
        )}
      </div>
      <div className="ie-grid-3">
        {cs.map((c) => (
          <div key={c.id} className="ie-card ie-c-card" style={{borderTop: `4px solid ${c.color}`}}>
            <div className="ie-card-head">
              <h3>{c.icon} {c.title}</h3>
              <span className={`ie-badge t-${toneFor(c.score)}`}>{fmt(c.score)}</span>
            </div>
            <ul className="ie-prompts">{c.prompts.map((p) => <li key={p}>{p}</li>)}</ul>
            <textarea className="ie-input" rows={6} value={idea.c3?.[c.id] || ''} placeholder={`Your ${c.title.toLowerCase()} analysis…`}
              onChange={(e) => update((d) => ({c3: {...d.c3, [c.id]: e.target.value}}))} />
            <div className="ie-c-crit">
              {c.criteria.map((id) => (
                <span key={id} className={`ie-chip t-${toneFor(idea.scores[id] ?? null)}`}>
                  {CRITERION_BY_ID[id].label} <b>{idea.scores[id] ?? '?'}</b>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
