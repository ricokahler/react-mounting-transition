import { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStableValueGetter } from './use-stable-value-getter';

/**
 * Used to create a cancelable delay
 */
function delay(signal: AbortSignal, timeout: number) {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Aborted')));
    setTimeout(resolve, timeout);
  });
}

function animationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

type TransitionState =
  | 'enter-begin'
  | 'enter-final'
  | 'exit-begin'
  | 'exit-final';

interface Props {
  /**
   * a render prop that returns props. note: children will not be invoked if
   * `active` is false.
   */
  children: (props: {
    /**
     * used to precisely apply CSS classes for different transition in and out
     * states
     */
    state: TransitionState;
    /**
     * equivalent to `state === 'exit-end'`
     */
    active: boolean;
  }) => JSX.Element | null;
  /**
   * Determines if the children will be mounted to the DOM
   */
  mounted: boolean;
  /**
   * The time it takes for the animation to end. After this timeout, the element
   * will be removed from the DOM
   */
  timeout: number;
  /**
   * Mounting Transition component can optionally say they want to use a portal.
   * This creates a div when the component becomes mounted. A container class
   * must be provided if a portal is desired
   */
  portal?: {
    containerClass: string;
    elementType?: keyof JSX.IntrinsicElements;
  };
  /**
   * an optional callback that runs when as soon as the component is mounted
   */
  onMount?: () => void;
  /**
   * an optional callback that runs when the exit animation finishes
   */
  onUnmount?: () => void;
}

/**
 * The mounting transition handles transitioning a component into the DOM. The
 * idea behind this one is that when the transition is "inactive"
 * (i.e. active = false), then no DOM element is mounted. This powers the
 * Drawer and Modal components.
 */
export function MountingTransition({
  children,
  mounted,
  timeout,
  portal,
  onMount,
  onUnmount,
}: Props) {
  // entering, active, exiting, inactive
  const [state, setState] = useState<TransitionState>(
    mounted ? 'enter-begin' : 'exit-final',
  );
  const [show, setShow] = useState(mounted);

  useEffect(() => {
    if (mounted) {
      return () => {
        (async () => {
          setState('exit-begin');
          await animationFrame();

          setState('exit-final');
        })();
      };
    }

    const abortController = new AbortController();
    delay(abortController.signal, timeout)
      .then(() => setShow(false))
      .catch(() => {
        // aborted
      });

    return () => {
      (async () => {
        abortController.abort();

        // Each of these happens one tick after the other. These micro-delays
        // are required in order to for the CSS transitions to happen correctly.
        //
        // 1) First mount the container
        setShow(true);
        await animationFrame();

        // 2) Then change the state to `enter-start` briefly
        setState('enter-begin');
        await animationFrame();

        // 3) Then change the state to `enter-end`
        setState('enter-final');
      })();
    };
  }, [mounted, timeout]);

  // we don't want to react to change to `onMount` or `onUnmount` so we wrap
  // with use-stable-value-getter
  const getOnMount = useStableValueGetter(onMount);
  const geOnUnmount = useStableValueGetter(onUnmount);

  useEffect(() => {
    const onMount = getOnMount();
    const onUnmount = geOnUnmount();

    if (show) onMount?.();
    else onUnmount?.();
  }, [show, getOnMount, geOnUnmount]);

  const portalClassName = portal?.containerClass;
  const portalElementType = portal?.elementType || 'div';

  const container = useMemo(() => {
    if (!portalClassName || !show) return;

    const div = document.createElement(portalElementType);
    div.classList.add(portalClassName);
    return div;
  }, [show, portalClassName, portalElementType]);

  useEffect(() => {
    if (!container) return;

    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  const child = useMemo(() => {
    if (!show) return null;
    return children({ state, active: state === 'enter-final' });
  }, [state, show, children]);

  if (!child) return null;
  if (portal) return container && createPortal(child, container);
  return child;
}
