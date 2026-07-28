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

    fetch(path)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        return body;
      })
      .then((body) => {
        if (cancelled) return;
        setState({
          data: body.data,
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
