// Value Proposition Canvas (after Osterwalder et al., *Value Proposition Design*, 2014)
// and user persona building blocks. All wording is paraphrased.

export const PROFILE = {
  jobs: {
    title: 'Customer jobs',
    icon: '🧰',
    weightLabel: 'Importance',
    weightEnds: ['insignificant', 'crucial'],
    help: 'What customers are trying to get done in work or life: tasks, problems to solve, needs to satisfy.',
    types: [
      {id: 'functional', label: 'Functional'},
      {id: 'social', label: 'Social'},
      {id: 'emotional', label: 'Emotional'},
      {id: 'supporting', label: 'Supporting (buy · co-create · transfer)'},
    ],
    triggers: [
      'What task or problem eats most of their time or attention?',
      'How do they want to be seen by peers, bosses or customers?',
      'What feeling are they chasing: security, confidence, calm, status?',
      'What do they do around the purchase: compare, buy, review, cancel, resell?',
      'In which context does the job happen, and what constraints does that add?',
    ],
  },
  pains: {
    title: 'Pains',
    icon: '😣',
    weightLabel: 'Severity',
    weightEnds: ['moderate', 'extreme'],
    help: 'What annoys them before, during or after the job, or stops them from doing it at all. Includes risks of a bad outcome.',
    types: [
      {id: 'outcome', label: 'Undesired outcome'},
      {id: 'obstacle', label: 'Obstacle'},
      {id: 'risk', label: 'Risk'},
    ],
    triggers: [
      'What counts as “too costly” for them: time, money or effort?',
      'What frustrates them about today’s solutions? What is missing or broken?',
      'What keeps them up at night?',
      'What social risk do they fear: losing face, trust or status?',
      'What barriers stop them adopting something new: upfront cost, learning curve?',
      'Make it measurable, e.g. “waiting more than 10 minutes”, not just “waiting”.',
    ],
  },
  gains: {
    title: 'Gains',
    icon: '🌟',
    weightLabel: 'Relevance',
    weightEnds: ['nice to have', 'essential'],
    help: 'Outcomes and benefits they want, from the bare minimum they require to delights they never expected.',
    types: [
      {id: 'required', label: 'Required'},
      {id: 'expected', label: 'Expected'},
      {id: 'desired', label: 'Desired'},
      {id: 'unexpected', label: 'Unexpected'},
    ],
    triggers: [
      'Which savings would delight them: time, money, effort?',
      'What quality level do they expect, and what would exceed it?',
      'What would make their job or life noticeably easier?',
      'What positive social outcome do they want: look good, gain status?',
      'How do they measure success, and what would move that metric?',
    ],
  },
};

export const VALUE_MAP = {
  products: {
    title: 'Products & services',
    icon: '🎁',
    help: 'What you offer. The value proposition is built around these.',
    types: [
      {id: 'digital', label: 'Digital'},
      {id: 'physical', label: 'Physical'},
      {id: 'service', label: 'Service / intangible'},
      {id: 'financial', label: 'Financial'},
    ],
  },
  relievers: {
    title: 'Pain relievers',
    icon: '💊',
    target: 'pains',
    help: 'How exactly your offer removes or reduces a specific pain. Link each one to the pains it kills.',
  },
  creators: {
    title: 'Gain creators',
    icon: '🚀',
    target: 'gains',
    help: 'How exactly your offer produces a specific gain. Link each one to the gains it creates.',
  },
};

// Paraphrase of the book's "10 characteristics of great value propositions".
export const GREAT_VP = [
  'Fits inside a business model that can actually make money',
  'Targets the jobs, pains and gains customers care most about',
  'Goes after unsatisfied jobs, unsolved pains and missing gains',
  'Does a few things extremely well rather than many things averagely',
  'Covers emotional and social jobs, not just functional ones',
  'Matches how customers themselves measure success',
  'Addresses something many people have, or a few will pay a lot for',
  'Stands apart from competitors on things customers value',
  'Clearly beats the competition on at least one dimension',
  'Is hard for others to copy',
];

export const FIT_STAGES = [
  {id: 'ps', title: 'Problem–solution fit', desc: 'Evidence that customers care about these jobs, pains and gains, and a value proposition designed to address them. Still on paper.'},
  {id: 'pm', title: 'Product–market fit', desc: 'Evidence that customers actually want and use the value proposition: traction, retention, willingness to pay.'},
  {id: 'bm', title: 'Business-model fit', desc: 'Evidence that the value proposition can be delivered in a profitable, scalable business model.'},
];

export const TEST_STATUS = [
  {id: 'planned', label: 'Planned', icon: '📝'},
  {id: 'running', label: 'Running', icon: '⏳'},
  {id: 'validated', label: 'Validated', icon: '✅'},
  {id: 'invalidated', label: 'Invalidated', icon: '❌'},
];

// ---------- Personas ----------
export const AVATARS = ['🧑‍💼', '👩‍💻', '👨‍🎨', '👩‍⚕️', '🧑‍🏫', '👨‍🔧', '👩‍🌾', '🧑‍🍳', '🧑‍🎓', '👵', '🧔', '👩‍🚀', '🧑‍⚖️', '👨‍👩‍👧', '🏪', '🏢'];
export const PERSONA_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#14b8a6', '#64748b'];

export const BUYING_ROLES = [
  {id: 'user', label: 'User'},
  {id: 'buyer', label: 'Buyer / pays'},
  {id: 'decider', label: 'Decision maker'},
  {id: 'influencer', label: 'Influencer'},
  {id: 'blocker', label: 'Gatekeeper / blocker'},
];

export const TRAITS = [
  {id: 'price', left: 'Price-sensitive', right: 'Value-focused'},
  {id: 'adoption', left: 'Late adopter', right: 'Early adopter'},
  {id: 'diy', left: 'Do-it-yourself', right: 'Done-for-you'},
  {id: 'tech', left: 'Low tech-savvy', right: 'Tech-savvy'},
  {id: 'risk', left: 'Risk-averse', right: 'Risk-taking'},
];

export const PERSONA_LISTS = [
  {id: 'goals', title: 'Goals', icon: '🎯', hint: 'What they want to achieve (becomes gains)'},
  {id: 'frustrations', title: 'Frustrations', icon: '😤', hint: 'What gets in their way (becomes pains)'},
  {id: 'jobs', title: 'Jobs to be done', icon: '🧰', hint: 'Tasks they are trying to get done (becomes jobs)'},
  {id: 'tools', title: 'Tools & behaviours', icon: '🛠️', hint: 'What they use today, habits, workarounds'},
  {id: 'channels', title: 'Where to reach them', icon: '📣', hint: 'Communities, media, events, search terms'},
];
