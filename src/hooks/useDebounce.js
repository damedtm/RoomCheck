import { useRef, useCallback } from 'react';

export default function useDebounce(fn, delay = 2000) {
  const lastCalled = useRef(0);
  const isRunning = useRef(false);

  const debounced = useCallback(async (...args) => {
    const now = Date.now();

    // Block if already running or called too recently
    if (isRunning.current) return;
    if (now - lastCalled.current < delay) return;

    lastCalled.current = now;
    isRunning.current = true;

    try {
      await fn(...args);
    } finally {
      isRunning.current = false;
    }
  }, [fn, delay]);

  return debounced;
}