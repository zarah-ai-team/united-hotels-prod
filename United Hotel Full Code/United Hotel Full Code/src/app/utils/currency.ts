import { FX_FROM_TRY, REGIONS, type CurrencyCode } from "../context/LanguageContext";

const ZERO_DECIMAL: CurrencyCode[] = ["JPY", "RUB", "CNY", "TRY"];

/**
 * Format a price (stored in TRY) for the active region. The `language`/region
 * parameter accepts a language code ("en", "tr", "de", …) or a region code
 * ("en-US", "tr-TR", …). Prefer `useLanguage().format` in components — this
 * helper exists so legacy `formatCurrency(amount, language)` callers keep working.
 */
export function formatCurrency(
  amount: number | null | undefined,
  language: string = "en",
) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }

  const region =
    REGIONS.find((r) => r.code === language) ||
    REGIONS.find((r) => r.language === language) ||
    REGIONS[0];

  const rate = FX_FROM_TRY[region.currency] ?? 1;
  const converted = amount * rate;
  const fractionDigits = ZERO_DECIMAL.includes(region.currency) ? 0 : 0;

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
}
