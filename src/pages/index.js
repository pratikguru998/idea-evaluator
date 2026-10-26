import React, {useMemo} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {SECTIONS} from '../data/criteria.js';
import {evaluate} from '../lib/scoring.js';
import useIdeas from '../lib/useIdeas.js';
import SectionCard from '../components/evaluator/SectionCard.js';
import Summary from '../components/evaluator/Summary.js';
import IdeaManager from '../components/evaluator/IdeaManager.js';

function Evaluator() {
  const ideas = useIdeas({acceptShare: true});
  const {state, active, notice, setNotice, updateActive} = ideas;
  const r = useMemo(() => (active ? evaluate(active.scores, active.evidence) : null), [active]);

  if (!state || !active) return <div className="ie-loading">Loading your ideas…</div>;

  return (
    <>
      {notice && (
        <div className="ie-notice no-print" role="status">
          <span>{notice}</span>
          <button type="button" className="ie-link" onClick={() => setNotice(null)} aria-label="Dismiss">✕</button>
        </div>
      )}
      <IdeaManager ideas={state.ideas} active={active} r={r} actions={ideas} setNotice={setNotice} />

      <div className="ie-layout">
        <div className="ie-main">
          <div className="ie-card ie-idea">
            <input className="ie-input ie-name" value={active.name} aria-label="Idea name" placeholder="Name your idea"
              onChange={(e) => updateActive({name: e.target.value})} />
            <label className="ie-field">
              <span>One-line pitch</span>
              <input className="ie-input" value={active.pitch} placeholder="What it does, for whom, and the result"
                onChange={(e) => updateActive({pitch: e.target.value})} />
            </label>
            <label className="ie-field">
              <span>Ideal customer</span>
              <input className="ie-input" value={active.icp} placeholder="Role · business type · size · situation"
                onChange={(e) => updateActive({icp: e.target.value})} />
            </label>
            <div className="ie-legend">
              <span><b>1</b> very weak</span><span><b>3</b> uncertain / average</span><span><b>5</b> very strong</span>
              <span><b>?</b> unknown (leave unscored)</span>
              <span>Score on <b>evidence, not optimism</b>, and tick <i>evidence</i> when a score is backed by real data.</span>
            </div>
          </div>

          {SECTIONS.map((s) => (
            <SectionCard key={s.id} section={s} summary={r.sections.find((x) => x.id === s.id)} idea={active} update={updateActive} />
          ))}

          <div className="ie-card">
            <h3>Additional concerns, assumptions, or observations</h3>
            <textarea className="ie-input" rows={6} value={active.concerns}
              placeholder="Key assumptions you are making, open questions, things that worry you…"
              onChange={(e) => updateActive({concerns: e.target.value})} />
          </div>
        </div>

        <aside className="ie-side">
          <Summary r={r} scores={active.scores} />
        </aside>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Layout title="Evaluate a business idea" description="Score a business idea on 28 criteria and see it through customer, investor, founder and competitor lenses.">
      <header className="ie-hero no-print">
        <div className="container">
          <h1>Is this a real problem worth solving?</h1>
          <p>
            Score your idea on 28 criteria once. See it through the eyes of a <b>customer</b>, an <b>investor</b>,
            a <b>founder</b> and a <b>competitor</b>, then get a verdict, red flags and what to validate next.
            Everything stays in your browser. <Link to="/docs/how-it-works">How scoring works →</Link>
          </p>
        </div>
      </header>
      <main className="container ie-container">
        <Evaluator />
      </main>
    </Layout>
  );
}
