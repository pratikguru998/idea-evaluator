import assert from 'node:assert/strict';
import {evaluate} from '../src/lib/scoring.js';
import {CRITERIA} from '../src/data/criteria.js';

const all = (v) => Object.fromEntries(CRITERIA.map((c) => [c.id, v]));
const ev = (v) => Object.fromEntries(CRITERIA.map((c) => [c.id, v]));

let r = evaluate({});
assert.equal(r.verdict, null); assert.equal(r.overall, null); assert.equal(r.coverage, 0);

r = evaluate(all(5), ev(true));
assert.equal(r.verdict.key, 'strong'); assert.equal(r.overall, 5); assert.equal(r.warnings.length, 0);
assert.ok(r.lenses.every((l) => l.score === 5 && l.coverage === 1));

r = evaluate({...all(5), wtp: 1}, ev(true));
assert.equal(r.verdict.key, 'weak'); assert.equal(r.knockouts[0].id, 'wtp'); assert.equal(r.redFlags[0].id, 'wtp');
assert.equal(r.validateNext[0].id, 'wtp');

// Lens math by hand: customer lens with only severity=5 (w3) and urgency=1 (w3) and value=2 (w3) => (15+3+6)/9
r = evaluate({severity: 5, urgency: 1, value: 2});
const cust = r.lenses.find((l) => l.id === 'customer');
assert.ok(Math.abs(cust.score - 24 / 9) < 1e-9);
assert.equal(r.verdict, null); // fewer than 5 scored

r = evaluate({severity: 4, frequency: 4, inaction: 4, existing: 4, urgency: 4});
assert.equal(r.verdict.key, 'strong'); assert.ok(r.verdict.provisional); assert.ok(r.warnings.length >= 2);
console.log('scoring tests passed');

// ---- Frameworks
const {forcesSummary, threeC, marketSizing, money} = await import('../src/lib/frameworks.js');
let f = forcesSummary({rivalry: 5, entrants: 1}, {alternatives: 2, differentiation: 2});
assert.equal(f.attractiveness, 3); // (1 + 5) / 2
assert.equal(f.items.find((x) => x.id === 'rivalry').suggested, 4);
assert.equal(f.strongest[0].id, 'rivalry');
assert.equal(forcesSummary({}).attractiveness, null);

const c = threeC({severity: 4, frequency: 2, fit: 5});
assert.equal(c.find((x) => x.id === 'customers').score, 3);
assert.equal(c.find((x) => x.id === 'competitors').score, null);

let m = marketSizing({mode: 'bottomup', accounts: '1,000,000', price: '100', samPct: '20', somPct: '5', goal: '500000'});
assert.equal(m.tam, 1e8); assert.equal(m.sam, 2e7); assert.equal(m.som, 1e6);
assert.equal(m.goalCheck.ratio, 2); assert.equal(m.suggestedScore, 4); assert.equal(m.goalCheck.customersNeeded, 5000);
m = marketSizing({mode: 'topdown', tam: '100', sam: '200', som: '10'});
assert.ok(m.warnings.length === 1 && /SAM is larger/.test(m.warnings[0]));
assert.equal(money(1.5e9, 'USD'), '$1.5B'); assert.equal(money(2.5e7, 'INR'), '₹2.5Cr');
console.log('framework tests passed');

// ---- Value Proposition Canvas & personas
const {normalizeVpc, normalizePersona, vpcFit, adlibText} = await import('../src/lib/vpc.js');
const {EXAMPLE} = await import('../src/data/example.js');
const {normalize, encodeShare, decodeShare} = await import('../src/lib/store.js');
let v = normalizeVpc({
  pains: [{id: 'p1', text: 'a', weight: 5}, {id: 'p2', text: 'b', weight: 1}],
  gains: [{id: 'g1', text: 'c', weight: 4}],
  relievers: [{id: 'r1', text: 'x', targets: ['p1', 'ghost']}, {id: 'r2', text: 'orphan', targets: []}],
});
assert.deepEqual(v.relievers[0].targets, ['p1']); // dangling link removed
let vf = vpcFit(v);
assert.equal(vf.pains.fit, 5 / 6); assert.equal(vf.gains.fit, 0); assert.equal(vf.fit, 5 / 10);
assert.equal(vf.orphans.length, 1); assert.equal(vf.suggestedScore, 3);
assert.match(adlibText({product: 'P', segment: 'S', job: 'J', verb1: 'cutting', pain: 'X', verb2: 'boosting', gain: 'Y', competitor: 'Z'}), /^Our P help S who want to J by cutting X and boosting Y, unlike Z\.$/);
const per = normalizePersona({name: 'N', traits: {price: 9, tech: 4}, roles: ['buyer', 'nope'], avatar: 'evil'});
assert.deepEqual(per.traits, {tech: 4}); assert.deepEqual(per.roles, ['buyer']); assert.notEqual(per.avatar, 'evil');
const ex = normalize(EXAMPLE);
assert.equal(ex.personas.length, 2); assert.equal(Math.round(vpcFit(ex.vpc).fit * 100), 83);
const back = await decodeShare(await encodeShare(ex));
assert.equal(back.personas[0].name, 'Freelance Fiona'); assert.equal(back.vpc.relievers.length, 3); assert.equal(back.market.accounts, '1500000');
console.log('vpc & persona tests passed');

// ---- Business Model Canvas
const {normalizeBmc, bmcSummary, prefillFromIdea} = await import('../src/lib/bmc.js');
const bmc = normalizeBmc({rev: [{text: 'subs', amount: '1000', type: 'bogus'}], cost: [{text: 'rent', amount: '-5', type: 'fixed'}, {text: 'ads', amount: '300', type: 'variable'}], vp: [{text: 'x', validated: 1, color: 'neon'}]});
assert.equal(bmc.rev[0].type, 'subscription'); assert.equal(bmc.cost[0].amount, ''); assert.equal(bmc.vp[0].color, 'yellow');
const bsum = bmcSummary(bmc);
assert.equal(bsum.filled, 3); assert.equal(bsum.revenue, 1000); assert.equal(bsum.costs, 300); assert.equal(bsum.profit, 700); assert.equal(bsum.validated, 1);
const exB = bmcSummary(ex.bmc);
assert.equal(exB.filled, 9); assert.equal(exB.profit, 10260 - 8400);
const pf = prefillFromIdea(normalize({...EXAMPLE, bmc: {}}));
assert.ok(pf.added >= 5); assert.equal(pf.bmc.cs.length, 2);
assert.equal(prefillFromIdea({...ex, bmc: pf.bmc}).added, 0); // idempotent
console.log('bmc tests passed');
