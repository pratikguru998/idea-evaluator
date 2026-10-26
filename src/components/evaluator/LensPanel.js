import React from 'react';
import {fmt, toneFor} from '../../lib/scoring.js';

export default function LensPanel({lenses}) {
  return (
    <div className="ie-lenses">
      {lenses.map((l) => (
        <div key={l.id} className="ie-lens">
          <div className="ie-lens-head">
            <span className="ie-lens-title">{l.icon} {l.title}</span>
            <span className={`ie-badge t-${toneFor(l.score)}`}>{fmt(l.score)}</span>
          </div>
          <div className="ie-bar" aria-hidden="true">
            <div className={`ie-bar-fill t-${toneFor(l.score)}`} style={{width: `${l.score ? (l.score / 5) * 100 : 0}%`}} />
          </div>
          <div className="ie-lens-asks">{l.asks}</div>
          <div className="ie-small">
            {Math.round(l.coverage * 100)}% of this lens scored
            {l.strongest.length > 0 && <> · <span className="ie-up">▲ {l.strongest.map((d) => d.label).join(', ')}</span></>}
            {l.weakest.length > 0 && <> · <span className="ie-down">▼ {l.weakest.map((d) => d.label).join(', ')}</span></>}
          </div>
        </div>
      ))}
    </div>
  );
}
