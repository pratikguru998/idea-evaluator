// Perspective lenses: each re-weights the same criterion scores (weights 1–3)
// to answer the question a particular stakeholder would ask.

export const LENSES = [
  {
    id: 'customer',
    icon: '👤',
    title: 'Customer',
    asks: 'Would I urgently want this, and is it clearly better than what I do today?',
    weights: {
      severity: 3, frequency: 2, inaction: 2, urgency: 3, existing: 2,
      value: 3, differentiation: 2, alternatives: 1, wtp: 1,
    },
  },
  {
    id: 'investor',
    icon: '💰',
    title: 'Investor',
    asks: 'Is the market big enough, are the unit economics sound, and can it become large and defensible?',
    weights: {
      market: 3, pricing: 2, margin: 2, cac: 2, ltv: 3, defensibility: 3,
      timing: 2, cash: 1, revenue: 1, wtp: 2, distribution: 1,
    },
  },
  {
    id: 'founder',
    icon: '🛠️',
    title: 'Founder / Operator',
    asks: 'Can I build, sell and run this myself with the time, skills and cash I actually have?',
    weights: {
      fit: 3, feasibility: 3, validation: 2, ops: 2, cash: 2,
      distribution: 3, access: 2, icp: 1,
    },
  },
  {
    id: 'competitor',
    icon: '⚔️',
    title: 'Competitor / Market',
    asks: 'If incumbents and copycats respond, does this still win and hold its position?',
    weights: {
      alternatives: 3, differentiation: 3, switching: 2, defensibility: 3,
      regulatory: 2, timing: 1, existing: 1,
    },
  },
];
