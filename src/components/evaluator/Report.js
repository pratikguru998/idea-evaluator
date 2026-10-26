import React from 'react';
import RadarChart from './RadarChart.js';
import LensPanel from './LensPanel.js';
import {Meter, RedFlags, ValidateNext} from './Summary.js';
import {FiveForcesDiagram} from './FiveForces.js';
import {ThreeCDiagram} from './ThreeC.js';
import {MarketCircles, MarketBars} from './MarketSizing.js';
import {fmt, toneFor} from '../../lib/scoring.js';
import {forcesSummary, threeC, marketSizing, attractivenessLabel, money} from '../../lib/frameworks.js';

// Full-width, print-friendly view of every result with large charts.
export default function Report({idea, r, goTo}) {
  const fs = forcesSummary(idea.forces, idea.scores);
  const cs = threeC(idea.scores);
  const ms = marketSizing(idea.market);
  const cur = idea.market.currency;
  const Edit = ({tab}) => <button type="button" className="ie-link no-print" onClick={() => goTo(tab)}>edit →</button>;

  return (
    <div className="ie-report">
      <div className="ie-card ie-report-head">
        <div className="ie-report-title">
          <h2 className="ie-h2">{idea.name}</h2>
          {idea.pitch && <p className="ie-m0">{idea.pitch}</p>}
          {idea.icp && <p className="ie-small ie-m0">🎯 {idea.icp}</p>}
        </div>
        <div className="ie-kpis">
          <div className="ie-kpi">
            <span className="ie-small">Overall</span>
            <b className={`t-${toneFor(r.overall)}`}>{fmt(r.overall)}<small>/5</small></b>
            <span className={`ie-kpi-sub t-${r.verdict?.tone || 'none'}`}>{r.verdict ? r.verdict.label : 'Needs ≥ 5 scores'}</span>
          </div>
          <div className="ie-kpi">
            <span className="ie-small">Industry attractiveness</span>
            <b className={`t-${toneFor(fs.attractiveness)}`}>{fmt(fs.attractiveness)}<small>/5</small></b>
            <span className="ie-kpi-sub">{attractivenessLabel(fs.attractiveness)}</span>
          </div>
          <div className="ie-kpi">
            <span className="ie-small">Obtainable market (SOM)</span>
            <b>{money(ms.som, cur)}</b>
            <span className="ie-kpi-sub">{ms.goalCheck ? `${ms.goalCheck.ratio.toFixed(1)}× revenue goal` : 'Add a revenue goal'}</span>
          </div>
          <div className="ie-kpi ie-kpi-meters">
            <Meter label={`Coverage · ${r.scoredCount}/${r.total}`} value={r.coverage} />
            <Meter label="Evidence-backed" value={r.confidence} />
          </div>
        </div>
        {r.warnings.map((w) => <div key={w} className="ie-warn">⚠️ {w}</div>)}
      </div>

      <div className="ie-grid-2">
        <div className="ie-card">
          <div className="ie-card-head"><h3>📐 Scorecard sections</h3><Edit tab="scorecard" /></div>
          <RadarChart size={360} axes={r.sections.map((s) => ({label: s.title, short: `${s.id} · ${s.title.split(' ')[0]}`}))}
            series={[{name: idea.name, values: r.sections.map((s) => s.score), color: 'var(--ifm-color-primary)'}]} />
        </div>
        <div className="ie-card">
          <div className="ie-card-head"><h3>👁️ Perspectives</h3><Edit tab="scorecard" /></div>
          <RadarChart size={360} axes={r.lenses.map((l) => ({label: l.title, short: `${l.icon} ${l.title.split(' ')[0]}`}))}
            series={[{name: idea.name, values: r.lenses.map((l) => l.score), color: '#e11d48'}]} />
        </div>
      </div>

      <div className="ie-card">
        <h3>Perspective breakdown</h3>
        <div className="ie-lenses-wide"><LensPanel lenses={r.lenses} /></div>
      </div>

      <div className="ie-grid-2">
        <div className="ie-card">
          <div className="ie-card-head"><h3>⚔️ Porter's Five Forces</h3><Edit tab="forces" /></div>
          <FiveForcesDiagram summary={fs} />
        </div>
        <div className="ie-card">
          <div className="ie-card-head"><h3>🔺 3C model</h3><Edit tab="threec" /></div>
          <ThreeCDiagram cs={cs} />
        </div>
      </div>

      <div className="ie-card">
        <div className="ie-card-head"><h3>🎯 TAM · SAM · SOM</h3><Edit tab="market" /></div>
        <div className="ie-market-grid ie-market-grid-report">
          <MarketCircles ms={ms} currency={cur} />
          <MarketBars ms={ms} currency={cur} />
        </div>
      </div>

      <div className="ie-grid-2">
        <RedFlags r={r} scores={idea.scores} onJump={(sec) => {
          goTo('scorecard');
          setTimeout(() => document.getElementById(`section-${sec}`)?.scrollIntoView({behavior: 'smooth'}), 150);
        }} />
        <ValidateNext r={r} />
      </div>

      {idea.concerns && (
        <div className="ie-card">
          <h3>Additional concerns, assumptions, or observations</h3>
          <p className="ie-pre">{idea.concerns}</p>
        </div>
      )}
    </div>
  );
}

