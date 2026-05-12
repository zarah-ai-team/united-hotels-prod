import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useBooking } from "../context/BookingContext";

// Floating WhatsApp support button.
//
// Mounted once at the app root (outside the router) so it shows on every
// public page. Hides automatically on /admin/* and during the auth /verify
// flow where the chat would compete with the page CTA.
//
// Builds a context-aware pre-filled message from BookingContext: if the user
// has selected a hotel/dates/rooms in the wizard, those land in the WhatsApp
// chat so support can pick up the conversation immediately.

const SUPPORT_NUMBER_FALLBACK = "15551234567";
const HIDDEN_PREFIXES = ["/admin", "/auth/verify"];

const formatDate = (value: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function buildSupportMessage(booking: ReturnType<typeof useBooking>["booking"]): string {
  const lines = ["Hi United Hotels! I'd like help with a booking."];
  if (booking.hotel?.name) lines.push(`Hotel: ${booking.hotel.name}`);
  if (booking.room?.name) lines.push(`Room: ${booking.room.name}`);
  if (booking.checkIn || booking.checkOut) {
    const ci = booking.checkIn ? formatDate(booking.checkIn) : "?";
    const co = booking.checkOut ? formatDate(booking.checkOut) : "?";
    lines.push(`Stay: ${ci} → ${co}`);
  }
  if (booking.guests) lines.push(`Guests: ${booking.guests}`);
  if (booking.roomCount) lines.push(`Rooms: ${booking.roomCount}`);
  if (booking.guestDetails?.firstName || booking.guestDetails?.lastName) {
    const name = [booking.guestDetails.firstName, booking.guestDetails.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (name) lines.push(`Name: ${name}`);
  }
  return lines.join("\n");
}

export function WhatsAppSupportButton() {
  const [pathname, setPathname] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );
  const [open, setOpen] = useState(false);
  const { booking } = useBooking();

  // react-router v6 uses pushState/replaceState which don't fire popstate, so
  // we patch them once and dispatch our own event. Lightweight — no router
  // dependency needed for the FAB.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", sync);
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args);
      sync();
      return r;
    };
    window.history.replaceState = function (...args) {
      const r = origReplace.apply(this, args);
      sync();
      return r;
    };
    return () => {
      window.removeEventListener("popstate", sync);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  if (hidden) return null;

  const rawNumber = import.meta.env.VITE_SUPPORT_WHATSAPP || SUPPORT_NUMBER_FALLBACK;
  const phoneDigits = String(rawNumber).replace(/[^\d]/g, "");
  const message = buildSupportMessage(booking);
  const href = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* Tooltip card — shown when expanded so the user knows what they're
          about to send before hitting WhatsApp. */}
      {open && (
        <div
          role="dialog"
          aria-label="WhatsApp support"
          className="fixed bottom-24 right-5 z-[60] w-[290px] rounded-2xl bg-white dark:bg-[#1f2937] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="bg-gradient-to-r from-[#25D366] to-[#1da851] px-4 py-3 flex items-start justify-between text-white">
            <div>
              <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] leading-tight">
                United Hotels Support
              </div>
              <div className="text-[11.5px] opacity-90 mt-0.5">Typically replies in minutes</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/90 hover:text-white -m-1 p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <p className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/85 leading-relaxed mb-3">
              Have a question about a hotel or need help completing a booking?
              Chat with us on WhatsApp — we'll pull up your details and confirm
              right away.
            </p>
            <pre className="rounded-lg bg-[#f4f6fa] dark:bg-white/[0.04] px-3 py-2 text-[11px] text-[#4b5563] dark:text-white/65 whitespace-pre-wrap font-['Inter:Regular',sans-serif] leading-snug max-h-32 overflow-auto mb-3 border border-[#eef2f8] dark:border-white/[0.06]">
              {message}
            </pre>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white py-2.5 rounded-xl font-['Inter:Bold',sans-serif] text-[13.5px] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp chat
            </a>
          </div>
        </div>
      )}

      {/* Floating action button — always visible on public pages */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close WhatsApp support" : "Chat with support on WhatsApp"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white shadow-[0_18px_40px_-12px_rgba(37,211,102,0.7)] ring-4 ring-[#25D366]/15 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
        {/* Pulsing aura — subtle; signals "live support" */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping pointer-events-none" />
        )}
      </button>
    </>
  );
}

export default WhatsAppSupportButton;
