// The three-phase journey: validate → design value & model → craft the offer.
import {evaluate} from './scoring.js';
import {forcesSummary, threeC, marketSizing} from './frameworks.js';
import {vpcFit} from './vpc.js';
import {bmcSummary} from './bmc.js';
import {offerStrength} from './offer.js';

export const PHASES = [
  {
    id: 'validate', n: 1, icon: '🔍', title: 'Validate the idea',
    blurb: 'Is this a real problem, in a market worth entering?',
    tabs: [
      {id: 'scorecard', label: '📝 Scorecard'},
      {id: 'market', label: '🎯 TAM · SAM · SOM'},
      {id: 'forces', label: '⚔️ Five Forces'},
      {id: 'threec', label: '🔺 3C'},
    ],
  },
  {
    id: 'design', n: 2, icon: '💎', title: 'Design value & business model',
    blurb: 'Who exactly is it for, what value do you create, and how does the business work?',
    tabs: [
      {id: 'personas', label: '🧑 Personas', wide: true},
      {id: 'vpc', label: '💎 Value Proposition', wide: true},
      {id: 'bmc', label: '🧩 Business Model', wide: true},
    ],
  },
  {
    id: 'offer', n: 3, icon: '🏆', title: 'Craft the offer',
    blurb: 'Package it into an offer so good people feel stupid saying no.',
    tabs: [
      {id: 'o-market', label: '🍖 Starving crowd', wide: true},
      {id: 'o-value', label: '⚖️ Value equation', wide: true},
      {id: 'o-problems', label: '🧩 Problems → solutions', wide: true},
      {id: 'o-delivery', label: '🚚 Delivery', wide: true},
      {id: 'o-stack', label: '✂️ Trim & stack', wide: true},
      {id: 'o-enhance', label: '✨ Enhance', wide: true},
      {id: 'o-final', label: '🏆 Your offer', wide: true},
    ],
  },
];

export const REPORT_TAB = {id: 'report', label: '📊 Report', wide: true};
export const ALL_TABS = [...PHASES.flatMap((p) => p.tabs.map((t) => ({...t, phase: p.id}))), {...REPORT_TAB, phase: 'report'}];
export const tabById = (id) => ALL_TABS.find((t) => t.id === id);
export const phaseOf = (tabId) => PHASES.find((p) => p.tabs.some((t) => t.id === tabId)) || null;

export function neighbours(tabId) {
  const i = ALL_TABS.findIndex((t) => t.id === tabId);
  return {prev: i > 0 ? ALL_TABS[i - 1] : null, next: i >= 0 && i < ALL_TABS.length - 1 ? ALL_TABS[i + 1] : null};
}

// 0–1 completion per phase, from what the user has filled in so far.
export function phaseProgress(idea) {
  const r = evaluate(idea.scores, idea.evidence);
  const ms = marketSizing(idea.market);
  const fs = forcesSummary(idea.forces, idea.scores);
  const c3text = Object.values(idea.c3 || {}).filter((t) => t && t.trim()).length;
  const validate = (r.coverage + (ms.complete ? 1 : 0) + fs.rated / 5 + c3text / 3) / 4;

  const vf = vpcFit(idea.vpc);
  const bs = bmcSummary(idea.bmc);
  const design = ((idea.personas.length ? 1 : 0) + (vf.fit || 0) + bs.filled / 9) / 3;

  const os = offerStrength(idea.offer);
  const offer = os.passed / os.total;
  return {validate, design, offer, verdict: r.verdict, overall: r.overall};
}
