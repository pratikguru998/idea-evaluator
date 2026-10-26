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
