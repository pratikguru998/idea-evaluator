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
