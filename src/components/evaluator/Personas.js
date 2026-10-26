import React, {useState} from 'react';
import {AVATARS, PERSONA_COLORS, BUYING_ROLES, TRAITS, PERSONA_LISTS} from '../../data/vpc.js';
import {blankPersona, lines, uid} from '../../lib/vpc.js';

// Visual persona "profile card": what the team pins on the wall.
export function PersonaCard({p}) {
  const n = Number(p.interviews) || 0;
  const meta = [p.age && `🎂 ${p.age}`, p.location && `📍 ${p.location}`, p.budget && `💳 ${p.budget}`].filter(Boolean);
  return (
    <article className="ie-persona" style={{'--pc': p.color}}>
      <header className="ie-persona-head">
        <div className="ie-persona-avatar" aria-hidden="true">{p.avatar}</div>
        <div className="ie-persona-id">
          <div className="ie-persona-name">{p.name || 'Unnamed'}{p.primary && <span className="ie-persona-primary">★ primary</span>}</div>
          {p.role && <div className="ie-persona-role">{p.role}</div>}
          {meta.length > 0 && <div className="ie-persona-meta">{meta.map((m) => <span key={m}>{m}</span>)}</div>}
        </div>
      </header>
      <div className="ie-persona-body">
        {p.quote && <blockquote className="ie-persona-quote">“{p.quote}”</blockquote>}
        {p.bio && <p className="ie-persona-bio">{p.bio}</p>}
        {p.roles.length > 0 && (
          <div className="ie-persona-roles">
            {p.roles.map((id) => <span key={id} className="ie-pill-role">{BUYING_ROLES.find((r) => r.id === id).label}</span>)}
          </div>
        )}
        <div className="ie-persona-lists">
          {PERSONA_LISTS.map((l) => {
            const xs = lines(p[l.id]);
            return xs.length ? (
              <section key={l.id}>
                <h4>{l.icon} {l.title}</h4>
                <ul>{xs.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </section>
            ) : null;
          })}
        </div>
        {TRAITS.some((t) => p.traits[t.id]) && (
          <div className="ie-traits">
            {TRAITS.filter((t) => p.traits[t.id]).map((t) => (
              <div key={t.id} className="ie-trait">
                <span>{t.left}</span>
                <div className="ie-trait-track"><div className="ie-trait-dot" style={{left: `${((p.traits[t.id] - 1) / 4) * 100}%`}} /></div>
                <span>{t.right}</span>
              </div>
            ))}
          </div>
        )}
        {p.day && (
          <section className="ie-persona-day">
            <h4>🕒 A day in their life</h4>
            <p>{p.day}</p>
          </section>
        )}
        <div className={`ie-persona-evidence ${n ? 'ok' : 'warn'}`}>
          {n ? `✓ Based on ${n} customer interview${n > 1 ? 's' : ''}` : '⚠️ Assumption-based. Validate with real interviews.'}
        </div>
      </div>
    </article>
  );
}

function Text({label, value, onChange, placeholder, rows, hint}) {
  return (
    <label className="ie-field">
      <span>{label}</span>
      {rows ? (
        <textarea className="ie-input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ie-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <small className="ie-small">{hint}</small>}
    </label>
  );
}

function sendToCanvas(d, p) {
  const vpc = {...d.vpc, personaId: p.id};
  const add = (key, texts, type) => {
    const seen = new Set(vpc[key].map((x) => x.text.trim().toLowerCase()));
    const fresh = texts.filter((t) => !seen.has(t.toLowerCase())).map((text) => ({id: uid(), text, type, weight: 3}));
    vpc[key] = [...vpc[key], ...fresh];
    return fresh.length;
  };
  const added = add('jobs', lines(p.jobs), 'functional') + add('pains', lines(p.frustrations), 'outcome') + add('gains', lines(p.goals), 'desired');
  return {patch: {vpc}, added};
}

export default function Personas({idea, update, goTo, setNotice}) {
  const personas = idea.personas;
  const [selId, setSelId] = useState(personas[0]?.id);
  const sel = personas.find((p) => p.id === selId) || personas[0];

  const setP = (patch) => update((d) => ({personas: d.personas.map((p) => (p.id === sel.id ? {...p, ...patch} : p))}));
  const add = (seed = {}) => {
    const p = {...blankPersona(personas.length + 1), ...seed, primary: personas.length === 0};
    update((d) => ({personas: [...d.personas, p]}));
    setSelId(p.id);
  };
  const remove = () => {
    if (!window.confirm(`Delete persona “${sel.name}”?`)) return;
    update((d) => ({
      personas: d.personas.filter((p) => p.id !== sel.id),
      vpc: d.vpc.personaId === sel.id ? {...d.vpc, personaId: ''} : d.vpc,
    }));
    setSelId(personas.find((p) => p.id !== sel.id)?.id);
  };
  const makePrimary = () => update((d) => ({personas: d.personas.map((p) => ({...p, primary: p.id === sel.id}))}));
  const toCanvas = () => {
    const {patch, added} = sendToCanvas(idea, sel);
    update(patch);
    setNotice?.(`${sel.name} is now the canvas segment. Added ${added} new job(s), pain(s) and gain(s) from the persona.`);
    goTo('vpc');
  };

  return (
    <>
      <div className="ie-card">
        <div className="ie-card-head">
          <div>
            <h2 className="ie-h2">User personas</h2>
            <p className="ie-small ie-m0">
              A persona is a realistic profile of one key customer type, built from interviews rather than imagination.
              Create 1–3 personas, mark the <b>primary</b> one, then send it to the Value Proposition Canvas.
            </p>
          </div>
          <button type="button" className="ie-btn ie-btn-primary" onClick={() => add()}>＋ Add persona</button>
        </div>
        {personas.length > 0 && (
          <div className="ie-persona-tabs">
            {personas.map((p) => (
              <button key={p.id} type="button" className={`ie-persona-chip${p.id === sel?.id ? ' on' : ''}`} style={{'--pc': p.color}} onClick={() => setSelId(p.id)}>
                <span>{p.avatar}</span>{p.name}{p.primary && ' ★'}
              </button>
            ))}
          </div>
        )}
      </div>

      {!sel ? (
        <div className="ie-card ie-empty-state">
          <div className="ie-empty-emoji">🧑‍🤝‍🧑</div>
          <h3>No personas yet</h3>
          <p className="ie-small">Start from your ideal-customer line on the Scorecard, or from a blank card.</p>
          <div className="ie-row-tools" style={{justifyContent: 'center'}}>
            {idea.icp && <button type="button" className="ie-btn ie-btn-primary" onClick={() => add({role: idea.icp.slice(0, 120)})}>Create from ICP</button>}
            <button type="button" className="ie-btn" onClick={() => add()}>Blank persona</button>
          </div>
        </div>
      ) : (
        <div className="ie-persona-layout">
          <div className="ie-card ie-persona-form">
            <div className="ie-persona-actions no-print">
              {!sel.primary && <button type="button" className="ie-btn" onClick={makePrimary}>★ Make primary</button>}
              <button type="button" className="ie-btn" onClick={() => add({...sel, id: uid(), name: `${sel.name} (copy)`, primary: false})}>⧉ Duplicate</button>
              <button type="button" className="ie-btn ie-btn-primary" onClick={toCanvas}>💎 Send to Value Proposition Canvas</button>
              <button type="button" className="ie-btn ie-btn-danger" onClick={remove}>🗑 Delete</button>
            </div>

            <div className="ie-field">
              <span>Avatar & colour</span>
              <div className="ie-avatars">
                {AVATARS.map((a) => (
                  <button key={a} type="button" className={`ie-avatar-opt${sel.avatar === a ? ' on' : ''}`} onClick={() => setP({avatar: a})}>{a}</button>
                ))}
              </div>
              <div className="ie-colors">
                {PERSONA_COLORS.map((c) => (
                  <button key={c} type="button" aria-label={`Colour ${c}`} className={`ie-color-opt${sel.color === c ? ' on' : ''}`} style={{background: c}} onClick={() => setP({color: c})} />
                ))}
              </div>
            </div>

            <div className="ie-form-grid">
              <Text label="Name" value={sel.name} onChange={(v) => setP({name: v})} placeholder="e.g. Freelance Fiona" />
              <Text label="Role / title" value={sel.role} onChange={(v) => setP({role: v})} placeholder="e.g. Solo brand designer" />
              <Text label="Age range" value={sel.age} onChange={(v) => setP({age: v})} placeholder="e.g. 28–40" />
              <Text label="Location" value={sel.location} onChange={(v) => setP({location: v})} placeholder="e.g. Austin, US" />
              <Text label="Budget / willingness to pay" value={sel.budget} onChange={(v) => setP({budget: v})} placeholder="e.g. up to $20/month" />
              <Text label="Interviews this is based on" value={sel.interviews} onChange={(v) => setP({interviews: v.replace(/[^0-9]/g, '').slice(0, 4)})} placeholder="0" />
            </div>
            <Text label="Signature quote" value={sel.quote} onChange={(v) => setP({quote: v})} placeholder="Something they actually said in an interview" />
            <Text label="Background" rows={3} value={sel.bio} onChange={(v) => setP({bio: v})} placeholder="Work situation, context, what a typical week looks like…" />

            <div className="ie-field">
              <span>Role in the purchase</span>
              <div className="ie-picks">
                {BUYING_ROLES.map((r) => {
                  const on = sel.roles.includes(r.id);
                  return (
                    <label key={r.id} className={`ie-pick${on ? ' on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => setP({roles: on ? sel.roles.filter((x) => x !== r.id) : [...sel.roles, r.id]})} />
                      {r.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="ie-form-grid">
              {PERSONA_LISTS.map((l) => (
                <Text key={l.id} label={`${l.icon} ${l.title}`} rows={4} value={sel[l.id]} onChange={(v) => setP({[l.id]: v})}
                  placeholder="One per line" hint={l.hint} />
              ))}
            </div>

            <div className="ie-field">
              <span>Personality & behaviour</span>
              {TRAITS.map((t) => (
                <div key={t.id} className="ie-trait-edit">
                  <span>{t.left}</span>
                  <input type="range" min={1} max={5} step={1} value={sel.traits[t.id] || 3}
                    className={sel.traits[t.id] ? '' : 'unset'} aria-label={`${t.left} to ${t.right}`}
                    onChange={(e) => setP({traits: {...sel.traits, [t.id]: Number(e.target.value)}})} />
                  <span>{t.right}</span>
                  {sel.traits[t.id] && (
                    <button type="button" className="ie-link" onClick={() => {
                      const traits = {...sel.traits};
                      delete traits[t.id];
                      setP({traits});
                    }}>clear</button>
                  )}
                </div>
              ))}
            </div>
            <Text label="🕒 A day in their life" rows={3} value={sel.day} onChange={(v) => setP({day: v})}
              placeholder="Walk through the moment the problem shows up: where they are, what they try, how it feels." />
          </div>

          <div className="ie-persona-preview">
            <div className="ie-small ie-preview-label">Live preview</div>
            <PersonaCard p={sel} />
          </div>
        </div>
      )}
    </>
  );
}
