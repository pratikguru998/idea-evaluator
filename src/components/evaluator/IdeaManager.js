import React, {useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {blankIdea, download, encodeShare, newId, normalize, slug, toMarkdown} from '../../lib/store.js';
import {FOLDER_NAME, saveToDrive} from '../../lib/drive.js';
import {EXAMPLE} from '../../data/example.js';
import {GUMROAD} from '../../data/gumroad.js';

async function copy(text) {
  try {
    // Some browsers leave the promise pending when permission is not granted; give up after 2s.
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
    await Promise.race([navigator.clipboard.writeText(text), timeout]);
    return true;
  } catch {
    return false;
  }
}

export default function IdeaManager({ideas, active, r, actions, setNotice}) {
  const fileRef = useRef(null);
  const {addIdea, select, remove, replaceAll} = actions;
  const clientId = useDocusaurusContext().siteConfig.customFields.googleClientId;
  const [saving, setSaving] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#share=${await encodeShare(active)}`;
    setNotice((await copy(url)) ? 'Share link copied. The idea lives inside the link, so anyone who opens it gets a copy.' : `Copy this link: ${url}`);
  };
  const copyMd = async () => setNotice((await copy(toMarkdown(active, r))) ? 'Markdown report copied to clipboard.' : 'Clipboard blocked. Use “Download .md” instead.');
  const drive = async () => {
    if (!clientId) {
      setNotice('Save to Google Drive needs a Google OAuth client ID. Set GOOGLE_CLIENT_ID when building (see the README).');
      return;
    }
    setSaving(true);
    try {
      const {docUrl, updated} = await saveToDrive(clientId, active, toMarkdown(active, r));
      setNotice(<>{updated ? 'Updated' : 'Saved'} “{active.name}” in your Google Drive folder “{FOLDER_NAME}” (Google Doc + JSON backup). <a href={docUrl} target="_blank" rel="noreferrer">Open the Doc ↗</a></>);
    } catch (e) {
      setNotice(`Could not save to Google Drive: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };
  const exportJson = () => download('idea-evaluator-backup.json', JSON.stringify({version: 1, ideas}, null, 2), 'application/json');
  const importJson = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      try {
        const data = JSON.parse(text);
        const list = (Array.isArray(data) ? data : data.ideas || [data]).map((i) => normalize({...i, id: newId()}));
        if (!list.length) throw new Error('empty');
        if (window.confirm(`Import ${list.length} idea(s)?\n\nOK = add them to your current ideas\nCancel = abort`)) {
          replaceAll([...ideas, ...list]);
          setNotice(`Imported ${list.length} idea(s).`);
        }
      } catch {
        setNotice('That file is not a valid Idea Evaluator export.');
      }
    });
  };

  return (
    <div className="ie-card ie-manager no-print">
      <div className="ie-manager-row">
        <label className="ie-small" htmlFor="ie-pick">Idea</label>
        <select id="ie-pick" className="ie-input ie-select" value={active.id} onChange={(e) => select(e.target.value)}>
          {ideas.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <button type="button" className="ie-btn" onClick={() => addIdea(blankIdea(`Idea ${ideas.length + 1}`))}>＋ New</button>
        <button type="button" className="ie-btn" onClick={() => addIdea({...active, id: newId(), name: `${active.name} (copy)`, updated: Date.now()})}>⧉ Duplicate</button>
        <button type="button" className="ie-btn" onClick={() => addIdea(normalize({...EXAMPLE, id: newId()}))}>✨ Example</button>
        <button type="button" className="ie-btn" title="Case study: Gumroad, fully filled in including the Business Model Canvas"
          onClick={() => addIdea(normalize({...GUMROAD, id: newId()}))}>🛍 Gumroad case study</button>
        <button type="button" className="ie-btn ie-btn-danger"
          onClick={() => window.confirm(`Delete “${active.name}” from this browser?`) && remove(active.id)}>🗑 Delete</button>
        {ideas.length > 1 && <Link className="ie-btn" to="/compare">⚖️ Compare</Link>}
      </div>
      <div className="ie-manager-row">
        <span className="ie-small">Export</span>
        <button type="button" className="ie-btn" onClick={share}>🔗 Share link</button>
        <button type="button" className="ie-btn" onClick={copyMd}>📋 Copy Markdown</button>
        <button type="button" className="ie-btn" onClick={() => download(`${slug(active.name)}.md`, toMarkdown(active, r), 'text/markdown')}>⬇ Download .md</button>
        <button type="button" className="ie-btn" onClick={drive} disabled={saving}
          title={`Save as a Google Doc plus a JSON backup in the “${FOLDER_NAME}” folder of your Drive`}>{saving ? '⏳ Saving…' : '☁️ Save to Google Drive'}</button>
        <button type="button" className="ie-btn" onClick={() => window.print()}>🖨 Print / PDF</button>
        <button type="button" className="ie-btn" onClick={exportJson}>💾 Backup JSON</button>
        <button type="button" className="ie-btn" onClick={() => fileRef.current?.click()}>📂 Import JSON</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
      </div>
    </div>
  );
}
