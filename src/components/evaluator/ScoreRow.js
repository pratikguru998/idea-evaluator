import React, {useState} from 'react';
import {SCALE} from '../../data/criteria.js';

export default function ScoreRow({c, score, evidence, note, onScore, onEvidence, onNote}) {
  const [open, setOpen] = useState(Boolean(note));
  const [showTip, setShowTip] = useState(false);
  return (
    <div className={`ie-row${score ? ' scored' : ''}`}>
      <div className="ie-row-head">
        <div className="ie-row-text">
          <div className="ie-row-title">
            {c.label}
            {c.critical && <span className="ie-crit" title="Critical: a score of 1–2 here is a knockout">critical</span>}
          </div>
          <div className="ie-row-q">{c.question}</div>
          <button type="button" className="ie-link" onClick={() => setShowTip(!showTip)} aria-expanded={showTip}>
            {showTip ? 'Hide guidance' : 'What does a 5 look like? How to test it?'}
          </button>
          {showTip && (
            <div className="ie-tip">
              <div><b>5 =</b> {c.high}</div>
              <div><b>Test it:</b> {c.test}</div>
            </div>
          )}
        </div>
        <div className="ie-row-ctl">
          <div className="ie-scale" role="radiogroup" aria-label={`${c.label} score`}>
            {SCALE.map((s) => (
              <button key={s.v} type="button" role="radio" aria-checked={score === s.v}
                title={`${s.v} = ${s.label}`}
                className={`ie-dot s${s.v}${score === s.v ? ' on' : ''}`}
                onClick={() => onScore(score === s.v ? null : s.v)}>
                {s.v}
              </button>
            ))}
            <button type="button" className={`ie-unk${!score ? ' on' : ''}`} title="Unknown: leave unscored"
              onClick={() => onScore(null)} aria-label="Mark as unknown">?</button>
          </div>
          <div className="ie-row-tools">
            <label className={`ie-ev${evidence ? ' on' : ''}${!score ? ' disabled' : ''}`}
              title="Tick when this score is backed by real evidence (interviews, data, payments), not a hunch">
              <input type="checkbox" checked={Boolean(evidence)} disabled={!score} onChange={(e) => onEvidence(e.target.checked)} />
              evidence
            </label>
            <button type="button" className={`ie-link${note ? ' has' : ''}`} onClick={() => setOpen(!open)}>
              {note ? '📝 note' : '+ note'}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <textarea className="ie-input ie-note" rows={2} value={note || ''} placeholder="Evidence, sources, assumptions…"
          onChange={(e) => onNote(e.target.value)} />
      )}
    </div>
  );
}
