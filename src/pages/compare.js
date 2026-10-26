import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {evaluate, fmt, toneFor} from '../lib/scoring.js';
import useIdeas from '../lib/useIdeas.js';
import {saveState} from '../lib/store.js';
import RadarChart from '../components/evaluator/RadarChart.js';

const COLORS = ['#4f46e5', '#e11d48', '#059669', '#d97706'];

function Cell({v}) {
  return <td><span className={`ie-badge t-${toneFor(v)}`}>{fmt(v)}</span></td>;
}

function Compare() {
  const {state} = useIdeas();
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    if (state && !picked.length) setPicked([...state.ideas].sort((a, b) => b.updated - a.updated).slice(0, 4).map((i) => i.id));
  }, [state, picked.length]);

  const rows = useMemo(() => {
    if (!state) return [];
    return picked.map((id) => state.ideas.find((i) => i.id === id)).filter(Boolean)
      .map((idea) => ({idea, r: evaluate(idea.scores, idea.evidence)}));
  }, [state, picked]);

  if (!state) return <div className="ie-loading">Loading your ideas…</div>;
  if (state.ideas.length < 2) {
    return (
      <div className="ie-card">
        <p>You need at least two saved ideas to compare. <Link to="/">Go back to the evaluator</Link> and add another idea, or load the example.</p>
      </div>
    );
  }

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id]));
  const first = rows[0]?.r;

  return (
    <>
      <div className="ie-card">
        <h3>Pick up to 4 ideas</h3>
        <div className="ie-picks">
          {state.ideas.map((i) => (
            <label key={i.id} className={`ie-pick${picked.includes(i.id) ? ' on' : ''}`}>
              <input type="checkbox" checked={picked.includes(i.id)} onChange={() => toggle(i.id)} />
              {i.name}
            </label>
          ))}
        </div>
      </div>
      {rows.length > 0 && (
        <div className="ie-compare-grid">
          <div className="ie-card">
            <h3>Sections</h3>
            <RadarChart axes={first.sections.map((s) => ({label: s.title, short: `${s.id} · ${s.title.split(' ')[0]}`}))}
              series={rows.map(({idea, r}, k) => ({name: idea.name, values: r.sections.map((s) => s.score), color: COLORS[k]}))} />
            <Legend rows={rows} />
          </div>
          <div className="ie-card">
            <h3>Perspectives</h3>
            <RadarChart axes={first.lenses.map((l) => ({label: l.title, short: `${l.icon} ${l.title.split(' ')[0]}`}))}
              series={rows.map(({idea, r}, k) => ({name: idea.name, values: r.lenses.map((l) => l.score), color: COLORS[k]}))} />
            <Legend rows={rows} />
          </div>
        </div>
      )}
      {rows.length > 0 && (
        <div className="ie-card ie-table-wrap">
          <table className="ie-table">
            <thead>
              <tr>
                <th />
                {rows.map(({idea}, k) => (
                  <th key={idea.id}>
                    <span className="ie-swatch" style={{background: COLORS[k]}} />
                    <Link to="/" onClick={() => saveState({...state, activeId: idea.id})}>{idea.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><th>Overall</th>{rows.map(({idea, r}) => <Cell key={idea.id} v={r.overall} />)}</tr>
              <tr><th>Verdict</th>{rows.map(({idea, r}) => <td key={idea.id} className={`t-${r.verdict?.tone || 'none'} ie-vtext`}>{r.verdict ? r.verdict.label : '–'}</td>)}</tr>
              <tr><th>Coverage</th>{rows.map(({idea, r}) => <td key={idea.id}>{r.scoredCount}/{r.total}</td>)}</tr>
              <tr><th>Evidence-backed</th>{rows.map(({idea, r}) => <td key={idea.id}>{Math.round(r.confidence * 100)}%</td>)}</tr>
              <tr className="ie-table-sep"><th colSpan={rows.length + 1}>Sections</th></tr>
              {first.sections.map((s, i) => (
                <tr key={s.id}><th>{s.icon} {s.id}. {s.title}</th>{rows.map(({idea, r}) => <Cell key={idea.id} v={r.sections[i].score} />)}</tr>
              ))}
              <tr className="ie-table-sep"><th colSpan={rows.length + 1}>Perspectives</th></tr>
              {first.lenses.map((l, i) => (
                <tr key={l.id}><th>{l.icon} {l.title}</th>{rows.map(({idea, r}) => <Cell key={idea.id} v={r.lenses[i].score} />)}</tr>
              ))}
              <tr className="ie-table-sep"><th colSpan={rows.length + 1}>Risks</th></tr>
              <tr><th>Red flags</th>{rows.map(({idea, r}) => <td key={idea.id} className="ie-small">{r.redFlags.map((c) => c.label).join(', ') || '–'}</td>)}</tr>
              <tr><th>Knockouts</th>{rows.map(({idea, r}) => <td key={idea.id} className="ie-small">{r.knockouts.map((c) => c.label).join(', ') || '–'}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Legend({rows}) {
  return (
    <div className="ie-legend-row">
      {rows.map(({idea}, k) => <span key={idea.id}><span className="ie-swatch" style={{background: COLORS[k]}} />{idea.name}</span>)}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Layout title="Compare ideas" description="Compare up to four business ideas side by side.">
      <header className="ie-hero ie-hero-sm">
        <div className="container">
          <h1>⚖️ Compare ideas</h1>
          <p>Overlay up to four saved ideas across the five sections and four perspectives.</p>
        </div>
      </header>
      <main className="container ie-container">
        <Compare />
      </main>
    </Layout>
  );
}
