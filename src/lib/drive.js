// Save an idea to the user's Google Drive, straight from the browser.
// Uses Google Identity Services for a short-lived access token with the drive.file
// scope, so the app can only see files it created itself. Nothing passes through a
// server of ours: the browser talks to Google directly, and only when the user clicks.
import {slug} from './store.js';

export const FOLDER_NAME = 'Idea Evaluator';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
const KEY = 'idea-evaluator:drive';

let gisPromise = null;
let token = null; // {value, expires}

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        gisPromise = null;
        reject(new Error('Could not load Google Sign-In. Check your connection or ad blocker.'));
      };
      document.head.appendChild(s);
    });
  }
  return gisPromise;
}

async function getToken(clientId) {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (res) => {
        if (res.error) return reject(new Error(res.error_description || res.error));
        token = {value: res.access_token, expires: Date.now() + Number(res.expires_in || 3600) * 1000};
        resolve(token.value);
      },
      error_callback: (err) => reject(new Error(err?.type === 'popup_closed' ? 'Google sign-in was closed.' : err?.message || 'Google sign-in failed.')),
    });
    client.requestAccessToken();
  });
}

// Remembers the Drive folder and the file ids for each idea, so a second save updates
// the same Doc and JSON instead of piling up copies.
function loadMap() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function saveMap(map) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // Without storage the next save creates new files; still better than failing.
  }
}

async function call(t, url, opts = {}) {
  const res = await fetch(url, {...opts, headers: {Authorization: `Bearer ${t}`, ...(opts.headers || {})}});
  if (res.status === 401) token = null;
  if (!res.ok) {
    const err = new Error(`Google Drive error ${res.status}`);
    err.status = res.status;
    try {
      err.message = (await res.json()).error?.message || err.message;
    } catch {
      // keep the generic message
    }
    throw err;
  }
  return res.json();
}

async function folderId(t, map) {
  if (map.folder) {
    try {
      const f = await call(t, `${API}/${map.folder}?fields=id,trashed`);
      if (!f.trashed) return f.id;
    } catch (e) {
      if (e.status !== 404) throw e;
    }
  }
  const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const found = await call(t, `${API}?q=${q}&fields=files(id)&spaces=drive`);
  const id = found.files?.[0]?.id
    || (await call(t, `${API}?fields=id`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder'}),
    })).id;
  map.folder = id;
  return id;
}

// Creates the file, or overwrites it in place when we already have its id.
async function upsert(t, existingId, meta, body, contentType) {
  const boundary = `ie${Math.random().toString(36).slice(2)}`;
  const send = (method, url, m) => call(t, url, {
    method,
    headers: {'Content-Type': `multipart/related; boundary=${boundary}`},
    body: `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(m)}\r\n`
      + `--${boundary}\r\nContent-Type: ${contentType}; charset=UTF-8\r\n\r\n${body}\r\n--${boundary}--`,
  });
  if (existingId) {
    try {
      const {parents, ...rest} = meta;
      const f = await send('PATCH', `${UPLOAD}/${existingId}?uploadType=multipart&fields=id,trashed,webViewLink`, {name: rest.name});
      if (!f.trashed) return f;
    } catch (e) {
      if (e.status !== 404) throw e;
    }
  }
  return send('POST', `${UPLOAD}?uploadType=multipart&fields=id,webViewLink`, meta);
}

// Writes "<name>" as a Google Doc (converted from the Markdown report) and
// "<name>.json" as a re-importable backup, both in the Idea Evaluator folder.
export async function saveToDrive(clientId, idea, markdown) {
  const t = await getToken(clientId);
  const map = loadMap();
  const parent = await folderId(t, map);
  const prev = map.ideas?.[idea.id] || {};
  const doc = await upsert(t, prev.doc, {name: idea.name, mimeType: 'application/vnd.google-apps.document', parents: [parent]}, markdown, 'text/markdown');
  const json = await upsert(t, prev.json, {name: `${slug(idea.name)}.json`, mimeType: 'application/json', parents: [parent]},
    JSON.stringify({version: 1, ideas: [idea]}, null, 2), 'application/json');
  map.ideas = {...(map.ideas || {}), [idea.id]: {doc: doc.id, json: json.id}};
  saveMap(map);
  return {docUrl: doc.webViewLink, updated: Boolean(prev.doc && prev.doc === doc.id)};
}
