import React from 'react';
import {SECTIONS} from '../../data/criteria.js';
import {LENSES} from '../../data/lenses.js';

// Generated from the same data the evaluator uses, so the docs cannot drift.
export default function LensTable() {
  return (
    <table className="ie-doc-table">
      <thead>
        <tr><th>Criterion</th>{LENSES.map((l) => <th key={l.id}>{l.icon} {l.title}</th>)}</tr>
      </thead>
      <tbody>
        {SECTIONS.flatMap((s) => [
          <tr key={s.id}><th colSpan={LENSES.length + 1}>{s.id}. {s.title}</th></tr>,
          ...s.criteria.map((c) => (
            <tr key={c.id}>
              <td>{c.label}{c.critical ? ' ★' : ''}</td>
              {LENSES.map((l) => <td key={l.id}>{l.weights[c.id] ? '●'.repeat(l.weights[c.id]) : ''}</td>)}
            </tr>
          )),
        ])}
      </tbody>
    </table>
  );
}
