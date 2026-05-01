import { useEffect, useRef } from "react";

// Translates the element on the Y axis based on its viewport progress.
// `speed` ~= how many pixels of vertical movement per 100% viewport scroll.
//   positive = element drifts upward as you scroll (foreground feel)
//   negative = element drifts downward (background feel — typical hero use)
// Movement is bounded so the element never wanders far from its layout slot.
export function useParallax<T extends HTMLElement>(speed = -80) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let visible = false;

    const update = () => {
      rafId = 0;
      if (!visible) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when element center sits at viewport bottom, 1 when at top.
      const center = rect.top + rect.height / 2;
      const progress = 1 - center / vh;
      const offset = progress * speed;
      el.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) onScroll();
      },
      { threshold: 0, rootMargin: "120px 0px 120px 0px" },
    );
    io.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return ref;
}
