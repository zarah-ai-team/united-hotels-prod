import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { HotelDetailLoader } from "../components/HotelLoadingState";
import { useBooking } from "../context/BookingContext";
import { hotelService, type PublicHotel, type PublicHotelRoom } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { extractAmenityNames, capitalizeAmenity } from "../utils/amenities";
import { pickAmenityIcon } from "../utils/amenityIcons";
import { pickHotelImage, pickHotelGallery, makeImageFallback } from "../utils/hotelImages";
import { ArrowRight } from "lucide-react";
import {
  MapPin,
  Star,
  Calendar,
  Users,
  ChevronLeft,
  Globe,
  ExternalLink,
  // Aliased: lucide's `Map` icon would shadow the global Map constructor that
  // groupRoomsByTier uses (`new Map()` would then throw "Map is not a constructor").
  Map as MapIcon,
  Sparkles,
  TrendingDown,
  Building2,
  Clock,
  Phone,
  Mail,
  User,
  BedDouble,
  Hash,
  CheckCircle,
  PawPrint,
  Cigarette,
  Baby,
  AlarmClock,
  MessageCircle,
  Headset,
} from "lucide-react";
// Per-hotel images (deterministic) — see utils/hotelImages.ts. Room cards
// reuse the same pool but stagger by index so a single hotel's room cards
// don't all show the same picture.

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Converts "14:00:00" or "14:00" -> "2:00 PM" */
function formatTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return minutes === "00" ? `${hours}:00 ${ampm}` : `${hours}:${minutes} ${ampm}`;
}

/** Formats a price number + currency code into a human-readable string */
function formatPrice(amount: number | null | undefined, currencyCode?: string | null): string | null {
  if (amount == null || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return null;
  const code = (currencyCode || "TRY").toUpperCase();
  const symbols: Record<string, string> = { TRY: "TL", USD: "$", EUR: "€", GBP: "£" };
  const symbol = symbols[code] ?? (code + " ");
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));
  return `${symbol}${formatted}`;
}

/** Returns star count clamped 0-5 */
function getStarCount(starRating: number | null | undefined): number {
  const n = parseInt(String(starRating ?? 0), 10);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(5, n));
}

// Tier ordering for the room category groups — premium tiers float to the top
// so guests scanning the page see the highest-tier offering first.
const ROOM_TIERS: Array<{ tier: string; label: string; match: RegExp }> = [
  { tier: "presidential", label: "Presidential", match: /presidential|royal/i },
  { tier: "suite",        label: "Suites",       match: /\bsuite\b/i },
  { tier: "deluxe",       label: "Deluxe",       match: /deluxe|luxury/i },
  { tier: "executive",    label: "Executive",    match: /executive|business/i },
  { tier: "superior",     label: "Superior",     match: /superior|premier|premium/i },
  { tier: "family",       label: "Family",       match: /family|triple|connecting/i },
  { tier: "standard",     label: "Standard",     match: /standard|classic|comfort|double|single|twin|queen|king/i },
  { tier: "economy",      label: "Economy",      match: /economy|budget|small|basic/i },
];

interface GroupedRooms {
  tier: string;
  tierLabel: string;
  rooms: Array<{ room: PublicHotelRoom; index: number }>;
}

const detectTier = (room: PublicHotelRoom): { tier: string; label: string } => {
  const haystack = [
    room.room_name,
    room.room_category,
    (room as any).category,
  ]
    .filter(Boolean)
    .join(" ");
  for (const t of ROOM_TIERS) {
    if (t.match.test(haystack)) return { tier: t.tier, label: t.label };
  }
  return { tier: "other", label: "Other" };
};

const groupRoomsByTier = (rooms: PublicHotelRoom[], hotel: PublicHotel): GroupedRooms[] => {
  const buckets = new Map<string, GroupedRooms>();
  rooms.forEach((room, index) => {
    const { tier, label } = detectTier(room);
    if (!buckets.has(tier)) {
      buckets.set(tier, { tier, label, tierLabel: label, rooms: [] });
    }
    buckets.get(tier)!.rooms.push({ room, index });
  });

  // Sort within each group: cheapest first (recommended → base → 0)
  buckets.forEach((group) => {
    group.rooms.sort((a, b) => {
      const priceOf = (room: PublicHotelRoom, idx: number) => {
        const rec = getRoomRecommendation(room, hotel, idx);
        return Number(rec?.recommendedPrice || room.price_per_night || room.base_price || 0);
      };
      return priceOf(a.room, a.index) - priceOf(b.room, b.index);
    });
  });

  // Order the tiers themselves by ROOM_TIERS, then "other" last
  const order = [...ROOM_TIERS.map((t) => t.tier), "other"];
  return order
    .map((t) => buckets.get(t))
    .filter((g): g is GroupedRooms => !!g);
};

// pickRoomImage — index into the hotel's API-supplied gallery so each room
// card shows a real photo of the property. If the backend returned no images,
// the empty string flows through to the <img> element and the onError fallback
// in `makeImageFallback` paints a soft placeholder gradient instead.
const pickRoomImage = (hotel: PublicHotel, index: number): string => {
  const gallery = pickHotelGallery(hotel, 6);
  if (gallery.length === 0) return "";
  return gallery[index % gallery.length];
};

const normalizeCategory = (v?: string | null) => String(v || "").trim().toLowerCase();

// ─── HotelHero ─────────────────────────────────────────────────────────────

interface HotelHeroProps {
  hotel: PublicHotel;
  image: string;
}

function HotelHero({ hotel, image }: HotelHeroProps) {
  const { t } = useLanguage();
  const starCount = getStarCount(hotel.starRating ?? hotel.star_rating);
  const name = hotel.hotel_name || hotel.name || "Hotel";
  const address = hotel.location_raw || hotel.address || hotel.location || "";
  const websiteUrl = hotel.hotel_link || hotel.hotelLink;
  const mapsUrl =
    hotel.google_maps_link ||
    hotel.googleMapsLink ||
    (() => {
      const q = [name, address].filter(Boolean).join(", ");
      return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
    })();

  return (
    <div className="relative h-[260px] md:h-[420px] rounded-2xl overflow-hidden mb-6">
      <img
        src={image}
        alt={name}
        onError={makeImageFallback({ id: hotel.id, name })}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-transparent" />

      {starCount > 0 && (
        <div className="absolute top-4 left-4 flex gap-0.5">
          {Array.from({ length: starCount }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-[#FFA500] text-[#FFA500] drop-shadow" />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h1 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[42px] leading-tight text-white mb-2 drop-shadow-lg">
          {t(name)}
        </h1>
        {address && (
          <div className="flex items-start gap-2 text-white/90 text-[14px] md:text-[16px]">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{t(address)}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-4">
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/30 transition-all"
            >
              <Globe className="w-4 h-4" /> Official Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/30 transition-all"
            >
              <MapIcon className="w-4 h-4" /> Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HotelQuickFacts ───────────────────────────────────────────────────────

interface HotelQuickFactsProps {
  hotel: PublicHotel;
}

function HotelQuickFacts({ hotel }: HotelQuickFactsProps) {
  const checkIn = formatTime(hotel.check_in_time ?? hotel.checkInTime);
  const checkOut = formatTime(hotel.check_out_time ?? hotel.checkOutTime);
  const phone = hotel.contact_phone || hotel.contactPhone;

  type Fact = { icon: React.ReactNode; label: string; value: string };
  const facts: Fact[] = [
    checkIn && ({
      icon: <AlarmClock className="w-5 h-5 text-[#1abc9c]" />,
      label: "Check-in from",
      value: checkIn,
    } as Fact),
    checkOut && ({
      icon: <Clock className="w-5 h-5 text-[#1abc9c]" />,
      label: "Check-out by",
      value: checkOut,
    } as Fact),
    phone && ({
      icon: <Phone className="w-5 h-5 text-[#1abc9c]" />,
      label: "Phone",
      value: phone,
    } as Fact),
  ].filter(Boolean) as Fact[];

  if (!facts.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="glass-card is-interactive rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="mt-0.5 shrink-0">{fact.icon}</div>
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1abc9c] dark:text-[#2dd4bf] mb-1">
              {fact.label}
            </div>
            <div className="text-[15px] font-semibold text-[#1f2937] dark:text-white">{fact.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AmenitiesList ─────────────────────────────────────────────────────────

interface AmenitiesListProps {
  amenities: string[];
}

function AmenitiesList({ amenities }: AmenitiesListProps) {
  const { t } = useLanguage();
  if (!amenities.length) {
    return (
      <p className="text-[14px] text-[#9ca3af] italic">No amenities listed for this hotel.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {amenities.map((name, i) => {
        const Icon = pickAmenityIcon(name);
        return (
          <div
            key={`${name}-${i}`}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm ring-1 ring-[#1abc9c]/15 dark:ring-[#2dd4bf]/20 hover:ring-[#1abc9c]/35 dark:hover:ring-[#2dd4bf]/40 transition-colors"
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 text-[#0f9b86] dark:text-[#2dd4bf] shrink-0"
              aria-hidden
            >
              <Icon className="w-[15px] h-[15px]" strokeWidth={1.9} />
            </span>
            <span className="text-[13px] font-medium text-[#1f2937] dark:text-white/85 leading-tight line-clamp-2">
              {t(capitalizeAmenity(name))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── RoomCategoryCard ──────────────────────────────────────────────────────

interface RoomCategoryCardProps {
  room: PublicHotelRoom;
  index: number;
  image: string;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  recommendation?: { recommendedPrice?: number; basePrice?: number; discountPercent?: number; savingsAmount?: number } | null;
  isSelected: boolean;
  onSelect: () => void;
  canBook: boolean;
}

function RoomCategoryCard({ room, index, image, onImageError, recommendation, isSelected, onSelect, canBook }: RoomCategoryCardProps) {
  const { t, format } = useLanguage();
  const currency = room.currency_code || "USD";
  const recommendedPrice = Number(recommendation?.recommendedPrice || 0);
  const fallbackBase = Number(room.price_per_night || room.base_price || 0);
  const displayPrice = recommendedPrice > 0 ? recommendedPrice : fallbackBase;
  const basePrice = Number(recommendation?.basePrice || fallbackBase || 0);
  const hasDiscount = Number(recommendation?.discountPercent || 0) > 0 && basePrice > displayPrice;
  const savings = Number(recommendation?.savingsAmount || Math.max(0, basePrice - displayPrice));

  const occupancyLabel =
    room.occupancy_type === "single_double" ? "Single / Double" :
    room.occupancy_type === "single" ? "Single" :
    room.occupancy_type === "double" ? "Double" :
    room.occupancy_type === "triple" ? "Triple" :
    room.occupancy_type ? String(room.occupancy_type) : null;

  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-[#1abc9c]/45 dark:ring-[#2dd4bf]/55 shadow-[0_22px_60px_-22px_rgba(26,188,156,0.45)]"
          : "is-interactive"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[210px_1fr_auto]">
        {/* Image with overlay pills (matches home card visual language) */}
        <div className="relative h-[180px] md:h-full overflow-hidden">
          <img
            src={image}
            alt={room.room_name}
            loading="lazy"
            onError={onImageError}
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          {hasDiscount && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] px-2.5 py-1 text-[11px] font-['Inter:SemiBold',sans-serif] text-white shadow-[0_6px_18px_-6px_rgba(26,188,156,0.7)] ring-1 ring-white/30">
              <TrendingDown className="w-3 h-3" />
              −{Number(recommendation?.discountPercent || 0).toFixed(0)}%
            </div>
          )}

          {room.room_category && room.room_category !== "unknown" && (
            <div className="card-glass-pill absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 max-w-[78%]">
              <BedDouble className="card-glass-accent w-3 h-3" strokeWidth={2.4} />
              <span className="font-['Inter:Medium',sans-serif] text-[11.5px] leading-none capitalize line-clamp-1">
                {t(room.room_category)}
              </span>
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="h-px w-5 bg-gradient-to-r from-[#1abc9c] to-transparent shrink-0" />
            <span className="font-['Inter:Medium',sans-serif] text-[10px] tracking-[0.26em] uppercase text-[#1abc9c] dark:text-[#2dd4bf]">
              {t("Direct rate")}
            </span>
            {room.room_category && room.room_category !== "unknown" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 ring-1 ring-[#1abc9c]/25 dark:ring-[#2dd4bf]/30 text-[10.5px] font-['Inter:SemiBold',sans-serif] text-[#0f9b86] dark:text-[#2dd4bf] capitalize">
                {t(room.room_category)}
              </span>
            )}
          </div>

          <h3 className="font-['Poppins:Bold',sans-serif] text-[19px] md:text-[20px] leading-[1.22] tracking-[-0.018em] text-[#1f2937] dark:text-white">
            {t(room.room_name || `Room ${index + 1}`)}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-[#6b7280] dark:text-white/65 mt-3">
            {occupancyLabel && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#1abc9c] dark:text-[#2dd4bf]" strokeWidth={2.2} />
                {t(occupancyLabel)}
              </span>
            )}
            {room.occupancy_code && (
              <span className="inline-flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#1abc9c] dark:text-[#2dd4bf]" strokeWidth={2.2} />
                {room.occupancy_code}
              </span>
            )}
          </div>

          {room.price_raw && (
            <div className="font-['Inter:Regular',sans-serif] italic text-[12px] text-[#6b7280] dark:text-white/55 mt-2">
              {room.price_raw}
            </div>
          )}
        </div>

        {/* Price + CTA column */}
        <div className="relative flex flex-col items-end justify-between gap-3 p-5 md:p-6 border-t md:border-t-0 md:border-l border-[#1abc9c]/12 dark:border-white/10 bg-gradient-to-br from-[#1abc9c]/[0.07] via-[#2dd4bf]/[0.04] to-transparent dark:from-[#2dd4bf]/[0.08] dark:via-[#2dd4bf]/[0.04]">
          <span
            aria-hidden
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-12 rounded-r-full bg-gradient-to-b from-[#1abc9c] to-[#2dd4bf]"
          />

          <div className="text-right">
            <div className="font-['Inter:SemiBold',sans-serif] text-[10px] tracking-[0.22em] uppercase text-[#1abc9c] dark:text-[#2dd4bf] mb-1">
              {t("From")}
            </div>
            {hasDiscount && basePrice > displayPrice && (
              <div className="text-[11.5px] line-through text-[#9aa0a6] dark:text-white/40">
                {format(basePrice)}
              </div>
            )}
            {displayPrice > 0 ? (
              <>
                <div className="font-['Poppins:Bold',sans-serif] text-[28px] leading-none tracking-[-0.025em] text-[#0f9b86] dark:text-[#2dd4bf]">
                  {format(displayPrice)}
                </div>
                <div className="text-[12px] text-[#6b7280] dark:text-white/55 mt-1">
                  / {t("night")}
                </div>
              </>
            ) : (
              <div className="text-[14px] text-[#9ca3af] italic">{t("Price on request")}</div>
            )}
            {savings > 0 && (
              <div className="mt-1.5 inline-flex items-center gap-1 font-['Inter:SemiBold',sans-serif] text-[11px] text-[#0f9b86] dark:text-[#2dd4bf]">
                <Sparkles className="w-3 h-3" strokeWidth={2.2} />
                {t("Save")} {format(savings)}
              </div>
            )}
          </div>

          {canBook && (
            <button
              onClick={onSelect}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 h-10 rounded-full font-['Inter:SemiBold',sans-serif] text-[12px] transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] text-white shadow-[0_10px_28px_-8px_rgba(26,188,156,0.7)]"
                  : "bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] text-white shadow-[0_8px_22px_-8px_rgba(26,188,156,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(26,188,156,0.8)] hover:translate-x-0.5"
              }`}
            >
              {isSelected ? (
                <>
                  <CheckCircle className="w-4 h-4" strokeWidth={2.4} />
                  {t("Selected")}
                </>
              ) : (
                <>
                  {t("Select")}
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HotelPolicies ─────────────────────────────────────────────────────────

interface HotelPoliciesProps {
  childPolicy?: string | null;
  petPolicy?: string | null;
  smokingPolicy?: string | null;
}

function HotelPolicies({ childPolicy, petPolicy, smokingPolicy }: HotelPoliciesProps) {
  const { t } = useLanguage();
  type Policy = {
    icon: React.ReactNode;
    label: string;
    text: string;
  };
  const policies: Policy[] = [
    childPolicy && ({
      icon: <Baby className="w-[15px] h-[15px]" strokeWidth={1.9} />,
      label: "Children Policy",
      text: childPolicy,
    } as Policy),
    petPolicy && ({
      icon: <PawPrint className="w-[15px] h-[15px]" strokeWidth={1.9} />,
      label: "Pet Policy",
      text: petPolicy,
    } as Policy),
    smokingPolicy && ({
      icon: <Cigarette className="w-[15px] h-[15px]" strokeWidth={1.9} />,
      label: "Smoking Policy",
      text: smokingPolicy,
    } as Policy),
  ].filter(Boolean) as Policy[];

  if (!policies.length) {
    return <p className="text-[13px] text-[#9ca3af] italic">No policy information available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {policies.map((p) => (
        <div
          key={p.label}
          className="rounded-xl p-3.5 bg-white/65 dark:bg-white/[0.04] ring-1 ring-black/[0.05] dark:ring-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 text-[#0f9b86] dark:text-[#2dd4bf] shrink-0">
              {p.icon}
            </span>
            <div className="font-['Inter:SemiBold',sans-serif] text-[12.5px] tracking-[0.02em] text-[#374151] dark:text-white/85">
              {t(p.label)}
            </div>
          </div>
          <p className="text-[12.5px] text-[#6b7280] dark:text-white/65 leading-[18px]">{t(p.text)}</p>
        </div>
      ))}
    </div>
  );
}

// ─── HotelContactCard ──────────────────────────────────────────────────────

interface HotelContactCardProps {
  contactName?: string | null;
  contactPhone?: string | null;
  email?: string | null;
}

function HotelContactCard({ contactName, contactPhone, email }: HotelContactCardProps) {
  const { t } = useLanguage();
  // Strip everything but digits/leading + so the WhatsApp deep link works.
  const waNumber = contactPhone ? String(contactPhone).replace(/[^\d+]/g, "").replace(/^\+/, "") : "";
  const waLink = waNumber ? `https://wa.me/${waNumber}` : null;
  const supportNumber = "+1 (800) 555-0199";
  const supportEmail = "support@unitedhotels.com";

  type Row = {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    sub?: string | null;
    accent?: "teal" | "neutral";
    external?: boolean;
  };

  const hotelRows: Row[] = [];
  if (contactName) hotelRows.push({ icon: <User className="w-[15px] h-[15px]" strokeWidth={1.9} />, label: "Contact Person", value: contactName });
  if (contactPhone) hotelRows.push({ icon: <Phone className="w-[15px] h-[15px]" strokeWidth={1.9} />, label: "Phone", value: contactPhone, href: `tel:${contactPhone}`, sub: "Mon–Sun, 9am – 9pm" });
  if (waLink) hotelRows.push({ icon: <MessageCircle className="w-[15px] h-[15px]" strokeWidth={1.9} />, label: "WhatsApp", value: contactPhone || "", href: waLink, sub: "Chat with the property", accent: "teal", external: true });
  if (email) hotelRows.push({ icon: <Mail className="w-[15px] h-[15px]" strokeWidth={1.9} />, label: "Email", value: email, href: `mailto:${email}` });

  const supportRows: Row[] = [
    { icon: <Headset className="w-[15px] h-[15px]" strokeWidth={1.9} />, label: "24/7 Support", value: supportNumber, href: `tel:${supportNumber.replace(/\s/g, "")}`, sub: "Booking & travel help", accent: "teal" },
    { icon: <MessageCircle className="w-[15px] h-[15px]" strokeWidth={1.9} />, label: "WhatsApp Support", value: supportNumber, href: "https://wa.me/18005550199", sub: "Reply within minutes", accent: "teal", external: true },
    { icon: <Mail className="w-[15px] h-[15px]" strokeWidth={1.9} />, label: "Email Support", value: supportEmail, href: `mailto:${supportEmail}` },
  ];

  const renderRow = (r: Row, key: string) => {
    const iconWrap =
      r.accent === "teal"
        ? "bg-[#1abc9c]/12 dark:bg-[#2dd4bf]/15 text-[#0f9b86] dark:text-[#2dd4bf]"
        : "bg-black/[0.04] dark:bg-white/[0.06] text-[#475569] dark:text-white/70";

    const content = (
      <div className="flex items-center gap-3 min-w-0">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${iconWrap}`} aria-hidden>
          {r.icon}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8] dark:text-white/50">{t(r.label)}</div>
          <div className="text-[13.5px] font-semibold text-[#1e293b] dark:text-white truncate">{r.value}</div>
          {r.sub && <div className="text-[11.5px] text-[#94a3b8] dark:text-white/45 truncate">{t(r.sub)}</div>}
        </div>
      </div>
    );

    if (r.href) {
      return (
        <a
          key={key}
          href={r.href}
          target={r.external ? "_blank" : undefined}
          rel={r.external ? "noreferrer noopener" : undefined}
          className="block py-2 hover:opacity-90 transition-opacity"
        >
          {content}
        </a>
      );
    }
    return (
      <div key={key} className="py-2">
        {content}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="rounded-xl p-4 bg-white/65 dark:bg-white/[0.04] ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
        <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.18em] uppercase text-[#1abc9c] dark:text-[#2dd4bf] mb-2">
          {t("Property Contact")}
        </div>
        <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
          {hotelRows.length === 0 ? (
            <p className="text-[12.5px] text-[#9ca3af] italic py-2">{t("No contact info available.")}</p>
          ) : (
            hotelRows.map((r, i) => renderRow(r, `hotel-${i}`))
          )}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-gradient-to-br from-[#1abc9c]/[0.08] to-[#2dd4bf]/[0.04] dark:from-[#2dd4bf]/[0.10] dark:to-[#2dd4bf]/[0.04] ring-1 ring-[#1abc9c]/20 dark:ring-[#2dd4bf]/25">
        <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.18em] uppercase text-[#1abc9c] dark:text-[#2dd4bf] mb-2">
          {t("United Hotels Support")}
        </div>
        <div className="divide-y divide-[#1abc9c]/15 dark:divide-[#2dd4bf]/15">
          {supportRows.map((r, i) => renderRow(r, `support-${i}`))}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5 md:p-8 mb-5">
      <div className="flex items-center gap-3 mb-5">
        {icon && (
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#1abc9c]/15 dark:border-[#2dd4bf]/25 text-[#1abc9c] dark:text-[#2dd4bf]">
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-['Inter:Medium',sans-serif] text-[10px] tracking-[0.26em] uppercase text-[#1abc9c] dark:text-[#2dd4bf] mb-1">
            United Hotels
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[22px] md:text-[24px] tracking-[-0.018em] text-[#1f2937] dark:text-white">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── ViewRoom type (for booking sidebar) ───────────────────────────────────

type ViewRoom = {
  id: string;
  name: string;
  price: number;
  basePrice: number | null;
  savingsAmount: number;
  available: number;
};

const getRoomRecommendation = (room: PublicHotelRoom, hotel: PublicHotel, index: number) => {
  const recommendations = Array.isArray(hotel.recommendedPrices) ? hotel.recommendedPrices : [];
  const roomId = room.id == null ? null : Number(room.id);
  const roomCategory = normalizeCategory(room.room_category || room.category);
  return (
    recommendations.find((e) => Number(e.roomId) === roomId) ||
    recommendations.find((e) => normalizeCategory(e.category || e.roomCategory) === roomCategory) ||
    recommendations[index] ||
    null
  );
};

/* Some hotels in the source data bundle two room types into one entry —
   e.g. "Standard Room-Standard Room Sea view" or "Executive suite room-Deluxe suite room".
   We split these into separate display rooms so guests can see and pick each
   category individually. The split kicks in only when BOTH halves end with
   "room" or "suite" (signalling two real types), so view-only suffixes like
   "City View" stay attached to the parent room. */
const splitRoomDisplayEntries = (room: PublicHotelRoom): PublicHotelRoom[] => {
  const name = String(room.room_name || "").trim();
  if (!name.includes("-")) return [room];

  // Allow either "A - B" or "A-B"; split only on the first hyphen between
  // two distinct parts so we don't mangle hyphenated single names.
  const parts = name.split(/\s*-\s*/);
  if (parts.length !== 2) return [room];

  const [a, b] = parts.map((s) => s.trim());
  const isRoomLike = (s: string) => /\b(room|suite)\b/i.test(s);
  if (!isRoomLike(a) || !isRoomLike(b)) return [room];

  // Two genuine room categories — clone the entry, swapping room_name only.
  // Price/occupancy stay the same since the source data only carries one tier.
  return [
    { ...room, room_name: a },
    { ...room, room_name: b },
  ];
};

const mapToViewRoom = (room: PublicHotelRoom, hotel: PublicHotel, index: number): ViewRoom => {
  const rec = getRoomRecommendation(room, hotel, index);
  const recommendedPrice = Number(rec?.recommendedPrice || 0);
  const fallbackBase = Number(room.price_per_night || room.base_price || 0);
  const roomPrice = recommendedPrice > 0 ? recommendedPrice : fallbackBase;
  const basePriceValue = Number(rec?.basePrice || fallbackBase || 0);
  const basePrice = basePriceValue > roomPrice ? basePriceValue : null;
  return {
    id: String(room.id || `room-${index + 1}`),
    name: room.room_name || `Room ${index + 1}`,
    price: roomPrice,
    basePrice,
    savingsAmount: Number(rec?.savingsAmount || Math.max(0, (basePrice || 0) - roomPrice)),
    available: Number(room.available_rooms ?? 1),
  };
};

// ─── Main page ──────────────────────────────────────────────────────────────

export function HotelDetailPageNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, format } = useLanguage();
  const { booking, setHotel, setRoom, setDates, setGuests, setRoomCount } = useBooking();
  useScrollProgress();

  // Pull any pre-existing search from URL params (set by HomePage) — these
  // survive refresh and shared links, while BookingContext only survives
  // in-app navigation. URL wins when both are present.
  const [searchParams] = useSearchParams();
  const urlCheckIn = searchParams.get("checkIn") || "";
  const urlCheckOut = searchParams.get("checkOut") || "";
  const urlGuests = parseInt(searchParams.get("guests") || "", 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotel, setHotelState] = useState<PublicHotel | null>(null);
  // Initialise dates from URL → BookingContext → today/tomorrow (in that
  // priority order). Without this the page hard-overwrote whatever the user
  // picked on the home page back to today/tomorrow, so per-night totals
  // never reflected the chosen stay.
  const initialCheckIn = urlCheckIn || booking.checkIn || new Date().toISOString().split("T")[0];
  const initialCheckOut =
    urlCheckOut ||
    booking.checkOut ||
    new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestCount, setGuestCount] = useState(
    Number.isFinite(urlGuests) && urlGuests > 0 ? urlGuests : booking.guests || 2,
  );
  const [roomCount, setSelectedRoomCount] = useState(booking.roomCount || 1);
  // Selection key = `${roomId}::${displayName}` so two split halves of the
  // same source room (e.g. "Standard Room" and "Standard Room Sea view") can
  // be selected independently and the chosen sub-name flows into the booking.
  const [selectedRoomKey, setSelectedRoomKey] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  // NOTE: a previous version of this page tried to keep BookingContext in
  // sync via a useEffect with [checkIn, checkOut, setDates] deps. setDates
  // is a fresh closure on every BookingProvider render, which triggered an
  // infinite re-render loop and froze the page (every click — Continue,
  // back link, header dropdowns — became a no-op). Sync now happens
  // explicitly inside handleSelectRoom / handleContinue instead.

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) {
      const next = new Date(start.getTime() + 86400000);
      setCheckOut(next.toISOString().split("T")[0]);
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);
    hotelService
      .getById(id)
      .then((found) => {
        if (!active) return;
        if (!found) setError("Hotel not found");
        else setHotelState(found);
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.data?.error || e?.message || "Failed to load hotel");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const bookableRooms = useMemo<ViewRoom[]>(() => {
    if (!hotel || !Array.isArray(hotel.rooms)) return [];
    return hotel.rooms
      .map((room, index) => mapToViewRoom(room, hotel, index))
      .filter((room) => room.price > 0 && Number.isFinite(Number(room.id)));
  }, [hotel]);

  // Pull the underlying bookable room (with id + price) from the selection key.
  const selectedRoomId = selectedRoomKey ? selectedRoomKey.split("::")[0] : null;
  const selectedDisplayName = selectedRoomKey
    ? selectedRoomKey.slice(selectedRoomKey.indexOf("::") + 2)
    : null;
  const selectedRoom = bookableRooms.find((r) => String(r.id) === String(selectedRoomId)) ?? null;

  const roomCountOptions = useMemo(() => {
    const max = Math.max(4, Math.min(selectedRoom?.available ?? 4, 4));
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [selectedRoom]);

  useEffect(() => {
    if (roomCount > roomCountOptions.length) setSelectedRoomCount(roomCountOptions.length);
  }, [roomCount, roomCountOptions]);

  // displayName is the human-readable category the user clicked on — for
  // bundled rooms this is the *split* half ("Master Bedroom"), not the
  // combined source string.
  const handleSelectRoom = (viewRoom: ViewRoom, displayName: string) => {
    setSelectedRoomKey(`${viewRoom.id}::${displayName}`);
    if (!hotel) return;
    setHotel({
      id: String(hotel.id),
      name: hotel.hotel_name || hotel.name || "Hotel",
      location: hotel.location_raw || hotel.location || "Turkey",
      image: pickHotelImage(hotel),
    });
    setRoom({ id: viewRoom.id, name: displayName, price: viewRoom.price });
    setDates(checkIn, checkOut);
    setGuests(guestCount);
    setRoomCount(roomCount);
  };

  const handleContinue = () => {
    if (!selectedRoom || !hotel) return;
    // Push the right-side panel's current selection into BookingContext so
    // BookingStep1/2/3 (which read booking.checkIn/checkOut/guests/roomCount)
    // inherit the guest's choices instead of empty defaults.
    if (checkIn && checkOut) setDates(checkIn, checkOut);
    setGuests(guestCount);
    setRoomCount(roomCount);
    navigate("/booking/step1");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navigation />
        <main className="max-w-[1840px] mx-auto px-4 md:px-10 py-10"><HotelDetailLoader /></main>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navigation />
        <main className="max-w-[1840px] mx-auto px-4 md:px-10 py-10">
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-red-600 mb-4">{error || "Hotel not found"}</div>
          <Link to="/listing" className="text-[#1abc9c] hover:text-[#16a085]">← Back to listing</Link>
        </main>
      </div>
    );
  }

  // Derived data
  const heroImage = pickHotelImage(hotel);
  const amenities = extractAmenityNames(hotel.amenities);
  const description = hotel.hotel_description || hotel.description;
  const childPolicy = hotel.child_policy || hotel.childPolicy;
  const petPolicy = hotel.pet_policy || hotel.petPolicy;
  const smokingPolicy = hotel.smoking_policy || hotel.smokingPolicy;
  const contactName = hotel.contact_name || hotel.contactName;
  const contactPhone = hotel.contact_phone || hotel.contactPhone;
  const email = hotel.email;

  // All rooms for display: prefer hotel.rooms (with IDs), fallback to roomCategories.
  // Bundled "Foo Room-Bar Room" entries get split into separate cards so guests
  // see each category — this matches the user's expectation that distinct rooms
  // (e.g. Double Bed vs. Master Bed) appear as separate selectable cards.
  const baseRooms: PublicHotelRoom[] =
    Array.isArray(hotel.rooms) && hotel.rooms.length > 0
      ? hotel.rooms
      : (Array.isArray(hotel.roomCategories)
          ? hotel.roomCategories.map((rc: any, i: number) => ({
              id: null,
              room_name: rc.room_name || `Room ${i + 1}`,
              room_category: rc.room_category || "standard",
              occupancy_code: rc.occupancy_code || null,
              occupancy_type: rc.occupancy_type || null,
              price_per_night: Number(rc.base_price || 0),
              base_price: Number(rc.base_price || 0),
              currency_code: rc.currency_code || "TRY",
              price_raw: rc.price_raw || null,
            }))
          : []);
  const allDisplayRooms: PublicHotelRoom[] = baseRooms.flatMap(splitRoomDisplayEntries);

  const priceDisplay = selectedRoom?.price ? format(selectedRoom.price) : null;

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="scroll-progress" aria-hidden />
      <Navigation />

      <section className="glass-section-bg pt-6 md:pt-10 pb-20 md:pb-28 relative overflow-hidden">
        <span
          className="blob blob-teal w-[380px] h-[380px] -left-32 top-40 opacity-[0.18] dark:opacity-[0.12] mix-blend-multiply dark:mix-blend-screen"
          style={{ filter: 'blur(110px)' }}
          aria-hidden
        />

        <main className="max-w-[1840px] mx-auto px-4 md:px-10 fade-up-enter relative">
        <Link
          to="/listing"
          className="inline-flex items-center gap-1.5 text-[#1abc9c] hover:text-[#16a085] dark:text-[#2dd4bf] dark:hover:text-[#5eead4] mb-4 text-[14px] font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> {t("Back to all hotels")}
        </Link>

        {/* 1. Hero */}
        <HotelHero hotel={hotel} image={heroImage} />

        {/* 2. Quick Facts */}
        <HotelQuickFacts hotel={hotel} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ── Left column ── */}
          <div>

            {/* 3. About */}
            {description && (
              <Section title="About This Hotel" icon={<Building2 className="w-5 h-5" />}>
                <p className="text-[15px] text-[#4b5563] leading-[26px] whitespace-pre-line">{t(description)}</p>
              </Section>
            )}

            {/* 4. Amenities */}
            <Section title="Amenities" icon={<CheckCircle className="w-5 h-5" />}>
              <AmenitiesList amenities={amenities} />
            </Section>

            {/* 5. Room Categories — grouped by tier (Suite > Deluxe > Standard …)
                so guests can compare like-for-like at a glance. Within a tier
                rooms sort cheap → expensive. */}
            <Section title="Room Types" icon={<BedDouble className="w-5 h-5" />}>
              {allDisplayRooms.length === 0 ? (
                <p className="text-[14px] text-[#9ca3af] italic">No room information available for this hotel.</p>
              ) : (
                <div className="space-y-8">
                  {groupRoomsByTier(allDisplayRooms, hotel).map((group) => (
                    <div key={group.tier}>
                      {/* Category header — prominent so guests can scan tiers
                          (Standard / Deluxe / Suite …) at a glance. */}
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#1abc9c]/20 dark:border-[#2dd4bf]/30 text-[#1abc9c] dark:text-[#2dd4bf]"
                          aria-hidden
                        >
                          <BedDouble className="w-[18px] h-[18px]" strokeWidth={1.85} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Inter:Medium',sans-serif] text-[10px] tracking-[0.26em] uppercase text-[#1abc9c] dark:text-[#2dd4bf]">
                            {t("Category")}
                          </div>
                          <div className="font-['Poppins:Bold',sans-serif] text-[18px] md:text-[20px] tracking-[-0.018em] text-[#1f2937] dark:text-white leading-tight">
                            {t(group.tierLabel)}
                          </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-gradient-to-r from-[#1abc9c]/12 to-[#2dd4bf]/12 dark:from-[#2dd4bf]/15 dark:to-[#2dd4bf]/10 ring-1 ring-[#1abc9c]/25 dark:ring-[#2dd4bf]/30 text-[11px] font-['Inter:SemiBold',sans-serif] text-[#0f9b86] dark:text-[#2dd4bf]">
                          {group.rooms.length} {group.rooms.length === 1 ? t("option") : t("options")}
                        </span>
                      </div>
                      <div className="h-px w-full mb-4 bg-gradient-to-r from-[#1abc9c]/30 via-[#2dd4bf]/15 to-transparent" />
                      <div className="space-y-4">
                        {group.rooms.map(({ room, index }) => {
                          const displayName = room.room_name || `Room ${index + 1}`;
                          const viewRoom = bookableRooms.find(
                            (br) => room.id != null && String(br.id) === String(room.id),
                          ) || bookableRooms.find((br) => br.name === room.room_name);
                          const cardKey = `${viewRoom?.id ?? room.id ?? "x"}::${displayName}`;
                          const isSelected = selectedRoomKey === cardKey;
                          const rec = getRoomRecommendation(room, hotel, index);
                          return (
                            <RoomCategoryCard
                              key={cardKey}
                              room={room}
                              index={index}
                              image={pickRoomImage(hotel, index)}
                              onImageError={makeImageFallback({ id: hotel.id, name: hotel.name || hotel.hotel_name })}
                              recommendation={rec}
                              isSelected={isSelected}
                              onSelect={() => { if (viewRoom) handleSelectRoom(viewRoom, displayName); }}
                              canBook={!!viewRoom}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* 6. Policies */}
            {(childPolicy || petPolicy || smokingPolicy) && (
              <Section title="Hotel Policies" icon={<CheckCircle className="w-5 h-5" />}>
                <HotelPolicies childPolicy={childPolicy} petPolicy={petPolicy} smokingPolicy={smokingPolicy} />
              </Section>
            )}

            {/* 7. Contact */}
            {(contactName || contactPhone || email) && (
              <Section title="Contact Information" icon={<Phone className="w-5 h-5" />}>
                <HotelContactCard contactName={contactName} contactPhone={contactPhone} email={email} />
              </Section>
            )}

          </div>

          {/* ── Sticky Booking Sidebar — frosted glass ── */}
          <aside className="hero-glass rounded-2xl p-5 md:p-6 h-fit md:sticky md:top-24">
            <div className="font-['Inter:Medium',sans-serif] text-[10px] tracking-[0.26em] uppercase text-[#1abc9c] dark:text-[#2dd4bf] mb-1.5">
              {t("Reserve")}
            </div>
            <h3 className="font-['Poppins:Bold',sans-serif] text-[22px] tracking-[-0.018em] text-[#1f2937] dark:text-white mb-5">
              {t("Reserve Your Stay")}
            </h3>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[13px] font-medium text-[#6b7280] mb-1">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8c8c]" />
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6b7280] mb-1">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8c8c]" />
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6b7280] mb-1">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8c8c]" />
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:border-[#1abc9c] appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6b7280] mb-1">Rooms</label>
                <select
                  value={roomCount}
                  onChange={(e) => setSelectedRoomCount(Number(e.target.value))}
                  disabled={!selectedRoom}
                  className="w-full px-3 py-2.5 border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:border-[#1abc9c] disabled:opacity-50"
                >
                  {roomCountOptions.map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "room" : "rooms"}</option>
                  ))}
                </select>
                <p className="mt-1 text-[12px] text-[#9ca3af]">
                  {selectedRoom ? `Up to 4 rooms` : "Select a room first"}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-[#f0fdf9] border border-[#bbf7e4] px-3 py-2 text-[13px] text-[#0f766e] font-medium">
              {nights} {nights === 1 ? "night" : "nights"} selected
            </div>

            {/* Selected room summary */}
            <div className="rounded-xl border border-[#eaeaea] bg-[#fafafa] p-4 mb-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af] mb-1">
                Selected Room
              </div>
              {selectedRoom ? (
                <>
                  <div className="font-semibold text-[#1f2937] text-[15px]">{selectedDisplayName || selectedRoom.name}</div>
                  <div className="text-[13px] text-[#6b7280] mt-0.5">
                    {priceDisplay} per night × {roomCount} {roomCount === 1 ? "room" : "rooms"}
                  </div>
                  {selectedRoom.basePrice && selectedRoom.basePrice > selectedRoom.price && (
                    <div className="mt-1 text-[12px] text-[#10b981] font-medium">
                      Save {format(selectedRoom.savingsAmount * roomCount)} vs. base rate
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[14px] text-[#9ca3af] italic">No room selected yet</div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedRoom}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] text-white py-3.5 rounded-xl font-['Inter:SemiBold',sans-serif] text-[15px] disabled:opacity-40 disabled:cursor-not-allowed hover:translate-y-[-1px] transition-all duration-300 shadow-[0_10px_28px_-8px_rgba(26,188,156,0.55)] hover:shadow-[0_14px_34px_-8px_rgba(26,188,156,0.75)]"
            >
              {t("Continue to Booking")}
              <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
            </button>

            <p className="mt-3 text-[12px] text-[#9ca3af] dark:text-white/45 text-center">
              {t("Free cancellation on most rooms · No card required yet")}
            </p>
          </aside>

        </div>
        </main>
      </section>

      <Footer />
    </div>
  );
}
