import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { lookupTranslation } from "./translations";
import { API_BASE_URL, API_ENDPOINTS, joinUrl } from "../config/api";

export type LanguageCode =
  | "en"
  | "tr"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "ar"
  | "ru"
  | "zh"
  | "ja";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "TRY"
  | "AED"
  | "SAR"
  | "RUB"
  | "CNY"
  | "JPY";

export interface Region {
  code: string; // BCP-47-ish, e.g. "en-US", "tr-TR"
  label: string;
  language: LanguageCode;
  languageLabel: string;
  currency: CurrencyCode;
  flag: string;
}

export const REGIONS: Region[] = [
  { code: "en-US", label: "United States", language: "en", languageLabel: "English", currency: "USD", flag: "🇺🇸" },
  { code: "en-GB", label: "United Kingdom", language: "en", languageLabel: "English", currency: "GBP", flag: "🇬🇧" },
  { code: "tr-TR", label: "Türkiye", language: "tr", languageLabel: "Türkçe", currency: "TRY", flag: "🇹🇷" },
  { code: "de-DE", label: "Deutschland", language: "de", languageLabel: "Deutsch", currency: "EUR", flag: "🇩🇪" },
  { code: "fr-FR", label: "France", language: "fr", languageLabel: "Français", currency: "EUR", flag: "🇫🇷" },
  { code: "es-ES", label: "España", language: "es", languageLabel: "Español", currency: "EUR", flag: "🇪🇸" },
  { code: "it-IT", label: "Italia", language: "it", languageLabel: "Italiano", currency: "EUR", flag: "🇮🇹" },
  { code: "ar-AE", label: "الإمارات", language: "ar", languageLabel: "العربية", currency: "AED", flag: "🇦🇪" },
  { code: "ar-SA", label: "السعودية", language: "ar", languageLabel: "العربية", currency: "SAR", flag: "🇸🇦" },
  { code: "ru-RU", label: "Россия", language: "ru", languageLabel: "Русский", currency: "RUB", flag: "🇷🇺" },
  { code: "zh-CN", label: "中国", language: "zh", languageLabel: "中文", currency: "CNY", flag: "🇨🇳" },
  { code: "ja-JP", label: "日本", language: "ja", languageLabel: "日本語", currency: "JPY", flag: "🇯🇵" },
];

// Approximate FX — base unit is USD since hotel prices are stored in USD
// (matches scripts/seedNeon.js + the SQLite mock seed). These are static
// reference rates; refresh quarterly. Travel sites commonly do this.
export const FX_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  TRY: 34,
  AED: 3.67,
  SAR: 3.75,
  RUB: 90,
  CNY: 7.2,
  JPY: 150,
};

// Backwards-compat alias — older code (currency.ts, components) still imports
// the previous name. Semantically the rates are now USD-based.
export const FX_FROM_TRY = FX_FROM_USD;

// Currencies where decimals are unhelpful (large unit or no minor unit)
const ZERO_DECIMAL_CURRENCIES: CurrencyCode[] = ["JPY", "RUB", "CNY", "TRY"];

// Legacy alias — kept so older code that imports `SiteLanguage` keeps working
export type SiteLanguage = LanguageCode;

export interface LocaleSuggestion {
  region: Region;
  country: string | null;
  source: string;
}

interface LanguageContextValue {
  region: Region;
  language: LanguageCode;
  currency: CurrencyCode;
  locale: string;
  regions: Region[];
  setRegion: (code: string) => void;
  setLanguage: (code: LanguageCode) => void;
  t: (text: string) => string;
  format: (amount: number | null | undefined) => string;
  convert: (amount: number) => number;
  // Suggested region from IP detection — non-null only when the detected
  // region is different from the currently active one and the user hasn't
  // dismissed the suggestion. The locale modal listens for this.
  suggestion: LocaleSuggestion | null;
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
}

const STORAGE_KEY = "united-hotels-region";
const LEGACY_STORAGE_KEY = "united-hotels-language";

const TR_TRANSLATIONS: Record<string, string> = {
  Home: "Ana Sayfa",
  "Why Choose United Hotels": "Neden United Hotels",
  "Featured Hotels": "Öne Çıkan Oteller",
  Quality: "Kalite",
  FAQ: "SSS",
  Login: "Giriş",
  "Guest Portal": "Misafir Paneli",
  "Manage bookings": "Rezervasyonları yönetin",
  "Admin Login": "Yönetici Girişi",
  "Staff access": "Personel erişimi",
  Destinations: "Destinasyonlar",
  Istanbul: "İstanbul",
  Antalya: "Antalya",
  Cappadocia: "Kapadokya",
  "Login / Guest Portal": "Giriş / Misafir Paneli",
  Turkey: "Türkiye",
  English: "İngilizce",
  Turkish: "Türkçe",
  "Stay Smart. Stay United.": "Akıllı Konakla. United ile Kal.",
  Destination: "Destinasyon",
  "Check-in": "Giriş",
  "Check-out": "Çıkış",
  Guests: "Misafir",
  "Find Hotels": "Otel Bul",
  "Where are you going?": "Nereye gidiyorsunuz?",
  "Where to?": "Nereye?",
  "Add guests": "Misafir ekle",
  "Search Hotels": "Otel Ara",
  "1 guest": "1 misafir",
  "2 guests": "2 misafir",
  "3 guests": "3 misafir",
  "4+ guests": "4+ misafir",
  Search: "Ara",
  "Why Choose Us": "Neden Biz",
  "Why United Hotels": "Neden United Hotels",
  "Not another OTA.": "Sıradan bir OTA değiliz.",
  "Personally Selected": "Özenle Seçildi",
  "Better Direct Rates": "Daha İyi Doğrudan Fiyatlar",
  "Total Price Upfront": "Toplam Fiyat Önceden",
  "WhatsApp Support": "WhatsApp Desteği",
  "Flexible Cancellation": "Esnek İptal",
  "By the numbers": "Rakamlarla",
  "A focused team. Real outcomes.": "Odaklanmış bir ekip. Gerçek sonuçlar.",
  "Verified hotels": "Doğrulanmış oteller",
  "Turkish cities": "Türk şehirleri",
  "Happy guests": "Mutlu misafirler",
  "Average rating": "Ortalama puan",
  "Curated stays": "Seçili konaklamalar",
  "Stays worth booking this week.": "Bu hafta rezerve edilmeye değer konaklamalar.",
  "View all stays": "Tüm konaklamaları gör",
  night: "gece",
  Save: "Tasarruf",
  "Quality you can verify": "Doğrulayabileceğiniz kalite",
  "Every hotel, personally vetted.": "Her otel, bizzat denetlendi.",
  "Our promise": "Sözümüz",
  "Got questions?": "Sorunuz mu var?",
  "Frequently asked questions.": "Sıkça sorulan sorular.",
  "Talk to us": "Bize ulaşın",
  "Plan your stay": "Konaklamanızı planlayın",
  "Ready to book your Turkey stay?": "Türkiye konaklamanızı rezerve etmeye hazır mısınız?",
  "Find hotels in Turkey": "Türkiye'de otel bul",
  "Free cancellation": "Ücretsiz iptal",
  "No hidden fees": "Gizli ücret yok",
  "Local support 24/7": "7/24 yerel destek",
  "Explore neighbourhoods": "Semtleri keşfet",
  "Where to stay in Turkey.": "Türkiye'de nerede kalınır.",
  "View all neighbourhoods": "Tüm semtleri gör",
  Hotels: "Oteller",
  "Avg/night": "Ort/gece",
  Rating: "Puan",
  "Book stay": "Rezervasyon",
  Account: "Hesap",
  Menu: "Menü",
  Language: "Dil",
  Region: "Bölge",
  "Choose your region": "Bölgenizi seçin",
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const DEFAULT_REGION = REGIONS[0];

function findRegion(code: string | null | undefined): Region | undefined {
  if (!code) return undefined;
  return REGIONS.find((r) => r.code === code);
}

function staticTranslate(text: string, language: LanguageCode): string {
  if (language === "en") return text;
  // 1) Multi-language static dictionary (covers nav + most visible UI strings)
  const fromCommon = lookupTranslation(text, language);
  if (fromCommon) return fromCommon;
  // 2) Legacy Turkish-only dictionary (longer-form copy that's not in the common dict)
  if (language === "tr") return TR_TRANSLATIONS[text] ?? text;
  return text;
}

// ─── IP-based region auto-detection ─────────────────────────
// Maps ISO 3166-1 alpha-2 country codes to one of our 12 region codes.
const COUNTRY_TO_REGION: Record<string, string> = {
  US: "en-US", CA: "en-US",
  GB: "en-GB", IE: "en-GB", AU: "en-GB", NZ: "en-GB",
  TR: "tr-TR",
  DE: "de-DE", AT: "de-DE", CH: "de-DE", LI: "de-DE",
  FR: "fr-FR", BE: "fr-FR", LU: "fr-FR", MC: "fr-FR",
  ES: "es-ES", MX: "es-ES", AR: "es-ES", CL: "es-ES", CO: "es-ES", PE: "es-ES",
  IT: "it-IT", SM: "it-IT", VA: "it-IT",
  AE: "ar-AE", BH: "ar-AE", KW: "ar-AE", OM: "ar-AE", QA: "ar-AE", JO: "ar-AE", LB: "ar-AE", EG: "ar-AE",
  SA: "ar-SA",
  RU: "ru-RU", BY: "ru-RU", KZ: "ru-RU", KG: "ru-RU", UA: "ru-RU",
  CN: "zh-CN", HK: "zh-CN", TW: "zh-CN", SG: "zh-CN",
  JP: "ja-JP",
};

interface IpInfo { country?: string; country_code?: string }

interface LocaleDetectResponse {
  country: string | null;
  region: string;
  language: LanguageCode;
  currency: CurrencyCode;
  source: string;
  matched: boolean;
}

// Backend-side detection. Preferred over the third-party calls below
// because it works behind ad blockers, doesn't hit CORS, and reuses the
// same priority chain (CDN header → IP geo → Accept-Language) the booking
// flow already uses to tag bookings with a country.
async function detectViaBackend(): Promise<LocaleDetectResponse | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(joinUrl(API_BASE_URL, API_ENDPOINTS.LOCALE_DETECT), {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const data = (await response.json()) as LocaleDetectResponse;
    if (!data || !data.region) return null;
    return data;
  } catch {
    return null;
  }
}

async function detectCountry(): Promise<string | null> {
  // Try a couple of free endpoints; ignore failures silently.
  const endpoints = [
    "https://ipapi.co/json/",
    "https://ipwho.is/",
  ];
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) continue;
      const data: IpInfo & Record<string, any> = await response.json();
      const code: string | undefined = data?.country_code || data?.country || data?.countryCode;
      if (typeof code === "string" && code.length >= 2) return code.slice(0, 2).toUpperCase();
    } catch {
      continue;
    }
  }
  return null;
}

function browserLanguageRegion(): Region | null {
  if (typeof navigator === "undefined") return null;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of candidates) {
    if (!tag) continue;
    // Try exact BCP-47 match first (e.g. "en-GB")
    const exact = REGIONS.find((r) => r.code.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;
    // Then language-only (e.g. "de" -> de-DE)
    const lang = tag.split("-")[0]?.toLowerCase();
    const byLang = REGIONS.find((r) => r.language === lang);
    if (byLang) return byLang;
  }
  return null;
}

// ─── Backend-powered Google Translate ───────────────────────────────
// Calls our `/api/translate` route (powered by google-translate-api-x).
// Batches calls together within a short window so a section that asks
// for 30 strings on mount makes one HTTP request, not 30.

interface PendingItem {
  text: string;
  resolve: (value: string | null) => void;
}

const pendingByLanguage = new Map<LanguageCode, PendingItem[]>();
const flushTimers = new Map<LanguageCode, number>();
const BATCH_WINDOW_MS = 80;

function flushBatch(language: LanguageCode) {
  flushTimers.delete(language);
  const queue = pendingByLanguage.get(language);
  if (!queue || !queue.length) return;
  pendingByLanguage.set(language, []);

  const texts = queue.map((item) => item.text);
  fetch(joinUrl(API_BASE_URL, API_ENDPOINTS.TRANSLATE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, target: language, source: "en" }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const out: string[] = Array.isArray(data?.translations) ? data.translations : [];
      queue.forEach((item, i) => {
        const t = out[i];
        item.resolve(typeof t === "string" && t && t !== item.text ? t : null);
      });
    })
    .catch((err) => {
      console.error("[api] translate batch failed:", err);
      queue.forEach((item) => item.resolve(null));
    });
}

async function translateWithApi(text: string, language: LanguageCode): Promise<string | null> {
  if (language === "en") return text;
  return new Promise((resolve) => {
    const queue = pendingByLanguage.get(language) || [];
    queue.push({ text, resolve });
    pendingByLanguage.set(language, queue);
    if (!flushTimers.has(language)) {
      const id = window.setTimeout(() => flushBatch(language), BATCH_WINDOW_MS);
      flushTimers.set(language, id);
    }
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<Region>(() => {
    if (typeof window === "undefined") return DEFAULT_REGION;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const found = findRegion(saved);
    if (found) return found;
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "Turkish") return findRegion("tr-TR") ?? DEFAULT_REGION;
    // Synchronous best-guess from the browser's languages list. The async
    // IP geolocation effect below may refine this once a country is known.
    const fromBrowser = browserLanguageRegion();
    if (fromBrowser) return fromBrowser;
    return DEFAULT_REGION;
  });

  const [suggestion, setSuggestion] = useState<LocaleSuggestion | null>(null);

  // IP geolocation runs once per visit and surfaces a suggestion to the UI.
  // We always run detection (even when a region is saved) so a returning
  // visitor who's now in a different country still gets the prompt — but
  // a saved region keeps winning until they accept the suggestion.
  const autoDetectedRef = useRef(false);
  useEffect(() => {
    if (autoDetectedRef.current) return;
    if (typeof window === "undefined") return;
    autoDetectedRef.current = true;

    const SUGGESTION_DISMISSED_KEY = "united-hotels-suggestion-dismissed";
    const dismissedFor = window.localStorage.getItem(SUGGESTION_DISMISSED_KEY);
    const hasManualChoice = Boolean(window.localStorage.getItem(STORAGE_KEY));

    let cancelled = false;
    (async () => {
      // Backend detection first — works behind ad blockers and reuses the
      // same chain the booking flow uses.
      const backend = await detectViaBackend();
      let suggestedRegion: Region | undefined;
      let country: string | null = null;
      let source = "fallback";

      if (backend && backend.region) {
        suggestedRegion = findRegion(backend.region);
        country = backend.country;
        source = backend.source;
      }

      // Fall back to the third-party endpoints if the backend couldn't
      // resolve a country (e.g. localhost dev where there's no real IP).
      if (!suggestedRegion) {
        const fallbackCountry = await detectCountry();
        if (fallbackCountry) {
          country = fallbackCountry;
          const target = COUNTRY_TO_REGION[fallbackCountry];
          suggestedRegion = target ? findRegion(target) : undefined;
          source = "browser-ipapi";
        }
      }

      if (cancelled || !suggestedRegion) return;

      // No prior choice → silently apply the suggestion (keeps the existing
      // "first visit just works" behavior). Then also surface a small
      // confirmation banner so the user knows it happened and can override.
      if (!hasManualChoice) {
        setRegionState(suggestedRegion);
        if (dismissedFor !== suggestedRegion.code) {
          setSuggestion({ region: suggestedRegion, country, source });
        }
        return;
      }

      // Prior choice exists → only prompt if the suggested region differs
      // from what they have, and they haven't dismissed this same suggestion.
      const currentSaved = window.localStorage.getItem(STORAGE_KEY);
      if (
        suggestedRegion.code !== currentSaved &&
        dismissedFor !== suggestedRegion.code
      ) {
        setSuggestion({ region: suggestedRegion, country, source });
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return;
    setRegionState(suggestion.region);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("united-hotels-suggestion-dismissed");
    }
    setSuggestion(null);
  }, [suggestion]);

  const dismissSuggestion = useCallback(() => {
    if (!suggestion) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "united-hotels-suggestion-dismissed",
        suggestion.region.code,
      );
    }
    setSuggestion(null);
  }, [suggestion]);

  const [runtimeTranslations, setRuntimeTranslations] = useState<Record<string, string>>({});
  const pendingTranslations = useRef<Set<string>>(new Set());

  const setRegion = useCallback((code: string) => {
    const next = findRegion(code);
    if (!next) return;
    setRegionState(next);
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    // Pick the first region that uses this language
    const next = REGIONS.find((r) => r.language === code);
    if (next) setRegionState(next);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, region.code);
    }
    document.documentElement.lang = region.language;
    document.documentElement.dir = region.language === "ar" ? "rtl" : "ltr";
  }, [region]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (text: string) => {
      const staticHit = staticTranslate(text, region.language);
      if (staticHit !== text || region.language === "en") return staticHit;

      const cacheKey = `${region.language}::${text}`;
      const cached = runtimeTranslations[cacheKey];
      if (cached) return cached;

      if (!pendingTranslations.current.has(cacheKey)) {
        pendingTranslations.current.add(cacheKey);
        void translateWithApi(text, region.language)
          .then((translated) => {
            if (translated && translated !== text) {
              setRuntimeTranslations((prev) => ({ ...prev, [cacheKey]: translated }));
            }
          })
          .finally(() => {
            pendingTranslations.current.delete(cacheKey);
          });
      }
      return text;
    };

    const convert = (amount: number) => {
      const rate = FX_FROM_TRY[region.currency] ?? 1;
      return amount * rate;
    };

    const format = (amount: number | null | undefined) => {
      if (amount === null || amount === undefined || Number.isNaN(amount)) {
        return "—";
      }
      const converted = convert(amount);
      const fractionDigits = ZERO_DECIMAL_CURRENCIES.includes(region.currency) ? 0 : 0;
      try {
        return new Intl.NumberFormat(region.code, {
          style: "currency",
          currency: region.currency,
          maximumFractionDigits: fractionDigits,
          minimumFractionDigits: 0,
        }).format(converted);
      } catch {
        return `${region.currency} ${Math.round(converted)}`;
      }
    };

    return {
      region,
      language: region.language,
      currency: region.currency,
      locale: region.code,
      regions: REGIONS,
      setRegion,
      setLanguage,
      t,
      format,
      convert,
      suggestion,
      acceptSuggestion,
      dismissSuggestion,
    };
  }, [region, runtimeTranslations, setRegion, setLanguage, suggestion, acceptSuggestion, dismissSuggestion]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
