import { Globe, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Toast-style banner that appears when the IP-based detector finds a region
// that differs from the one currently active. The user can accept (switch
// language + currency) or keep their current setting.
//
// Mounted once at the app root — reads `suggestion` from LanguageContext
// and renders nothing when it's null. Each user only sees a given
// suggestion once; dismissing it persists to localStorage.

const FLAG_FOR_COUNTRY: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", TR: "🇹🇷", DE: "🇩🇪", FR: "🇫🇷", ES: "🇪🇸",
  IT: "🇮🇹", AE: "🇦🇪", SA: "🇸🇦", RU: "🇷🇺", CN: "🇨🇳", JP: "🇯🇵",
};

export function LocaleSuggestionModal() {
  const { suggestion, region, acceptSuggestion, dismissSuggestion } = useLanguage();
  if (!suggestion) return null;
  if (suggestion.region.code === region.code) return null;

  const flag = (suggestion.country && FLAG_FOR_COUNTRY[suggestion.country]) || suggestion.region.flag;
  const countryName = suggestion.region.label;

  return (
    <div
      role="dialog"
      aria-label="Region suggestion"
      className="fixed bottom-5 left-5 z-[55] w-[330px] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-white dark:bg-[#1f2937] shadow-[0_22px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="bg-gradient-to-r from-[#2F80ED] to-[#5DA0F8] px-4 py-3 flex items-start justify-between text-white">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 shrink-0" />
          <div className="font-['Poppins:SemiBold',sans-serif] text-[13.5px] leading-tight truncate">
            Region detected
          </div>
        </div>
        <button
          type="button"
          onClick={dismissSuggestion}
          aria-label="Dismiss"
          className="text-white/85 hover:text-white -m-1 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-[28px] leading-none">{flag}</div>
          <div className="min-w-0">
            <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#1f2937] dark:text-white leading-tight">
              Looks like you're browsing from {countryName}
            </div>
            <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280] dark:text-white/60 mt-0.5">
              Switch to{" "}
              <span className="font-semibold text-[#2F80ED] dark:text-[#5DA0F8]">
                {suggestion.region.languageLabel}
              </span>{" "}
              and prices in{" "}
              <span className="font-semibold text-[#2F80ED] dark:text-[#5DA0F8]">
                {suggestion.region.currency}
              </span>
              ?
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={acceptSuggestion}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2F80ED] hover:bg-[#1E5FBC] text-white py-2 rounded-lg text-[12.5px] font-['Inter:SemiBold',sans-serif] shadow-[0_8px_18px_-8px_rgba(47,128,237,0.7)] transition-colors"
          >
            Yes, switch
          </button>
          <button
            type="button"
            onClick={dismissSuggestion}
            className="flex-1 inline-flex items-center justify-center bg-[#f1f5f9] dark:bg-white/[0.06] hover:bg-[#e2e8f0] dark:hover:bg-white/[0.10] text-[#3b3b3b] dark:text-white/85 py-2 rounded-lg text-[12.5px] font-['Inter:Medium',sans-serif] transition-colors"
          >
            Keep {region.languageLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocaleSuggestionModal;
