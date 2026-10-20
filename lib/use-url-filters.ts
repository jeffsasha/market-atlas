'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Filter state mirrored into the query string so a filtered view can be shared or restored.
 * Defaults are omitted from the URL; the hash (for example #discover) is preserved.
 */
export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
  const initial = useRef(defaults);
  const [filters, setFilters] = useState<T>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restored = { ...initial.current };
    for (const key of Object.keys(restored) as (keyof T & string)[]) {
      const value = params.get(key);
      if (value !== null) restored[key] = value as T[typeof key];
    }
    setFilters(restored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== initial.current[key]) params.set(key, value);
      else params.delete(key);
    }
    const search = params.toString();
    const next = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, '', next);
  }, [filters, ready]);

  const update = useCallback((patch: Partial<T>) => setFilters(previous => ({ ...previous, ...patch })), []);
  const reset = useCallback(() => setFilters(initial.current), []);
  const changed = (Object.keys(defaults) as (keyof T)[]).some(key => filters[key] !== initial.current[key]);
  return { filters, update, reset, changed };
}
