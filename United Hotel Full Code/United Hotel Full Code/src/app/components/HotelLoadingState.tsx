import { Skeleton } from "./ui/skeleton";

export function HotelGridLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-[#d9efe9] bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf8_52%,#ecfdf7_100%)] p-6 md:p-8 shadow-[0_20px_60px_rgba(15,118,110,0.08)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b7e5dc] bg-white/80 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
              <span className="h-2 w-2 rounded-full bg-[#1abc9c] animate-pulse" />
              Loading live inventory
            </div>
            <Skeleton className="h-10 w-[220px] rounded-xl bg-[#dff5ef]" />
            <Skeleton className="h-4 w-[320px] max-w-full rounded-full bg-[#e8f8f3]" />
          </div>
          <div className="grid grid-cols-3 gap-3 md:min-w-[300px]">
            <Skeleton className="h-16 rounded-2xl bg-white/90" />
            <Skeleton className="h-16 rounded-2xl bg-white/90" />
            <Skeleton className="h-16 rounded-2xl bg-white/90" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[28px] border border-[#e6f0ed] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 90}ms`, animationFillMode: "both" }}
          >
            <div className="relative">
              <Skeleton className="h-[220px] w-full rounded-none bg-[linear-gradient(90deg,#d8ede8_0%,#edf8f4_50%,#d8ede8_100%)]" />
              <div className="absolute right-4 top-4">
                <Skeleton className="h-9 w-20 rounded-full bg-white/90" />
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-3">
                <Skeleton className="h-7 w-2/3 bg-[#e6f5f1]" />
                <Skeleton className="h-4 w-5/6 rounded-full bg-[#eef8f5]" />
                <Skeleton className="h-4 w-24 rounded-full bg-[#eef8f5]" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-8 rounded-full bg-[#f3faf8]" />
                <Skeleton className="h-8 rounded-full bg-[#f3faf8]" />
                <Skeleton className="h-8 rounded-full bg-[#f3faf8]" />
              </div>
              <div className="border-t border-[#edf2f1] pt-4">
                <Skeleton className="mb-2 h-4 w-20 bg-[#eef8f5]" />
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-32 bg-[#dff5ef]" />
                    <Skeleton className="h-4 w-16 rounded-full bg-[#eef8f5]" />
                  </div>
                  <Skeleton className="h-11 w-24 rounded-2xl bg-[#1abc9c]/20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HotelDetailLoader() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-[#dcefe8] bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf8_45%,#effcf8_100%)] p-6 md:p-8 shadow-[0_20px_60px_rgba(15,118,110,0.08)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b7e5dc] bg-white/80 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
          <span className="h-2 w-2 rounded-full bg-[#1abc9c] animate-pulse" />
          Preparing hotel profile
        </div>
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.9fr] md:items-center">
          <div className="space-y-4">
            <Skeleton className="h-12 w-[280px] max-w-full bg-[#dcf4ed]" />
            <Skeleton className="h-5 w-[460px] max-w-full rounded-full bg-[#ecf8f4]" />
            <Skeleton className="h-5 w-[360px] max-w-full rounded-full bg-[#ecf8f4]" />
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-10 w-28 rounded-full bg-white" />
              <Skeleton className="h-10 w-32 rounded-full bg-white" />
              <Skeleton className="h-10 w-24 rounded-full bg-white" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-2xl bg-[#eff8f5]" />
              <Skeleton className="h-20 rounded-2xl bg-[#eff8f5]" />
            </div>
          </div>
        </div>
      </div>

      <Skeleton className="h-[260px] md:h-[460px] w-full rounded-3xl bg-[linear-gradient(90deg,#d8ede8_0%,#edf8f4_50%,#d8ede8_100%)]" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#e6f0ed] bg-white p-6 md:p-8">
            <Skeleton className="mb-4 h-10 w-64 bg-[#e2f4ee]" />
            <Skeleton className="mb-3 h-5 w-5/6 rounded-full bg-[#eef8f5]" />
            <Skeleton className="mb-6 h-5 w-2/3 rounded-full bg-[#eef8f5]" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24 rounded-full bg-[#f4faf8]" />
              <Skeleton className="h-9 w-28 rounded-full bg-[#f4faf8]" />
              <Skeleton className="h-9 w-20 rounded-full bg-[#f4faf8]" />
              <Skeleton className="h-9 w-32 rounded-full bg-[#f4faf8]" />
            </div>
          </div>

          <div className="rounded-3xl border border-[#e6f0ed] bg-white p-6 md:p-8">
            <Skeleton className="mb-5 h-9 w-52 bg-[#e2f4ee]" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid gap-4 rounded-2xl border border-[#edf2f1] p-4 md:grid-cols-[180px_1fr_auto] md:items-center animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}>
                  <Skeleton className="h-[120px] rounded-2xl bg-[linear-gradient(90deg,#d8ede8_0%,#edf8f4_50%,#d8ede8_100%)]" />
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-48 bg-[#e6f5f1]" />
                    <Skeleton className="h-4 w-24 rounded-full bg-[#eef8f5]" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-7 w-24 rounded-full bg-[#f3faf8]" />
                      <Skeleton className="h-7 w-24 rounded-full bg-[#f3faf8]" />
                      <Skeleton className="h-7 w-24 rounded-full bg-[#f3faf8]" />
                    </div>
                  </div>
                  <div className="space-y-3 md:text-right">
                    <Skeleton className="h-4 w-20 rounded-full bg-[#eef8f5] md:ml-auto" />
                    <Skeleton className="h-9 w-28 bg-[#dff5ef] md:ml-auto" />
                    <Skeleton className="h-11 w-28 rounded-2xl bg-[#1abc9c]/20 md:ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e6f0ed] bg-white p-6 md:p-7 h-fit">
          <Skeleton className="mb-5 h-8 w-44 bg-[#e2f4ee]" />
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-2xl bg-[#f4faf8]" />
            <Skeleton className="h-16 rounded-2xl bg-[#f4faf8]" />
            <Skeleton className="h-16 rounded-2xl bg-[#f4faf8]" />
          </div>
          <Skeleton className="mt-6 h-12 w-full rounded-2xl bg-[#1abc9c]/20" />
        </div>
      </div>
    </div>
  );
}