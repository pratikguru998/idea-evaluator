// A worked example so first-time visitors can see every output populated.
export const EXAMPLE = {
  name: 'Example: AI bookkeeping for freelance designers',
  pitch: 'Turns bank feeds and invoices into tax-ready books for freelancers in 10 minutes a month.',
  icp: 'Solo freelance designers in the US earning $60–200k who do their own bookkeeping in spreadsheets.',
  scores: {
    severity: 4, frequency: 3, inaction: 4, existing: 3, urgency: 3,
    icp: 5, market: 4, access: 4, wtp: 3, authority: 5,
    value: 4, alternatives: 2, differentiation: 3, switching: 3, defensibility: 2,
    revenue: 4, pricing: 3, margin: 4, cac: 3, ltv: 3, cash: 4,
    fit: 4, feasibility: 4, distribution: 3, validation: 5, ops: 3, regulatory: 3, timing: 4,
  },
  evidence: {severity: true, icp: true, authority: true, access: true, validation: true, revenue: true},
  notes: {
    severity: '9 of 12 interviewees described tax season as "panic"; two paid late-filing penalties.',
    alternatives: 'QuickBooks Self-Employed, Bench, a CPA, spreadsheets. Crowded.',
    wtp: 'Most pay $0 today. 3 of 12 said they would pay $15/mo. No pre-sales yet.',
    access: 'Active in two designer communities (40k members), with a newsletter of 2,100 subscribers.',
  },
  forces: {rivalry: 4, entrants: 4, buyers: 3, suppliers: 2, substitutes: 4},
  forceNotes: {
    rivalry: 'QuickBooks, Xero, FreshBooks, Bench, plus dozens of AI bookkeeping startups.',
    substitutes: 'A spreadsheet plus a once-a-year accountant is “good enough” for many.',
    suppliers: 'Bank-feed aggregators (Plaid) and the LLM API are the main dependencies, and alternatives exist.',
  },
  c3: {
    customers: 'Designers hate admin, fear tax season and want zero-effort books. They buy through communities and peer recommendations.',
    company: 'Founder is an ex-designer with an audience of 2,100 in designer communities. Can ship the AI categorisation, but has no accounting credentials.',
    competitors: 'Incumbents are generic and built for small businesses with employees. Nobody speaks the language of freelance creatives.',
  },
  market: {
    mode: 'bottomup', currency: 'USD', accounts: '1500000', price: '180', samPct: '30', somPct: '3',
    tam: '', sam: '', som: '', goal: '1000000',
    source: 'US freelance designers ≈ 1.5M (Upwork/BLS estimates). $15/mo plan. SAM = English-speaking, self-filing, already using online banking.',
  },
  concerns: 'Big incumbents could add the same AI categorisation. Need to test whether "made for designers" positioning matters or if this is just generic bookkeeping.',
};
