// Strategy frameworks layered on top of the scorecard: Porter's Five Forces,
// Ohmae's 3C model and TAM / SAM / SOM market sizing.

// Porter: each force is rated by INTENSITY, 1 = weak force (good for you), 5 = strong force (bad for you).
// `suggest` maps scorecard criteria to an implied intensity (6 − favourable score).
export const FORCES = [
  {
    id: 'rivalry',
    title: 'Competitive rivalry',
    icon: '⚔️',
    question: 'How fiercely do existing players compete on price, features and marketing?',
    drivers: ['Many similar competitors', 'Slow market growth', 'Low differentiation', 'High fixed costs or exit barriers'],
    suggest: ['alternatives', 'differentiation'],
  },
  {
    id: 'entrants',
    title: 'Threat of new entrants',
    icon: '🚪',
    question: 'How easily could a new startup or big company enter and copy you?',
    drivers: ['Low capital or skill needed', 'No network effects or brand lock-in', 'Easy access to distribution', 'Weak regulation or IP'],
    suggest: ['defensibility'],
  },
  {
    id: 'buyers',
    title: 'Buyer power',
    icon: '🧑‍💼',
    question: 'How much can customers push your prices down or switch away?',
    drivers: ['Few large customers', 'Low switching costs', 'Price-sensitive buyers', 'Buyers could build it themselves'],
    suggest: ['pricing', 'switching'],
  },
  {
    id: 'suppliers',
    title: 'Supplier power',
    icon: '🏭',
    question: 'How much leverage do your key suppliers, platforms or APIs have over you?',
    drivers: ['Dependence on one platform, API or marketplace', 'Few alternative suppliers', 'Suppliers could compete with you', 'Input costs are a big share of price'],
    suggest: ['regulatory', 'margin'],
  },
  {
    id: 'substitutes',
    title: 'Threat of substitutes',
    icon: '🔄',
    question: 'How easily can customers solve the problem a different way (manual work, spreadsheets, an agency, doing nothing)?',
    drivers: ['Cheap “good enough” workarounds', 'Doing nothing is acceptable', 'Adjacent tools add the feature', 'Low cost of switching to the substitute'],
    suggest: ['existing', 'inaction'],
  },
];

export const INTENSITY = [
  {v: 1, label: 'Very weak force'},
  {v: 2, label: 'Weak'},
  {v: 3, label: 'Moderate'},
  {v: 4, label: 'Strong'},
  {v: 5, label: 'Very strong force'},
];

// 3C: each C has guiding prompts (free text) and the scorecard criteria that measure it.
export const THREE_C = [
  {
    id: 'customers',
    title: 'Customers',
    icon: '👥',
    color: '#2563eb',
    asks: 'What do customers need, and how badly?',
    prompts: ['Who exactly is the customer and what job are they hiring a product for?', 'Which needs are unmet or poorly served today?', 'How do they buy, and what triggers a purchase?'],
    criteria: ['severity', 'frequency', 'urgency', 'icp', 'market', 'access', 'wtp'],
  },
  {
    id: 'company',
    title: 'Company',
    icon: '🏢',
    color: '#059669',
    asks: 'What can you do unusually well?',
    prompts: ['What are your unfair advantages: skills, insight, network, assets?', 'Which capabilities are missing and how will you get them?', 'Can you deliver profitably at the price customers accept?'],
    criteria: ['fit', 'feasibility', 'distribution', 'validation', 'ops', 'margin', 'cash'],
  },
  {
    id: 'competitors',
    title: 'Competitors',
    icon: '🥊',
    color: '#e11d48',
    asks: 'Where are rivals strong, weak or absent?',
    prompts: ['Who are the direct, indirect and “do nothing” competitors?', 'Where do they underserve your customer?', 'How will they respond if you succeed?'],
    criteria: ['alternatives', 'differentiation', 'defensibility', 'switching'],
  },
];

export const CURRENCIES = [
  {code: 'USD', symbol: '$'},
  {code: 'INR', symbol: '₹'},
  {code: 'EUR', symbol: '€'},
  {code: 'GBP', symbol: '£'},
];

export const BLANK_MARKET = {
  mode: 'bottomup', // 'bottomup' | 'topdown'
  currency: 'USD',
  accounts: '', // bottom-up: total potential customers worldwide/in scope
  price: '', // bottom-up: annual revenue per customer
  samPct: '', // % of TAM you can serve (geography, segment, channel)
  somPct: '', // % of SAM you can realistically win in 3–5 years
  tam: '', // top-down values
  sam: '',
  som: '',
  goal: '', // target annual revenue
  source: '', // notes / sources
};
