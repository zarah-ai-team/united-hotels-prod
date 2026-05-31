import { useEffect, useRef } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement>({
  threshold = 0.08,
  rootMargin = "0px 0px -6% 0px",
  once = true,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          target.classList.add("reveal-visible");

          if (once) {
            observer.unobserve(target);
          }
        } else if (!once) {
          target.classList.remove("reveal-visible");
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return ref;
}
