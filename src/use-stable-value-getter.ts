import { useRef, useCallback, useEffect, useLayoutEffect } from 'react';

// https://github.com/reduxjs/react-redux/blob/0f1ab0960c38ac61b4fe69285a5b401f9f6e6177/src/utils/useIsomorphicLayoutEffect.js
// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed
const useUniversalLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect;

export function useStableValueGetter<T>(value: T): () => T {
  const ref = useRef(value);

  useUniversalLayoutEffect(() => {
    ref.current = value;
  }, [value]);

  const stableValueGetter = useCallback(() => {
    return ref.current;
  }, []);

  return stableValueGetter;
}
