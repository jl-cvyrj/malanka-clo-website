"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from "react";
import { ApiError } from "@/lib/api/client";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  errorStatus: number | null;
}

function messageOf(error: unknown): { message: string; status: number | null } {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status };
  }
  if (error instanceof Error) return { message: error.message, status: null };
  return { message: "Невядомая памылка", status: null };
}

/**
 * Small data-fetching hook for client components (mostly the admin area).
 * Re-runs whenever `deps` change; `reload()` re-runs it on demand.
 */
export function useAsync<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList = [],
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
    errorStatus: null,
  });
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);

  // Keep the latest loader without making it a dependency of the fetch effect.
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState((previous) => ({
      ...previous,
      loading: true,
      error: null,
      errorStatus: null,
    }));

    loaderRef
      .current(controller.signal)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null, errorStatus: null });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        const { message, status } = messageOf(error);
        setState({ data: null, loading: false, error: message, errorStatus: status });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  const setData = useCallback(
    (data: T) => setState({ data, loading: false, error: null, errorStatus: null }),
    [],
  );

  return { ...state, reload, setData };
}
