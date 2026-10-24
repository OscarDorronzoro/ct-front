import { useEffect, useRef } from 'react';

// onOutside() when the user presses outside the element of `ref` (to close a dropdown or a
// menu). enabled: false while it's closed (no listener).
export default function useClickOutside(ref, onOutside, enabled = true) {
  const onOutsideRef = useRef(onOutside);

  useEffect(() => {
    onOutsideRef.current = onOutside;
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handle = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideRef.current();
      }
    };

    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, enabled]);
}
