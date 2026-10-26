import React from 'react';
import {BMC_BLOCKS, NOTE_COLORS} from '../../data/bmc.js';
import {bmcSummary, prefillFromIdea} from '../../lib/bmc.js';
import {vpcFit, uid} from '../../lib/vpc.js';
import {money, symbolFor} from '../../lib/frameworks.js';

const HEX = Object.fromEntries(NOTE_COLORS.map((c) => [c.id, c.hex]));

function Note({note, block, currency, onChange, onDelete, readOnly}) {
  const rows = Math.min(6, Math.max(2, Math.ceil((note.text.length || 1) / 26)));
  return (
    <div className={`ie-note-sticky${note.validated ? ' ok' : ''}`} style={{background: HEX[note.color]}}>
      {readOnly ? (
        <div className="ie-note-text">{note.text}</div>
      ) : (
        <textarea rows={rows} value={note.text} placeholder="Type here…" aria-label={`${block.title} note`}
          onChange={(e) => onChange({text: e.target.value})} />
      )}
      {block.money && (readOnly ? (
        (note.amount || note.type) && (
          <div className="ie-note-money">
            {block.types.find((t) => t.id === note.type)?.label}{note.amount ? ` · ${money(Number(note.amount), currency)}/mo` : ''}
          </div>
        )
      ) : (
        <div className="ie-note-money">
          <select value={note.type} onChange={(e) => onChange({type: e.target.value})} aria-label="Type">
            {block.types.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <span>{symbolFor(currency)}</span>
          <input inputMode="decimal" value={note.amount} placeholder="per month" aria-label="Monthly amount"
            onChange={(e) => onChange({amount: e.target.value.replace(/[^0-9.]/g, '').slice(0, 14)})} />
        </div>
      ))}
      {readOnly ? (
        note.validated && <span className="ie-note-badge">✓ validated</span>
      ) : (
        <div className="ie-note-tools">
          {NOTE_COLORS.map((c) => (
            <button key={c.id} type="button" className={`ie-note-color${note.color === c.id ? ' on' : ''}`} style={{background: c.hex}}
              aria-label={`${c.id} note`} onClick={() => onChange({color: c.id})} />
          ))}
          <button type="button" className={`ie-note-val${note.validated ? ' on' : ''}`} title="Mark as validated by evidence"
            onClick={() => onChange({validated: !note.validated})}>{note.validated ? '✓ validated' : 'assumption'}</button>
          <button type="button" className="ie-note-del" aria-label="Delete note" onClick={onDelete}>✕</button>
        </div>
      )}
    </div>
  );
}

// The canvas itself. Editable on the BMC tab, read-only in the report.
export function BmcCanvas({bmc, currency, onChange, readOnly = false}) {
  const setBlock = (id, notes) => onChange({...bmc, [id]: notes});
  return (
    <div className={`ie-bmc${readOnly ? ' ro' : ''}`}>
      {BMC_BLOCKS.map((b) => {
        const notes = readOnly ? bmc[b.id].filter((n) => n.text.trim()) : bmc[b.id];
        return (
          <section key={b.id} className={`ie-bmc-block a-${b.area}`}>
            <header>
              <span className="ie-bmc-title">{b.icon} {b.title}</span>
              {!readOnly && (
                <button type="button" className="ie-bmc-add" aria-label={`Add note to ${b.title}`}
                  onClick={() => setBlock(b.id, [...bmc[b.id], {id: uid(), text: '', color: 'yellow', validated: false, ...(b.money ? {amount: '', type: b.types[0].id} : {})}])}>＋</button>
              )}
            </header>
            {!notes.length && <div className="ie-bmc-empty">{readOnly ? '—' : b.hint}</div>}
            {!readOnly && !notes.length && (
              <ul className="ie-bmc-prompts">{b.prompts.map((p) => <li key={p}>{p}</li>)}</ul>
            )}
            <div className="ie-bmc-notes">
              {notes.map((n) => (
                <Note key={n.id} note={n} block={b} currency={currency} readOnly={readOnly}
                  onChange={(patch) => setBlock(b.id, bmc[b.id].map((x) => (x.id === n.id ? {...x, ...patch} : x)))}
                  onDelete={() => setBlock(b.id, bmc[b.id].filter((x) => x.id !== n.id))} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function BmcEconomics({s, currency}) {
  if (!s.hasMoney) return null;
  const max = Math.max(s.revenue, s.costs, 1);
  return (
    <div className="ie-bmc-econ">
      <div className="ie-mbar"><span className="ie-mbar-label">Revenue</span><div className="ie-mbar-track"><div className="ie-mbar-fill" style={{width: `${(s.revenue / max) * 100}%`, background: 'var(--ie-good)'}} /></div><span className="ie-mbar-val">{money(s.revenue, currency)}</span></div>
      <div className="ie-mbar"><span className="ie-mbar-label">Costs</span><div className="ie-mbar-track"><div className="ie-mbar-fill" style={{width: `${(s.costs / max) * 100}%`, background: 'var(--ie-bad)'}} /></div><span className="ie-mbar-val">{money(s.costs, currency)}</span></div>
      <div className="ie-small">
        Monthly {s.profit >= 0 ? 'profit' : 'loss'}: <b className={s.profit >= 0 ? 't-good' : 't-bad'}>{money(Math.abs(s.profit), currency)}</b>
        {s.revenue > 0 && <> · margin {Math.round((s.profit / s.revenue) * 100)}%</>}
        {s.fixed > 0 && <> · fixed costs {money(s.fixed, currency)}/mo</>}
      </div>
    </div>
  );
}

export default function BusinessModel({idea, update, setNotice}) {
  const bmc = idea.bmc;
  const s = bmcSummary(bmc);
  const cur = idea.market.currency;
  const fit = vpcFit(idea.vpc);
  const prefill = () => {
    const {bmc: next, added} = prefillFromIdea(idea);
    update({bmc: next});
    setNotice?.(added ? `Added ${added} note(s) from your personas, value proposition, and market tabs.` : 'Nothing new to import. The canvas already has what the other tabs know.');
  };

  return (
    <>
      <div className="ie-card">
        <div className="ie-card-head">
          <div>
            <h2 className="ie-h2">Business Model Canvas</h2>
            <p className="ie-small ie-m0">
              Nine building blocks that describe how the business creates, delivers and captures value (Osterwalder & Pigneur, <i>Business Model Generation</i>).
              Add sticky notes, colour-code them by customer segment, and mark each one <b>✓ validated</b> once you have evidence.
            </p>
          </div>
          <button type="button" className="ie-btn ie-btn-primary no-print" onClick={prefill}>✨ Pre-fill from other tabs</button>
        </div>
        <div className="ie-kpis">
          <div className="ie-kpi"><span className="ie-small">Blocks filled</span><b className={`t-${s.filled === 9 ? 'good' : s.filled >= 6 ? 'ok' : 'warn'}`}>{s.filled}<small>/9</small></b><span className="ie-kpi-sub">{s.notes} notes</span></div>
          <div className="ie-kpi"><span className="ie-small">Validated</span><b className={`t-${s.validatedPct >= 0.6 ? 'good' : s.validatedPct >= 0.3 ? 'ok' : 'warn'}`}>{Math.round(s.validatedPct * 100)}%</b><span className="ie-kpi-sub">{s.validated} of {s.notes} notes backed by evidence</span></div>
          <div className="ie-kpi"><span className="ie-small">Monthly result</span><b className={s.hasMoney ? (s.profit >= 0 ? 't-good' : 't-bad') : 't-none'}>{s.hasMoney ? `${s.profit < 0 ? '−' : ''}${money(Math.abs(s.profit), cur)}` : '–'}</b><span className="ie-kpi-sub">{s.hasMoney ? 'revenue − costs' : 'add amounts to revenue/cost notes'}</span></div>
          <div className="ie-kpi"><span className="ie-small">VP ↔ segment fit</span><b className="t-ok">{fit.fit == null ? '–' : `${Math.round(fit.fit * 100)}%`}</b><span className="ie-kpi-sub">from the Value Proposition Canvas</span></div>
        </div>
        {s.warnings.map((w) => <div key={w} className="ie-warn">⚠️ {w}</div>)}
      </div>

      <BmcCanvas bmc={bmc} currency={cur} onChange={(next) => update({bmc: next})} />

      <div className="ie-grid-2 ie-mt">
        <div className="ie-card">
          <h3>💵 Economics</h3>
          {s.hasMoney ? <BmcEconomics s={s} currency={cur} /> : <p className="ie-small">Give revenue and cost notes a monthly amount to see profit, margin and fixed costs. The currency follows the TAM · SAM · SOM tab.</p>}
        </div>
        <div className="ie-card">
          <h3>🧭 How to read the canvas</h3>
          <ul className="ie-prompts ie-m0">
            <li><b>Right side</b> (segments, channels, relationships, revenue) is about <b>value and customers</b>.</li>
            <li><b>Left side</b> (partners, activities, resources, costs) is about <b>efficiency and delivery</b>.</li>
            <li><b>Value propositions</b> sit in the middle and connect both sides.</li>
            <li>Use one note colour per customer segment to see which blocks serve which segment.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
