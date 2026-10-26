// Grand Slam Offer builder, after Alex Hormozi's *$100M Offers* (2021). All wording paraphrased.

export const CROWD = [
  {id: 'pain', title: 'Massive pain', icon: '🔥', from: 'severity', q: 'Do they desperately need this, not just want it? The deeper the pain, the more you can charge.'},
  {id: 'power', title: 'Purchasing power', icon: '💳', from: 'wtp', q: 'Can they actually afford your price, or get access to the money?'},
  {id: 'target', title: 'Easy to target', icon: '🎯', from: 'access', q: 'Are they gathered somewhere you can reach: associations, lists, groups, channels?'},
  {id: 'growing', title: 'Growing market', icon: '📈', from: 'timing', q: 'Is the market expanding (tailwind) or shrinking (headwind)?'},
];

export const CORE_MARKETS = [
  {id: 'health', label: '💪 Health'},
  {id: 'wealth', label: '💰 Wealth'},
  {id: 'relationships', label: '❤️ Relationships'},
];

// Value = (Dream outcome × Perceived likelihood) ÷ (Time delay × Effort & sacrifice)
export const DRIVERS = [
  {id: 'outcome', title: 'Dream outcome', icon: '🌈', side: 'up', low: 'Vague, small result', high: 'Vivid result they crave',
    tip: 'Make the result specific, emotional and status-raising. Describe the life after, not the features.'},
  {id: 'likelihood', title: 'Perceived likelihood', icon: '🎯', side: 'up', low: 'They doubt it will work for them', high: 'They are sure it will work',
    tip: 'Add proof: testimonials, case studies, before/after, data, guarantees, credentials.'},
  {id: 'time', title: 'Time delay', icon: '⏱️', side: 'down', low: 'Results almost immediately', high: 'Results take ages',
    tip: 'Deliver a fast first win. Shorten time to the first visible result, even a small one.'},
  {id: 'effort', title: 'Effort & sacrifice', icon: '🏋️', side: 'down', low: 'Effortless, done for them', high: 'Hard work and big sacrifices',
    tip: 'Do more of it for them. Remove steps, decisions and things they must give up.'},
];

export const STAGES = [
  {id: 'before', label: 'Before'},
  {id: 'during', label: 'During'},
  {id: 'after', label: 'After'},
];

// The four "value drivers" each problem/doubt maps to, with the doubt it represents.
export const PROBLEM_DRIVERS = [
  {id: 'outcome', label: 'Not worth it / too expensive', icon: '🌈'},
  {id: 'likelihood', label: 'Won’t work for me', icon: '🎯'},
  {id: 'time', label: 'Takes too long', icon: '⏱️'},
  {id: 'effort', label: 'Too hard / too much sacrifice', icon: '🏋️'},
];

export const ATTENTION = [
  {id: 'one', label: '1-on-1'},
  {id: 'small', label: 'Small group'},
  {id: 'many', label: 'One-to-many'},
];
export const EFFORT_LEVEL = [
  {id: 'diy', label: 'DIY (do it yourself)'},
  {id: 'dwy', label: 'DWY (done with you)'},
  {id: 'dfy', label: 'DFY (done for you)'},
];
export const MEDIUM = [
  {id: 'inperson', label: 'In person'},
  {id: 'zoom', label: 'Video call'},
  {id: 'phone', label: 'Phone'},
  {id: 'chat', label: 'Text / chat'},
  {id: 'email', label: 'Email'},
  {id: 'recorded', label: 'Recorded video/audio'},
  {id: 'written', label: 'Written / templates'},
  {id: 'software', label: 'Software / tool'},
];

export const CHEAT_CODES = [
  'Personal attention: 1-on-1, small group, or one-to-many?',
  'Their effort: do it themselves, do it with you, or done for them?',
  'If live: in person, phone, video call, chat, email or text support?',
  'If recorded: video, audio, written guide, template or tool?',
  'Speed & convenience: what hours, how fast do you respond, 24/7?',
  '10× test: if they paid 10× your price, what would you give them?',
  '1/10th test: if they paid a tenth, how would you still get them the result?',
];

export const SCARCITY = [
  {id: '', label: 'None yet'},
  {id: 'seats', label: 'Limited seats/slots (overall or per period)'},
  {id: 'bonuses', label: 'Limited supply of bonuses'},
  {id: 'never', label: 'Never-again (one-time) offer'},
];
export const URGENCY = [
  {id: '', label: 'None yet'},
  {id: 'cohorts', label: 'Rolling cohorts (next start date)'},
  {id: 'seasonal', label: 'Rolling seasonal promotion'},
  {id: 'pricing', label: 'Price or bonus deadline'},
  {id: 'exploding', label: 'Exploding opportunity (gets worse if they wait)'},
];
export const GUARANTEES = [
  {id: '', label: 'None yet'},
  {id: 'unconditional', label: 'Unconditional: refund, no questions asked'},
  {id: 'conditional', label: 'Conditional: “if you do X and don’t get Y, we’ll Z”'},
  {id: 'anti', label: 'Anti-guarantee: all sales final, with a strong reason why'},
  {id: 'implied', label: 'Implied: performance-based (rev-share, pay on results)'},
];
export const BONUS_FORMATS = [
  {id: 'tool', label: 'Tool / template / checklist'},
  {id: 'service', label: 'Done-for-you service'},
  {id: 'access', label: 'Access / support / community'},
  {id: 'training', label: 'Training / course'},
];

// MAGIC naming formula.
export const MAGIC = [
  {id: 'magnetic', letter: 'M', title: 'Magnetic reason why', eg: 'Free, Back-to-school, New-year, Grand opening'},
  {id: 'avatar', letter: 'A', title: 'Announce the avatar', eg: 'Busy moms, Gym owners, Freelance designers'},
  {id: 'goal', letter: 'G', title: 'Give them a goal', eg: 'Lose 20 lbs, Get 50 clients, Tax-ready books'},
  {id: 'interval', letter: 'I', title: 'Indicate a time interval', eg: '6-week, 30-day, In 90 days'},
  {id: 'container', letter: 'C', title: 'Complete with a container word', eg: 'Challenge, Blueprint, System, Bootcamp'},
];
export const CONTAINERS = ['Challenge', 'Blueprint', 'Bootcamp', 'System', 'Program', 'Accelerator', 'Kit', 'Intensive', 'Masterclass', 'Formula', 'Sprint', 'Club'];
