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
import {OfferMarket, OfferValue, OfferProblems, OfferDelivery, OfferStack} from '../components/evaluator/OfferSteps.js';
import {OfferEnhance, OfferFinal} from '../components/evaluator/OfferFinish.js';
import {PHASES, REPORT_TAB, tabById, phaseOf, neighbours, phaseProgress} from '../lib/phases.js';

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
      if (tabById(saved)) setTab(saved);
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
    window.scrollTo({top: document.querySelector('.ie-phases')?.offsetTop - 70 || 0, behavior: 'smooth'});
  };

  const progress = useMemo(() => (active ? phaseProgress(active) : null), [active]);
  const curPhase = phaseOf(tab);
  const {prev, next} = neighbours(tab);
  const stepLabel = (t) => {
    const ph = phaseOf(t.id);
    return ph ? `${t.label} · Phase ${ph.n}` : t.label;
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

      <nav className="ie-phases no-print" aria-label="Phases">
        {PHASES.map((ph, i) => {
          const pct = Math.round((progress[ph.id] || 0) * 100);
          const on = curPhase?.id === ph.id;
          return (
            <React.Fragment key={ph.id}>
              <button type="button" className={`ie-phase${on ? ' on' : ''}${pct >= 80 ? ' done' : ''}`} onClick={() => goTo(on ? tab : ph.tabs[0].id)} aria-current={on ? 'step' : undefined}>
                <span className="ie-phase-n">{pct >= 80 ? '✓' : ph.n}</span>
                <span className="ie-phase-text">
                  <span className="ie-phase-kicker">Phase {ph.n}</span>
                  <span className="ie-phase-title">{ph.icon} {ph.title}</span>
                  <span className="ie-phase-blurb">{ph.blurb}</span>
                  <span className="ie-phase-bar"><span style={{width: `${pct}%`}} /></span>
                  <span className="ie-phase-pct">{pct}% complete</span>
                </span>
              </button>
              {i < PHASES.length - 1 && <span className="ie-phase-arrow" aria-hidden="true">→</span>}
            </React.Fragment>
          );
        })}
        <button type="button" className={`ie-phase ie-phase-report${tab === 'report' ? ' on' : ''}`} onClick={() => goTo('report')}>
          <span className="ie-phase-title">{REPORT_TAB.label}</span>
          <span className="ie-phase-blurb">Everything on one page</span>
        </button>
      </nav>

      {curPhase && (
        <nav className="ie-tabs no-print" role="tablist" aria-label={`Phase ${curPhase.n} steps`}>
          {curPhase.tabs.map((t, i) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => goTo(t.id)}>
              <span className="ie-tab-n">{curPhase.n}.{i + 1}</span> {t.label}
            </button>
          ))}
        </nav>
      )}

      {tabById(tab)?.wide ? (
        <>
          {tab === 'o-market' && <OfferMarket idea={active} update={updateActive} />}
          {tab === 'o-value' && <OfferValue idea={active} update={updateActive} />}
          {tab === 'o-problems' && <OfferProblems idea={active} update={updateActive} setNotice={setNotice} />}
          {tab === 'o-delivery' && <OfferDelivery idea={active} update={updateActive} />}
          {tab === 'o-stack' && <OfferStack idea={active} update={updateActive} />}
          {tab === 'o-enhance' && <OfferEnhance idea={active} update={updateActive} />}
          {tab === 'o-final' && <OfferFinal idea={active} goTo={goTo} setNotice={setNotice} phase1={progress} />}
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

      <nav className="ie-stepnav no-print" aria-label="Previous and next step">
        {prev ? <button type="button" className="ie-stepnav-btn" onClick={() => goTo(prev.id)}><span className="ie-small">← Back</span>{stepLabel(prev)}</button> : <span />}
        {next && <button type="button" className="ie-stepnav-btn next" onClick={() => goTo(next.id)}><span className="ie-small">Next →</span>{stepLabel(next)}</button>}
      </nav>
    </>
  );
}

export default function Home() {
  return (
    <Layout title="Evaluate a business idea" description="Score a business idea on 28 criteria and see it through customer, investor, founder and competitor lenses.">
      <header className="ie-hero no-print">
        <div className="container">
          <h1>From idea to irresistible offer</h1>
          <p>
            Work through three phases in order. <b>① Validate</b> that the problem is real and the market is worth it (scorecard, TAM · SAM · SOM, Five Forces, 3C).
            <b> ② Design</b> who it's for and how the business works (personas, Value Proposition Canvas, Business Model Canvas).
            <b> ③ Craft the offer</b> people can't refuse ($100M Offers method).
            Everything stays in your browser. <Link to="/docs/how-it-works">How it works →</Link>
          </p>
        </div>
      </header>
      <main className="container ie-container">
        <Evaluator />
      </main>
    </Layout>
  );
}
