import {useCallback, useEffect, useState} from 'react';
import {blankIdea, decodeShare, loadState, saveState} from './store.js';

// Holds every saved idea plus the active one. Hydrates from localStorage (and an
// optional #share= link) after mount, so the static HTML renders without storage.
export default function useIdeas({acceptShare = false} = {}) {
  const [state, setState] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let s = loadState();
    if (!s) {
      const first = blankIdea('My business idea');
      s = {ideas: [first], activeId: first.id};
    }
    if (acceptShare) {
      const m = window.location.hash.match(/^#share=(.+)$/);
      if (m) {
        const shared = decodeShare(m[1]);
        if (shared) {
          shared.name = `${shared.name} (shared)`;
          s = {ideas: [...s.ideas, shared], activeId: shared.id};
          setNotice(`Imported shared idea “${shared.name}”. It is now saved in this browser.`);
        } else {
          setNotice('That share link could not be read.');
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    if (!s.ideas.some((i) => i.id === s.activeId)) s.activeId = s.ideas[0].id;
    setState(s);
  }, [acceptShare]);

  useEffect(() => {
    if (state && !saveState(state)) setNotice('Your browser blocked storage, so changes will not survive a reload. Use Export to keep them.');
  }, [state]);

  const active = state ? state.ideas.find((i) => i.id === state.activeId) : null;

  const updateActive = useCallback((fn) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.map((i) => (i.id === s.activeId ? {...i, ...(typeof fn === 'function' ? fn(i) : fn), updated: Date.now()} : i)),
    }));
  }, []);

  const addIdea = useCallback((idea) => setState((s) => ({ideas: [...s.ideas, idea], activeId: idea.id})), []);
  const select = useCallback((id) => setState((s) => ({...s, activeId: id})), []);
  const remove = useCallback((id) => setState((s) => {
    const ideas = s.ideas.filter((i) => i.id !== id);
    if (!ideas.length) ideas.push(blankIdea('My business idea'));
    return {ideas, activeId: s.activeId === id ? ideas[0].id : s.activeId};
  }), []);
  const replaceAll = useCallback((ideas) => setState({ideas, activeId: ideas[0].id}), []);

  return {state, active, notice, setNotice, updateActive, addIdea, select, remove, replaceAll};
}
