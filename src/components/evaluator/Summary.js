import React, {useState} from 'react';
import RadarChart from './RadarChart.js';
import LensPanel from './LensPanel.js';
import {fmt, toneFor} from '../../lib/scoring.js';

function Meter({label, value, hint}) {
  const pct = Math.round(value * 100);
  return (
    <div className="ie-meter" title={hint}>
      <div className="ie-meter-top"><span>{label}</span><b>{pct}%</b></div>
      <div className="ie-bar"><div className="ie-bar-fill t-neutral" style={{width: `${pct}%`}} /></div>
    </div>
  );
}

export default function Summary({r, scores}) {
  const [view, setView] = useState('sections');
  const axes = view === 'sections'
    ? r.sections.map((s) => ({label: s.title, short: `${s.id} · ${s.title.split(' ')[0]}`}))
    : r.lenses.map((l) => ({label: l.title, short: `${l.icon} ${l.title.split(' ')[0]}`}));
  const values = view === 'sections' ? r.sections.map((s) => s.score) : r.lenses.map((l) => l.score);

  return (
    <div className="ie-summary">
      <div className="ie-card ie-score-card">
        <div className="ie-overall">
          <div className={`ie-overall-num t-${toneFor(r.overall)}`}>{fmt(r.overall)}<small>/5</small></div>
          <div>
            <div className="ie-small">Overall score</div>
            {r.verdict ? (
              <div className={`ie-verdict t-${r.verdict.tone}`}>
                {r.verdict.label}{r.verdict.provisional && <span className="ie-prov"> (provisional)</span>}
              </div>
            ) : (
              <div className="ie-verdict t-none">Score at least 5 criteria to get a verdict</div>
            )}
          </div>
        </div>
        <Meter label={`Coverage · ${r.scoredCount}/${r.total}`} value={r.coverage} hint="Share of criteria you have scored" />
        <Meter label="Evidence-backed" value={r.confidence} hint="Share of your scores ticked as backed by evidence" />
        {r.warnings.map((w) => <div key={w} className="ie-warn">⚠️ {w}</div>)}
      </div>

      <div className="ie-card">
        <div className="ie-card-head">
          <h3>Shape of the idea</h3>
          <div className="ie-seg" role="tablist">
            <button type="button" className={view === 'sections' ? 'on' : ''} onClick={() => setView('sections')}>Sections</button>
            <button type="button" className={view === 'lenses' ? 'on' : ''} onClick={() => setView('lenses')}>Perspectives</button>
          </div>
        </div>
        <RadarChart axes={axes} series={[{name: 'This idea', values, color: 'var(--ifm-color-primary)'}]} />
      </div>

      <div className="ie-card">
        <h3>Perspectives</h3>
        <p className="ie-small">The same scores, re-weighted for the question each stakeholder would ask.</p>
        <LensPanel lenses={r.lenses} />
      </div>

      <div className="ie-card">
        <h3>🚩 Red flags</h3>
        {r.redFlags.length ? (
          <ul className="ie-list">
            {r.redFlags.map((c) => (
              <li key={c.id}>
                <a href={`#section-${c.section}`}><b>{c.label}</b></a> scored <b>{scores[c.id]}</b>
                {c.critical && <span className="ie-crit">critical</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="ie-small">No criterion scored 1–2 yet.</p>
        )}
      </div>

      <div className="ie-card">
        <h3>🧪 Validate next</h3>
        {r.validateNext.length ? (
          <ol className="ie-list ie-next">
            {r.validateNext.map((c) => (
              <li key={c.id}>
                <div><b>{c.label}</b> <span className={`ie-reason r-${c.reason.split(' ')[0].toLowerCase()}`}>{c.reason}</span></div>
                <div className="ie-small">{c.test}</div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="ie-small">Everything is scored and evidence-backed. Go build.</p>
        )}
      </div>
    </div>
  );
}
