'use client';

import { useEffect, useState } from 'react';

interface State<T> {
  data: T | null;
  demo: boolean;
  notice?: string;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches one of the /api/dashboard/* endpoints, carrying through the
 * `demo` flag so pages can surface where their numbers came from.
 * Includes auth token from localStorage.
 * 
 * Handles multiple response formats:
 * - { success: true, data: [...] }
 * - { agents: [...] }
 * - { trades: [...] }
 * - { holdings: [...] }
 * - { skills: [...] }
 * - Direct array [...] or object {...}
 */
export function useData<T>(path: string): State<T> {
  const [state, setState] = useState<State<T>>({
    data: null,
    demo: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const token = typeof window !== 'undefined' ? localStorage.getItem('bullclaw_token') : null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(path, { headers })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        return body;
      })
      .then((body) => {
        if (cancelled) return;
        
        // Extract data from various response formats
        let data: T | null = null;
        
        if (body.data !== undefined) {
          // Standard format: { success: true, data: [...] }
          data = body.data;
        } else if (body.agents !== undefined) {
          // Agents format: { agents: [...] }
          data = body.agents as T;
        } else if (body.trades !== undefined) {
          // Trades format: { trades: [...] }
          data = body.trades as T;
        } else if (body.holdings !== undefined) {
          // Holdings format: { holdings: [...] }
          data = body.holdings as T;
        } else if (body.skills !== undefined) {
          // Skills format: { skills: [...] }
          data = body.skills as T;
        } else if (body.listings !== undefined) {
          // Listings format: { listings: [...] }
          data = body.listings as T;
        } else if (body.stats !== undefined) {
          // Stats format: { stats: {...} }
          data = body.stats as T;
        } else if (Array.isArray(body)) {
          // Direct array
          data = body as T;
        } else if (typeof body === 'object' && body !== null) {
          // Direct object (like stats)
          data = body as T;
        }
        
        setState({
          data,
          demo: Boolean(body.demo),
          notice: body.notice,
          loading: false,
          error: null,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ data: null, demo: false, loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
