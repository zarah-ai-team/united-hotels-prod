import { useEffect, useState } from "react";
import { Building2, MapPin, Sparkles } from "lucide-react";

// Replaces the previous inert gray skeleton. Each block uses a sweeping
// shimmer (`uh-shimmer` in theme.css) so the page feels alive instead of
// frozen, and the header strip rotates through a few short messages so
// the user can tell something is actually happening behind the scenes.

const STATUS_LINES = [
  "Searching live inventory…",
  "Fetching real-time prices…",
  "Loading photos & amenities…",
  "Almost there — picking the best stays…",
];

function StatusLine() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % STATUS_LINES.length),
      1600,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      key={index}
      className="font-['Inter:Medium',sans-serif] text-[13px] text-[#1E5FBC] dark:text-[#5DA0F8] animate-in fade-in slide-in-from-bottom-1 duration-500"
    >
      {STATUS_LINES[index]}
    </span>
  );
}

function LoaderHeader({ title = "Finding your stay" }: { title?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#dbe6f7] dark:border-white/10 bg-[linear-gradient(135deg,#ffffff_0%,#f3f7ff_55%,#eaf1fb_100%)] dark:bg-[linear-gradient(135deg,rgba(47,128,237,0.10),rgba(47,128,237,0.04))] p-5 md:p-6 shadow-[0_18px_50px_-20px_rgba(47,128,237,0.35)]">
      {/* Animated progress stripe across the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#2F80ED] to-transparent uh-progress-stripe" />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Orbiting accent ring around the icon */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#2F80ED]/30 uh-orbit" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2F80ED] to-[#5DA0F8] text-white shadow-[0_8px_18px_-6px_rgba(47,128,237,0.6)]">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#1f2937] dark:text-white">
                {title}
              </span>
              <Sparkles className="h-3.5 w-3.5 text-[#2F80ED] animate-pulse" />
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <StatusLine />
            </div>
          </div>
        </div>

        {/* Three-dot bouncing indicator */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          <span className="h-2 w-2 rounded-full bg-[#2F80ED] uh-bounce-dot" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-[#2F80ED] uh-bounce-dot" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-[#2F80ED] uh-bounce-dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function HotelCardSkeleton({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <div
      className="overflow-hidden rounded-[24px] border border-[#e6ecf6] dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-[0_18px_45px_-20px_rgba(15,23,42,0.18)] animate-in fade-in slide-in-from-bottom-3 duration-500"
      style={{ animationDelay: `${delayMs}ms`, animationFillMode: "both" }}
    >
      <div className="relative aspect-[16/11]">
        <div className="absolute inset-0 uh-shimmer" />
        {/* Faux pills sitting over the image */}
        <div className="absolute top-3 left-3 h-6 w-12 rounded-full uh-shimmer" />
        <div className="absolute bottom-3 left-3 h-6 w-32 rounded-full uh-shimmer opacity-90" />
        <div className="absolute top-3 right-3 h-6 w-14 rounded-full uh-shimmer opacity-80" />
      </div>

      <div className="space-y-3.5 p-5">
        {/* Tag + star row */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded-full uh-shimmer" />
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-full uh-shimmer" />
            <div className="h-3 w-3 rounded-full uh-shimmer" />
            <div className="h-3 w-3 rounded-full uh-shimmer" />
            <div className="h-3 w-3 rounded-full uh-shimmer" />
          </div>
        </div>

        {/* Title */}
        <div className="h-5 w-3/4 rounded-md uh-shimmer" />

        {/* Subtitle / district */}
        <div className="h-3.5 w-1/2 rounded-full uh-shimmer" />

        {/* Amenity chips */}
        <div className="flex gap-2 pt-1">
          <div className="h-7 w-20 rounded-full uh-shimmer" />
          <div className="h-7 w-16 rounded-full uh-shimmer" />
          <div className="h-7 w-24 rounded-full uh-shimmer" />
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-3 pt-3 border-t border-[#eef2f8] dark:border-white/[0.06]">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded-full uh-shimmer" />
            <div className="h-7 w-24 rounded-md uh-shimmer" />
          </div>
          <div className="h-10 w-24 rounded-2xl uh-shimmer" style={{ backgroundColor: "rgba(47,128,237,0.18)" }} />
        </div>
      </div>
    </div>
  );
}

export function HotelGridLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <LoaderHeader />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <HotelCardSkeleton key={i} delayMs={i * 90} />
        ))}
      </div>
    </div>
  );
}

export function HotelDetailLoader() {
  return (
    <div className="space-y-6">
      <LoaderHeader title="Loading hotel details" />

      <div className="rounded-3xl border border-[#e6ecf6] dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-8 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.18)]">
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.9fr] md:items-center">
          <div className="space-y-3">
            <div className="h-9 w-2/3 rounded-md uh-shimmer" />
            <div className="h-4 w-5/6 rounded-full uh-shimmer" />
            <div className="h-4 w-3/4 rounded-full uh-shimmer" />
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="h-9 w-24 rounded-full uh-shimmer" />
              <div className="h-9 w-28 rounded-full uh-shimmer" />
              <div className="h-9 w-20 rounded-full uh-shimmer" />
            </div>
          </div>
          <div className="rounded-2xl border border-[#e6ecf6] dark:border-white/10 bg-[#f8fafe] dark:bg-white/[0.04] p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded-2xl uh-shimmer" />
              <div className="h-20 rounded-2xl uh-shimmer" />
            </div>
            <div className="mt-3 h-12 w-full rounded-2xl uh-shimmer" style={{ backgroundColor: "rgba(47,128,237,0.18)" }} />
          </div>
        </div>
      </div>

      {/* Hero image placeholder */}
      <div className="h-[260px] md:h-[460px] w-full rounded-3xl uh-shimmer" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#e6ecf6] dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-8">
            <div className="mb-4 h-7 w-56 rounded-md uh-shimmer" />
            <div className="mb-2.5 h-4 w-5/6 rounded-full uh-shimmer" />
            <div className="mb-5 h-4 w-2/3 rounded-full uh-shimmer" />
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-24 rounded-full uh-shimmer" />
              <div className="h-8 w-28 rounded-full uh-shimmer" />
              <div className="h-8 w-20 rounded-full uh-shimmer" />
              <div className="h-8 w-28 rounded-full uh-shimmer" />
            </div>
          </div>

          <div className="rounded-3xl border border-[#e6ecf6] dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-8">
            <div className="mb-5 h-7 w-44 rounded-md uh-shimmer" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="grid gap-4 rounded-2xl border border-[#eef2f8] dark:border-white/[0.06] p-4 md:grid-cols-[180px_1fr_auto] md:items-center animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                >
                  <div className="h-[120px] rounded-2xl uh-shimmer" />
                  <div className="space-y-3">
                    <div className="h-6 w-48 rounded-md uh-shimmer" />
                    <div className="h-3.5 w-24 rounded-full uh-shimmer" />
                    <div className="flex flex-wrap gap-2">
                      <div className="h-7 w-24 rounded-full uh-shimmer" />
                      <div className="h-7 w-20 rounded-full uh-shimmer" />
                    </div>
                  </div>
                  <div className="space-y-3 md:text-right">
                    <div className="h-3.5 w-20 rounded-full uh-shimmer md:ml-auto" />
                    <div className="h-7 w-24 rounded-md uh-shimmer md:ml-auto" />
                    <div className="h-10 w-24 rounded-2xl uh-shimmer md:ml-auto" style={{ backgroundColor: "rgba(47,128,237,0.18)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e6ecf6] dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-7 h-fit">
          <div className="mb-5 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#2F80ED]" />
            <div className="h-5 w-32 rounded-md uh-shimmer" />
          </div>
          <div className="space-y-4">
            <div className="h-16 rounded-2xl uh-shimmer" />
            <div className="h-16 rounded-2xl uh-shimmer" />
            <div className="h-16 rounded-2xl uh-shimmer" />
          </div>
          <div className="mt-6 h-12 w-full rounded-2xl uh-shimmer" style={{ backgroundColor: "rgba(47,128,237,0.18)" }} />
        </div>
      </div>
    </div>
  );
}
