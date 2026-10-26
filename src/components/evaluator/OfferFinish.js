import React from 'react';
import {SCARCITY, URGENCY, GUARANTEES, BONUS_FORMATS, MAGIC, CONTAINERS} from '../../data/offer.js';
import {offerStrength, stackSummary, offerName} from '../../lib/offer.js';
import {uid} from '../../lib/vpc.js';
import {money, symbolFor} from '../../lib/frameworks.js';
import {useOffer, StepIntro} from './OfferSteps.js';

// ---------- 6. Enhance ----------
export function OfferEnhance({idea, update}) {
  const o = idea.offer;
  const setO = useOffer(update);
  const cur = idea.market.currency;
  const st = stackSummary(o);
  const primary = idea.personas.find((p) => p.primary) || idea.personas[0];
  const setB = (id, patch) => setO((c) => ({bonuses: c.bonuses.map((b) => (b.id === id ? {...b, ...patch} : b))}));
  const setN = (id, patch) => setO((c) => ({names: c.names.map((n) => (n.id === id ? {...n, ...patch} : n))}));
  const trainingHeavy = o.bonuses.filter((b) => b.name.trim()).length >= 2 && o.bonuses.filter((b) => b.format === 'training').length > o.bonuses.length / 2;
  const newName = () => setO((c) => ({names: [...c.names, {
    id: uid(), fav: c.names.length === 0, magnetic: '', avatar: primary?.role || primary?.name || '', goal: '', interval: '', container: '',
  }]}));
  const g = o.guarantee;
  const guaranteeText = g.type === 'anti' ? 'All sales are final.'
    : g.condition || g.remedy ? `If ${g.condition || '…'}, we will ${g.remedy || '…'}.` : '';

  return (
    <>
      <StepIntro title="Step 6 · Enhance the offer">
        Five levers make a good offer irresistible: <b>scarcity</b> (limit the supply), <b>urgency</b> (a reason to act now), <b>bonuses</b> (add value instead of discounting),
        a <b>guarantee</b> (move the risk onto you), and a <b>name</b> that grabs the right people. Keep scarcity and urgency honest. Fake deadlines destroy trust.
      </StepIntro>

      <div className="ie-grid-2">
        <div className="ie-card">
          <h3>⏳ Scarcity: limit the supply</h3>
          <select className="ie-input" value={o.scarcity.type} onChange={(e) => setO((c) => ({scarcity: {...c.scarcity, type: e.target.value}}))}>
            {SCARCITY.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <input className="ie-input ie-mt-sm" value={o.scarcity.detail} placeholder="e.g. Only 20 founding members per month, because each one gets a personal setup call"
            onChange={(e) => setO((c) => ({scarcity: {...c.scarcity, detail: e.target.value}}))} />
          <p className="ie-small">Tell them the real reason for the limit: capacity, quality, or your time.</p>
        </div>
        <div className="ie-card">
          <h3>🔔 Urgency: a reason to act now</h3>
          <select className="ie-input" value={o.urgency.type} onChange={(e) => setO((c) => ({urgency: {...c.urgency, type: e.target.value}}))}>
            {URGENCY.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <input className="ie-input ie-mt-sm" value={o.urgency.detail} placeholder="e.g. Next cohort starts 1 March; founding price ends Friday"
            onChange={(e) => setO((c) => ({urgency: {...c.urgency, detail: e.target.value}}))} />
          <p className="ie-small">Rolling cohorts and seasonal promotions create real, repeatable deadlines.</p>
        </div>
      </div>

      <div className="ie-card">
        <div className="ie-card-head">
          <h3>🎁 Bonuses</h3>
          <button type="button" className="ie-btn ie-btn-primary" onClick={() => setO((c) => ({bonuses: [...c.bonuses, {id: uid(), name: '', detail: '', problemId: '', format: 'tool', worth: ''}]}))}>＋ Bonus</button>
        </div>
        <p className="ie-small">
          Each bonus should <b>kill a specific doubt</b> or solve the next problem they will hit. Give it a benefit-driven name and a believable price tag.
          Tools and checklists beat extra training because they take less time and effort. Add bonuses instead of discounting.
        </p>
        <div className="ie-bonuses">
          {o.bonuses.map((b, i) => (
            <div key={b.id} className="ie-bonus">
              <div className="ie-bonus-head"><b>Bonus #{i + 1}</b><button type="button" className="ie-x" aria-label="Remove bonus" onClick={() => setO((c) => ({bonuses: c.bonuses.filter((x) => x.id !== b.id)}))}>✕</button></div>
              <input className="ie-input" value={b.name} placeholder="Name with a benefit, e.g. “The 5-Minute Receipt Snapper”" onChange={(e) => setB(b.id, {name: e.target.value})} />
              <div className="ie-item-meta ie-item-meta-left">
                <select className="ie-input ie-select ie-select-xs" value={b.format} onChange={(e) => setB(b.id, {format: e.target.value})}>
                  {BONUS_FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
                <select className="ie-input ie-select ie-select-xs" value={b.problemId} onChange={(e) => setB(b.id, {problemId: e.target.value})}>
                  <option value="">Kills which doubt?</option>
                  {o.problems.filter((p) => p.text.trim()).map((p) => <option key={p.id} value={p.id}>{p.text.slice(0, 50)}</option>)}
                </select>
                <span className="ie-affix"><em>{symbolFor(cur)}</em><input className="ie-input ie-input-sm" inputMode="decimal" value={b.worth} placeholder="worth" onChange={(e) => setB(b.id, {worth: e.target.value.replace(/[^0-9.]/g, '')})} /></span>
              </div>
              <textarea className="ie-input" rows={2} value={b.detail} placeholder="What it is, how it makes things faster or easier, proof it works" onChange={(e) => setB(b.id, {detail: e.target.value})} />
            </div>
          ))}
        </div>
        <div className={`ie-goal t-${st.bonusValue >= st.coreValue && st.bonusValue > 0 ? 'good' : 'warn'}`}>
          <div>Core stack {money(st.coreValue, cur)} · bonuses {money(st.bonusValue, cur)}</div>
          <div className="ie-small">{st.bonusValue >= st.coreValue && st.bonusValue > 0 ? '✓ Bonus value exceeds the core, which makes the core feel even more valuable.' : 'Aim for bonuses worth more than the core offer.'}</div>
        </div>
        {trainingHeavy && <div className="ie-warn">⚠️ Most bonuses are training. Turn some into tools, templates or done-for-you items: same value, less effort for the customer.</div>}
      </div>

      <div className="ie-card">
        <h3>🛡️ Guarantee: reverse the risk</h3>
        <div className="ie-form-grid">
          <label className="ie-field"><span>Type</span>
            <select className="ie-input" value={g.type} onChange={(e) => setO((c) => ({guarantee: {...c.guarantee, type: e.target.value}}))}>
              {GUARANTEES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </label>
          <label className="ie-field"><span>Give it a vivid name</span>
            <input className="ie-input" value={g.name} placeholder="e.g. The “Taxes Done or It’s Free” Promise" onChange={(e) => setO((c) => ({guarantee: {...c.guarantee, name: e.target.value}}))} />
          </label>
          {g.type !== 'anti' && (
            <>
              <label className="ie-field"><span>If… (condition, measurable and time-bound)</span>
                <input className="ie-input" value={g.condition} placeholder="you don’t have tax-ready books within 30 days" onChange={(e) => setO((c) => ({guarantee: {...c.guarantee, condition: e.target.value}}))} />
              </label>
              <label className="ie-field"><span>…we will (remedy)</span>
                <input className="ie-input" value={g.remedy} placeholder="refund every cent and pay for your accountant" onChange={(e) => setO((c) => ({guarantee: {...c.guarantee, remedy: e.target.value}}))} />
              </label>
            </>
          )}
        </div>
        {g.type === 'anti' && <p className="ie-small">State the reason sales are final, e.g. you hand over proprietary templates immediately.</p>}
        {guaranteeText && <div className="ie-guarantee">🛡️ {g.name && <b>{g.name}: </b>}{guaranteeText}</div>}
        <p className="ie-small">Conditional guarantees that are “better than money back” often convert best, and the conditions push buyers to do what gets results. Stack several for more effect.</p>
      </div>

      <div className="ie-card">
        <div className="ie-card-head">
          <h3>🏷️ Name it with MAGIC</h3>
          <button type="button" className="ie-btn ie-btn-primary" onClick={newName} disabled={o.names.length >= 10}>＋ Name idea</button>
        </div>
        <div className="ie-magic-legend">
          {MAGIC.map((m) => <span key={m.id}><b>{m.letter}</b> {m.title} <i className="ie-small">({m.eg})</i></span>)}
        </div>
        {o.names.map((n) => (
          <div key={n.id} className={`ie-adlib${n.fav ? ' fav' : ''}`}>
            <p className="ie-adlib-text">{offerName(n) || <span className="ie-small">Fill in the parts below…</span>}</p>
            <div className="ie-adlib-fields">
              {MAGIC.map((m) => (
                <label key={m.id}><span>{m.letter} · {m.title}</span>
                  {m.id === 'container' ? (
                    <>
                      <input className="ie-input" list={`ie-containers-${n.id}`} value={n.container} onChange={(e) => setN(n.id, {container: e.target.value})} />
                      <datalist id={`ie-containers-${n.id}`}>{CONTAINERS.map((c) => <option key={c} value={c} />)}</datalist>
                    </>
                  ) : <input className="ie-input" value={n[m.id]} onChange={(e) => setN(n.id, {[m.id]: e.target.value})} />}
                </label>
              ))}
            </div>
            <div className="ie-row-tools">
              <button type="button" className="ie-link" onClick={() => setO((c) => ({names: c.names.map((x) => ({...x, fav: x.id === n.id}))}))}>{n.fav ? '★ Chosen name' : '☆ Choose this name'}</button>
              <button type="button" className="ie-link" onClick={() => setO((c) => ({names: c.names.filter((x) => x.id !== n.id)}))}>Delete</button>
            </div>
          </div>
        ))}
        <p className="ie-small">You don’t need all five words in the final name, but trying all five first gives you better options. Rename the same offer when response drops.</p>
      </div>
    </>
  );
}

// ---------- 7. The finished offer ----------
export function offerPlainText(idea) {
  const o = idea.offer;
  const os = offerStrength(o);
  const cur = idea.market.currency;
  const st = os.stack;
  const L = [];
  L.push(os.name ? offerName(os.name) : idea.name);
  if (o.dream) L.push('', o.dream);
  L.push('', 'WHAT YOU GET');
  st.items.forEach((v) => L.push(`✅ ${v.text}${v.worth ? ` (value ${money(Number(v.worth), cur)})` : ''}`));
  o.bonuses.filter((b) => b.name.trim()).forEach((b) => L.push(`🎁 BONUS: ${b.name}${b.worth ? ` (value ${money(Number(b.worth), cur)})` : ''}`));
  if (st.total) L.push('', `Total value: ${money(st.total, cur)}`);
  if (st.price) L.push(`Your price: ${money(st.price, cur)}`);
  const g = o.guarantee;
  if (g.type) L.push('', `🛡️ ${g.name ? `${g.name}: ` : ''}${g.type === 'anti' ? 'All sales are final.' : `If ${g.condition}, we will ${g.remedy}.`}`);
  if (o.scarcity.detail) L.push(`⏳ ${o.scarcity.detail}`);
  if (o.urgency.detail) L.push(`🔔 ${o.urgency.detail}`);
  return L.join('\n');
}

export function OfferOnePager({idea}) {
  const o = idea.offer;
  const os = offerStrength(o);
  const cur = idea.market.currency;
  const st = os.stack;
  const g = o.guarantee;
  return (
    <div className="ie-offer">
      <div className="ie-offer-head">
        <div className="ie-small ie-offer-kicker">{idea.name}</div>
        <h2>{os.name && offerName(os.name) ? offerName(os.name) : 'Name your offer in step 6'}</h2>
        {o.dream && <p className="ie-offer-dream">{o.dream}</p>}
      </div>
      <div className="ie-offer-body">
        <h4>What you get</h4>
        <ul className="ie-offer-list">
          {st.items.map((v) => <li key={v.id}><span>✅ {v.text}</span><b>{v.worth ? money(Number(v.worth), cur) : ''}</b></li>)}
          {o.bonuses.filter((b) => b.name.trim()).map((b) => <li key={b.id} className="bonus"><span>🎁 <i>Bonus:</i> {b.name}</span><b>{b.worth ? money(Number(b.worth), cur) : ''}</b></li>)}
          {!st.items.length && <li className="ie-small">Add items to the stack in step 5.</li>}
        </ul>
        {st.total > 0 && (
          <div className="ie-offer-price">
            <div><span className="ie-small">Total value</span><s>{money(st.total, cur)}</s></div>
            {st.price > 0 && <div><span className="ie-small">Your price</span><b>{money(st.price, cur)}</b></div>}
            {st.ratio != null && <div><span className="ie-small">Value ÷ price</span><b className={st.ratio >= 10 ? 't-good' : 't-warn'}>{st.ratio.toFixed(1)}×</b></div>}
          </div>
        )}
        {g.type && (
          <div className="ie-guarantee">🛡️ {g.name && <b>{g.name}: </b>}{g.type === 'anti' ? 'All sales are final.' : `If ${g.condition || '…'}, we will ${g.remedy || '…'}.`}</div>
        )}
        {(o.scarcity.detail || o.urgency.detail) && (
          <div className="ie-offer-fomo">
            {o.scarcity.detail && <span>⏳ {o.scarcity.detail}</span>}
            {o.urgency.detail && <span>🔔 {o.urgency.detail}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function OfferFinal({idea, goTo, setNotice, phase1}) {
  const os = offerStrength(idea.offer);
  const copy = async () => {
    try {
      await Promise.race([navigator.clipboard.writeText(offerPlainText(idea)), new Promise((_, r) => setTimeout(() => r(new Error('t')), 2000))]);
      setNotice?.('Offer copied as plain text, ready for a sales page, DM or email.');
    } catch {
      setNotice?.('Clipboard blocked. Use Download .md in the toolbar above instead.');
    }
  };
  return (
    <>
      <StepIntro title="Step 7 · Your Grand Slam Offer">
        Here is everything assembled into one offer. Fix the open items in the checklist, then test it on real prospects. The name and the stack are the parts most worth A/B testing.
      </StepIntro>
      {phase1 && phase1.verdict && ['weak', 'rethink'].includes(phase1.verdict.key) && (
        <div className="ie-warn">⚠️ Phase 1 verdict is “{phase1.verdict.label}”. A great offer can’t fix a market that doesn’t want the product, so revisit validation first.</div>
      )}
      <div className="ie-offer-layout">
        <OfferOnePager idea={idea} />
        <div className="ie-card">
          <div className="ie-gauge">
            <div className={`ie-overall-num t-${os.passed >= 11 ? 'good' : os.passed >= 8 ? 'ok' : os.passed >= 5 ? 'warn' : 'bad'}`}>{os.passed}<small>/{os.total}</small></div>
            <b>{os.label}</b>
          </div>
          <ul className="ie-checklist">
            {os.checks.map((c) => (
              <li key={c.id} className={c.ok ? 'ok' : ''}>
                <span>{c.ok ? '✅' : '⬜'}</span>
                <span>{c.label}</span>
                {!c.ok && <button type="button" className="ie-link no-print" onClick={() => goTo(c.step)}>fix →</button>}
              </li>
            ))}
          </ul>
          <button type="button" className="ie-btn ie-btn-primary ie-block no-print" onClick={copy}>📋 Copy offer as text</button>
        </div>
      </div>
    </>
  );
}
