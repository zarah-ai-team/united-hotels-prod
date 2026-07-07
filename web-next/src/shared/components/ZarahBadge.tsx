// "Powered by Zarah AI" badge for the top of the blog surfaces.
//
// The logo (/zarah-ai-logo.svg) is yellow + white, so it disappears on the
// blog pages' white/light backgrounds. We sit it inside a dark pill so it has
// the same contrast it gets in the (dark) site footer — i.e. it only ever
// renders "where it looks good". Blog-only by convention: it's imported by the
// blog list + article pages, nowhere else.
export function ZarahBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-[#3b3b3b] py-1.5 pl-2.5 pr-3.5 shadow-sm ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/zarah-ai-logo.svg"
        alt="Zarah AI"
        width={874}
        height={588}
        className="h-6 w-auto object-contain"
      />
      <span
        className="text-white/85 text-[12px] tracking-wide whitespace-nowrap"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Powered by Zarah AI
      </span>
    </span>
  );
}

export default ZarahBadge;
