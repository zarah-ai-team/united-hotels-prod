import { useEffect } from "react";

// Drives the global --scroll-progress CSS variable (0..1) on documentElement.
// A single rAF-throttled scroll listener feeds the top progress bar.
export function useScrollProgress() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const max = root.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty("--scroll-progress", String(ratio));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);
}
