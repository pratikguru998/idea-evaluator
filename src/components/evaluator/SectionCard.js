import React, {useState} from 'react';
import ScoreRow from './ScoreRow.js';
import {fmt, toneFor} from '../../lib/scoring.js';

export default function SectionCard({section, summary, idea, update}) {
  const [open, setOpen] = useState(true);
  const set = (field, id, value) =>
    update((d) => {
      const next = {...d[field]};
      if (value == null || value === false || value === '') delete next[id];
      else next[id] = value;
      const patch = {[field]: next};
      // Clearing a score clears its evidence flag too.
      if (field === 'scores' && value == null) {
        const ev = {...d.evidence};
        delete ev[id];
        patch.evidence = ev;
      }
      return patch;
    });

  return (
    <section className="ie-card ie-section" id={`section-${section.id}`}>
      <button type="button" className="ie-section-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="ie-section-icon">{section.icon}</span>
        <span className="ie-section-titles">
          <span className="ie-section-title">{section.id}. {section.title}</span>
          <span className="ie-section-blurb">{section.blurb}</span>
        </span>
        <span className="ie-section-meta">
          <span className={`ie-badge t-${toneFor(summary.score)}`}>{fmt(summary.score)}</span>
          <span className="ie-small">{summary.scored}/{summary.total} scored</span>
        </span>
        <span className={`ie-chev${open ? ' open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="ie-section-body">
          {section.criteria.map((c) => (
            <ScoreRow key={c.id} c={c}
              score={idea.scores[c.id]} evidence={idea.evidence[c.id]} note={idea.notes[c.id]}
              onScore={(v) => set('scores', c.id, v)}
              onEvidence={(v) => set('evidence', c.id, v)}
              onNote={(v) => set('notes', c.id, v)} />
          ))}
        </div>
      )}
    </section>
  );
}
