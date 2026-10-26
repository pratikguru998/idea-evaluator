// The 28-criterion checklist. Every criterion is scored 1–5 where 5 is always
// the most favourable for the idea; `high` spells out what a 5 means where the
// direction could be ambiguous. `critical` items act as knockouts in the verdict.

export const SCALE = [
  {v: 1, label: 'Very weak'},
  {v: 2, label: 'Weak'},
  {v: 3, label: 'Uncertain / average'},
  {v: 4, label: 'Strong'},
  {v: 5, label: 'Very strong'},
];

export const SECTIONS = [
  {
    id: 'A',
    title: 'Problem quality',
    icon: '🔥',
    blurb: 'Is this a real, painful problem worth solving?',
    criteria: [
      {
        id: 'severity',
        label: 'Problem severity',
        question: 'How painful, expensive, risky, or frustrating is the problem?',
        high: 'Severe pain: it costs real money, time or risk today.',
        critical: true,
        test: 'Run 10 problem interviews. Ask about the last time it happened and what it cost. Do not pitch.',
      },
      {
        id: 'frequency',
        label: 'Problem frequency',
        question: 'How often does the customer experience it?',
        high: 'Daily or weekly, not once a year.',
        test: 'Ask interviewees to walk through the last 3 occurrences. Count how often it really happens.',
      },
      {
        id: 'inaction',
        label: 'Cost of inaction',
        question: 'What happens if the customer does nothing?',
        high: 'Doing nothing has a clear, growing cost.',
        test: 'Quantify the status quo: hours lost, revenue missed, penalties or churn caused per month.',
      },
      {
        id: 'existing',
        label: 'Existing solutions',
        question: 'How do people solve this problem today?',
        high: 'Today’s workarounds are clearly poor: hacky spreadsheets, manual effort, or unhappy users of incumbents.',
        test: 'Map current workarounds. Ask "what have you tried, and why did you stop?"',
      },
      {
        id: 'urgency',
        label: 'Urgency',
        question: 'Does the customer need a solution now, or can it wait indefinitely?',
        high: 'It is a top-3 priority with a deadline or trigger event.',
        test: 'Ask where it ranks on their priority list this quarter, and whether there is a budget line for it.',
      },
    ],
  },
  {
    id: 'B',
    title: 'Market and customer',
    icon: '🎯',
    blurb: 'Who exactly buys, how many of them exist, and can you reach them?',
    criteria: [
      {
        id: 'icp',
        label: 'Ideal customer profile (ICP)',
        question: 'Can I define a specific customer by role, business type, size, and situation?',
        high: 'A sharp, nameable ICP. You could list 20 real people who fit it.',
        test: 'Write the ICP in one sentence, then find 20 real names that match it.',
      },
      {
        id: 'market',
        label: 'Market size',
        question: 'Are there enough potential buyers to build a worthwhile business?',
        high: 'Bottom-up count × realistic price supports your revenue goal with room to spare.',
        test: 'Do a bottom-up estimate: number of ICP accounts × achievable price × realistic share.',
      },
      {
        id: 'access',
        label: 'Customer access',
        question: 'Can I reach these buyers affordably and repeatedly?',
        high: 'You have a repeatable, cheap channel such as a community, network, SEO or marketplace.',
        critical: true,
        test: 'Book 10 conversations through the channel you plan to scale. Measure the response rate and effort.',
      },
      {
        id: 'wtp',
        label: 'Willingness to pay',
        question: 'Do customers have both the budget and motivation to pay?',
        high: 'People have paid, pre-ordered, or already pay for a worse alternative.',
        critical: true,
        test: 'Pre-sell: ask for a deposit, letter of intent or paid pilot. Compliments are not commitments.',
      },
      {
        id: 'authority',
        label: 'Buying authority',
        question: 'Who experiences the problem, who uses the solution, and who approves the purchase?',
        high: 'The user and the buyer are the same person, or the approval path is short and known.',
        test: 'Map user, champion, budget owner and blocker for 5 target accounts.',
      },
    ],
  },
  {
    id: 'C',
    title: 'Solution and differentiation',
    icon: '💡',
    blurb: 'Why you, and why will it last?',
    criteria: [
      {
        id: 'value',
        label: 'Value proposition',
        question: 'Can I explain the benefit in one clear sentence?',
        high: 'One sentence that customers repeat back to you unprompted.',
        test: 'Test 3 one-line value props on a landing page or in cold outreach. Compare click and reply rates.',
      },
      {
        id: 'alternatives',
        label: 'Competitive alternatives',
        question: 'What products, services, internal workflows, or manual work compete with me?',
        high: 'Alternatives are weak, fragmented or ill-fitting for your ICP.',
        test: 'Build a competitor grid including "do nothing" and "hire someone". Read 1–3 star reviews of the top 3.',
      },
      {
        id: 'differentiation',
        label: 'Differentiation',
        question: 'Why would customers choose me over those alternatives?',
        high: 'A clear 10× on something customers care about, not a feature list.',
        test: 'Show prospects your approach next to their current one. Ask them to explain why they would switch.',
      },
      {
        id: 'switching',
        label: 'Switching costs',
        question: 'How difficult is it for customers to change from their current solution?',
        high: 'Easy for customers to switch to you, and they become sticky once they adopt.',
        test: 'List what a customer must migrate, retrain or re-integrate. Prototype a 1-day onboarding.',
      },
      {
        id: 'defensibility',
        label: 'Defensibility',
        question: 'What could make my advantage durable as competitors respond?',
        high: 'A compounding moat: network effects, proprietary data, brand, or distribution lock-in.',
        test: 'Write down what a well-funded competitor would copy in 6 months, and what they could not.',
      },
    ],
  },
  {
    id: 'D',
    title: 'Business model and economics',
    icon: '💰',
    blurb: 'Do the numbers work, and how much cash do you need to get there?',
    criteria: [
      {
        id: 'revenue',
        label: 'Revenue model',
        question: 'How exactly will I make money, and who pays?',
        high: 'Simple and proven in this market, ideally recurring.',
        test: 'Write the pricing page. Name who pays, for what unit, how often, and through which payment flow.',
      },
      {
        id: 'pricing',
        label: 'Pricing power',
        question: 'Can I charge enough relative to the value delivered?',
        high: 'The price is a small fraction of the value created or cost saved.',
        test: 'Van Westendorp or "would you pay X?" on 15 prospects. Anchor against their cost of inaction.',
      },
      {
        id: 'margin',
        label: 'Gross margin',
        question: 'How much revenue remains after the direct cost of delivering the product?',
        high: 'Healthy, software-like margins (roughly 70%+), or clearly above industry norms.',
        test: 'Build a unit-cost sheet covering hosting, APIs, payment fees, support time and fulfilment per customer.',
      },
      {
        id: 'cac',
        label: 'Customer acquisition cost',
        question: 'How much will it cost in money and time to acquire a customer?',
        high: 'Cheap to acquire, with payback in a few months or less.',
        test: 'Spend a small fixed budget (or 20 hours) on one channel. Divide it by the customers acquired.',
      },
      {
        id: 'ltv',
        label: 'Customer lifetime value',
        question: 'How much gross profit can a customer generate over the relationship?',
        high: 'LTV comfortably exceeds 3× CAC thanks to long retention or expansion.',
        test: 'Estimate retention from analogous products. Compute LTV = margin × ARPU ÷ churn.',
      },
      {
        id: 'cash',
        label: 'Cash flow and capital',
        question: 'How much money is required before the business can sustain itself?',
        high: 'You can reach break-even on savings, pre-sales or small revenue, with no big raise needed.',
        test: 'Build a 12-month cash runway sheet. Find the month cash hits zero in the base case.',
      },
    ],
  },
  {
    id: 'E',
    title: 'Execution and risk',
    icon: '🛠️',
    blurb: 'Can you, specifically, pull this off, and what could kill it?',
    criteria: [
      {
        id: 'fit',
        label: 'Founder-market fit',
        question: 'Do I understand the customer, industry, or problem unusually well?',
        high: 'You have lived the problem or have unusual insight and network in this market.',
        test: 'List 3 insights you hold that most people in this space would disagree with or don’t know.',
      },
      {
        id: 'feasibility',
        label: 'Technical feasibility',
        question: 'Can I build and maintain the solution with available resources?',
        high: 'Buildable with the skills, tools and time you have now.',
        critical: true,
        test: 'Spike the hardest technical piece in 1–2 weeks before building anything else.',
      },
      {
        id: 'distribution',
        label: 'Distribution strategy',
        question: 'Do I have a credible way to get the first 10 and then 100 customers?',
        high: 'You can name where customers 1–10 come from, and a channel that scales to 100.',
        critical: true,
        test: 'Write names for the first 10 customers. Run one experiment on the channel meant for 100.',
      },
      {
        id: 'validation',
        label: 'Time to validation',
        question: 'Can I test the riskiest assumptions before building the complete product?',
        high: 'The riskiest assumption can be tested in days with a landing page, concierge or prototype.',
        test: 'Pick the riskiest assumption and design a test that gives a yes/no signal within 2 weeks.',
      },
      {
        id: 'ops',
        label: 'Operational complexity',
        question: 'How difficult will support, delivery, onboarding, and ongoing maintenance be?',
        high: 'Simple to run: self-serve onboarding, low support load, little manual delivery.',
        test: 'Deliver the service manually (concierge) to 3 customers. Log every hour spent.',
      },
      {
        id: 'regulatory',
        label: 'Regulatory and platform risk',
        question: 'Could laws, third-party APIs, marketplaces, or platform changes threaten the business?',
        high: 'Low exposure: no single platform or regulation can switch you off.',
        test: 'List every external dependency (APIs, app stores, laws). Note the impact if each one changed tomorrow.',
      },
      {
        id: 'timing',
        label: 'Timing',
        question: 'Why is this opportunity viable now, and what could make the timing wrong?',
        high: 'A clear recent shift (tech, regulation, behaviour) makes this possible now and not 5 years ago.',
        test: 'Write the "why now" in one sentence and find 3 data points that support it.',
      },
    ],
  },
];

export const CRITERIA = SECTIONS.flatMap((s) =>
  s.criteria.map((c) => ({...c, section: s.id, sectionTitle: s.title})),
);

export const CRITERION_BY_ID = Object.fromEntries(CRITERIA.map((c) => [c.id, c]));
