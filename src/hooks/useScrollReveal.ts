// ============================================================================
// iQuire — useScrollReveal hook
// ============================================================================

import { useEffect, useRef } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>({
  threshold = 0.08,
  once = true,
  rootMargin = '0px 0px -40px 0px',
}: UseScrollRevealOptions = {}) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      return;
    }

    // Fallback if IntersectionObserver is unavailable
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return ref;
};