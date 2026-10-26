import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {SECTIONS} from '../data/criteria.js';
import {evaluate} from '../lib/scoring.js';
import useIdeas from '../lib/useIdeas.js';
import SectionCard from '../components/evaluator/SectionCard.js';
import Summary from '../components/evaluator/Summary.js';
import IdeaManager from '../components/evaluator/IdeaManager.js';
import MarketSizing from '../components/evaluator/MarketSizing.js';
import FiveForces from '../components/evaluator/FiveForces.js';
import ThreeC from '../components/evaluator/ThreeC.js';
import Report from '../components/evaluator/Report.js';
import ValueCanvas from '../components/evaluator/ValueCanvas.js';
import Personas from '../components/evaluator/Personas.js';
import BusinessModel from '../components/evaluator/BusinessModel.js';
import {forcesSummary, threeC, marketSizing, money} from '../lib/frameworks.js';

const TABS = [
  {id: 'scorecard', label: '📝 Scorecard'},
  {id: 'personas', label: '🧑 Personas', wide: true},
  {id: 'vpc', label: '💎 Value Proposition', wide: true},
  {id: 'bmc', label: '🧩 Business Model', wide: true},
  {id: 'market', label: '🎯 TAM · SAM · SOM'},
  {id: 'forces', label: '⚔️ Five Forces'},
  {id: 'threec', label: '🔺 3C'},
  {id: 'report', label: '📊 Report', wide: true},
];
const TAB_KEY = 'idea-evaluator:tab';

function Evaluator() {
  const ideas = useIdeas({acceptShare: true});
  const {state, active, notice, setNotice, updateActive} = ideas;
  const r = useMemo(() => (active ? evaluate(active.scores, active.evidence) : null), [active]);
  const extras = useMemo(() => {
    if (!active) return null;
    const cs = threeC(active.scores).filter((c) => c.score != null).sort((a, b) => a.score - b.score);
    return {
      attractiveness: forcesSummary(active.forces, active.scores).attractiveness,
      som: money(marketSizing(active.market).som, active.market.currency),
      weakestC: cs.length ? `${cs[0].title} ${cs[0].score.toFixed(1)}` : '–',
    };
  }, [active]);
  const [tab, setTab] = useState('scorecard');
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TAB_KEY);
      if (TABS.some((t) => t.id === saved)) setTab(saved);
    } catch {
      // storage blocked: default tab is fine
    }
  }, []);
  const goTo = (id) => {
    setTab(id);
    try {
      window.localStorage.setItem(TAB_KEY, id);
    } catch {
      // ignore
    }
    window.scrollTo({top: document.querySelector('.ie-tabs')?.offsetTop - 70 || 0, behavior: 'smooth'});
  };

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

      <nav className="ie-tabs no-print" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => goTo(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {TABS.find((t) => t.id === tab)?.wide ? (
        <>
          {tab === 'report' && <Report idea={active} r={r} goTo={goTo} />}
          {tab === 'vpc' && <ValueCanvas idea={active} update={updateActive} />}
          {tab === 'bmc' && <BusinessModel idea={active} update={updateActive} setNotice={setNotice} />}
          {tab === 'personas' && <Personas key={active.id} idea={active} update={updateActive} goTo={goTo} setNotice={setNotice} />}
        </>
      ) : (
        <div className="ie-layout">
          <div className="ie-main">
            {tab === 'scorecard' && (
              <>
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
              </>
            )}
            {tab === 'market' && <MarketSizing idea={active} update={updateActive} />}
            {tab === 'forces' && <FiveForces idea={active} update={updateActive} />}
            {tab === 'threec' && <ThreeC idea={active} update={updateActive} />}
          </div>

          <aside className="ie-side">
            <Summary r={r} scores={active.scores} extras={extras} onOpenReport={() => goTo('report')} />
          </aside>
        </div>
      )}
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
            Score your idea on 28 criteria, build <b>user personas</b>, a <b>Value Proposition Canvas</b> and a <b>Business Model Canvas</b>, size the market (TAM · SAM · SOM), and test it with <b>Porter's Five Forces</b> and the <b>3C model</b>.
            See it through the eyes of a customer, an investor, a founder and a competitor, then get a verdict, red flags and what to validate next.
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
