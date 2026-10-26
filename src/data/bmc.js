// Business Model Canvas (Osterwalder & Pigneur, *Business Model Generation*, 2010).
// Nine building blocks; prompts are paraphrased.

export const BMC_BLOCKS = [
  {
    id: 'kp', title: 'Key partners', icon: '🤝', area: 'kp',
    prompts: ['Who are the partners and suppliers you cannot do without?', 'Which resources do you get from them?', 'Which activities do they do for you?'],
    hint: 'Suppliers, platforms, alliances, outsourced work',
  },
  {
    id: 'ka', title: 'Key activities', icon: '⚙️', area: 'ka',
    prompts: ['What must you do exceptionally well to deliver the value proposition?', 'What do your channels, relationships and revenue streams require?'],
    hint: 'Building product, content, sales, support, operations',
  },
  {
    id: 'kr', title: 'Key resources', icon: '🧱', area: 'kr',
    prompts: ['Which assets does the model need: physical, intellectual, human, financial?', 'What is hard for others to get?'],
    hint: 'Tech, data, brand, team, licences, capital',
  },
  {
    id: 'vp', title: 'Value propositions', icon: '🎁', area: 'vp',
    prompts: ['What value do you deliver to each segment?', 'Which customer problem are you solving or need are you meeting?', 'Which bundle of products and services do you offer?'],
    hint: 'One per segment; link it to your Value Proposition Canvas',
  },
  {
    id: 'cr', title: 'Customer relationships', icon: '💬', area: 'cr',
    prompts: ['What relationship does each segment expect: personal, self-service, automated, community, co-creation?', 'How do you get, keep and grow customers?'],
    hint: 'Onboarding, support, community, account management',
  },
  {
    id: 'ch', title: 'Channels', icon: '📣', area: 'ch',
    prompts: ['How do customers hear about you, evaluate, buy, receive and get after-sales support?', 'Which channels work best and are cheapest?'],
    hint: 'SEO, communities, partners, sales team, app stores',
  },
  {
    id: 'cs', title: 'Customer segments', icon: '👥', area: 'cs',
    prompts: ['For whom are you creating value?', 'Who are your most important customers?', 'Is it a mass, niche, segmented or multi-sided market?'],
    hint: 'Use your personas',
  },
  {
    id: 'cost', title: 'Cost structure', icon: '💸', area: 'cost', money: true,
    prompts: ['What are the most important costs in the model?', 'Which resources and activities cost the most?', 'Which costs are fixed and which grow with volume?'],
    hint: 'Add a monthly amount to see the economics',
    types: [{id: 'fixed', label: 'Fixed'}, {id: 'variable', label: 'Variable'}],
  },
  {
    id: 'rev', title: 'Revenue streams', icon: '💰', area: 'rev', money: true,
    prompts: ['What are customers really willing to pay for, and how do they pay today?', 'How would they prefer to pay?', 'How much does each stream contribute?'],
    hint: 'Add a monthly amount to see the economics',
    types: [
      {id: 'subscription', label: 'Subscription'}, {id: 'usage', label: 'Usage fee'}, {id: 'sale', label: 'Asset sale'},
      {id: 'licensing', label: 'Licensing'}, {id: 'commission', label: 'Commission'}, {id: 'ads', label: 'Advertising'},
      {id: 'rental', label: 'Renting / leasing'},
    ],
  },
];

export const NOTE_COLORS = [
  {id: 'yellow', hex: '#fde68a'},
  {id: 'pink', hex: '#fbcfe8'},
  {id: 'blue', hex: '#bfdbfe'},
  {id: 'green', hex: '#bbf7d0'},
  {id: 'purple', hex: '#ddd6fe'},
];
