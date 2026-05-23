import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  MapPin,
  Wallet,
  ChevronDown,
  MessageSquareQuote,
  Building2,
  Briefcase,
  GraduationCap,
  Map as MapIcon,
  Check,
  Send,
  Hotel,
  KeyRound,
  Handshake,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Compass,
  Zap,
  ArrowRight,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import { useSEO, breadcrumbLd } from "../hooks/useSEO";
import { API_BASE_URL, API_ENDPOINTS, joinUrl } from "../config/api";

// ─────────────────────────────────────────────
// Hero — split layout: pitch left, intake form right
// ─────────────────────────────────────────────
function GroupsHero() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    dates: "",
    groupSize: "",
    budget: "",
    type: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(joinUrl(API_BASE_URL, API_ENDPOINTS.GROUP_REQUESTS.SUBMIT), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Could not send your request");
      }
      toast.success(t("Group request sent"), {
        description: t("Our group desk will reply on WhatsApp or email within 24 hours."),
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        destination: "",
        dates: "",
        groupSize: "",
        budget: "",
        type: "",
      });
    } catch (err: any) {
      toast.error(t("Could not send your request"), {
        description: err?.message || t("Please try again in a moment."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative bg-white dark:bg-[#161616] border-b border-[#E6EAF0] dark:border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-10 py-8 md:py-12 lg:py-14">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
          {/* LEFT — pitch */}
          <div>
            <div className="font-['Inter:SemiBold',sans-serif] text-[11px] md:text-[12px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
              {t("United Hotels — Groups & Events")}
            </div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[30px] sm:text-[34px] md:text-[40px] lg:text-[44px] xl:text-[48px] leading-[1.1] tracking-[-0.02em] text-[#0B1F3B] dark:text-white mb-3 md:mb-4">
              {t("Group Hotel Solutions in Turkey")}
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16.5px] leading-[1.55] text-[#6B7280] dark:text-white/70 mb-5 md:mb-6 max-w-[540px]">
              {t("Reliable hotel sourcing for groups, events, and corporate travel — with local coordination and competitive negotiated rates.")}
            </p>

            {/* Trust strip — quick credibility cues */}
            <ul className="space-y-2 mb-2">
              {[
                "Direct hotel agreements across 8 Turkish cities",
                "Dedicated group desk — replies within 24 hours",
                "Single point of contact from quote to checkout",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-[14px] text-[#0B1F3B] dark:text-white/85"
                >
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" strokeWidth={3} />
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — intake form
              .dark-accent-ring lifts the conversion form above the
              charcoal page with a subtle blue outline glow in dark mode. */}
          <form
            onSubmit={handleSubmit}
            className="dark-accent-ring bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_8px_32px_rgba(11,31,59,0.10)]"
            aria-label="Group request form"
          >
            <div className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[19px] text-[#0B1F3B] dark:text-white mb-1">
              {t("Tell us about your group")}
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6B7280] dark:text-white/70 mb-5">
              {t("Send the basics — we'll come back with options + pricing.")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contact details — required so the group desk can actually reach the user. */}
              <div className="relative sm:col-span-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("Full name")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="name"
                  className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <input
                  type="email"
                  placeholder={t("Email address")}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <input
                  type="tel"
                  placeholder={t("Phone / WhatsApp number")}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  autoComplete="tel"
                  className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                />
              </div>

              <div className="relative sm:col-span-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("Destination (e.g. Istanbul, Cappadocia)")}
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  required
                  className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                />
              </div>

              <div className="relative sm:col-span-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <input
                  type="text"
                  placeholder={t("Dates (e.g. 12-15 May 2026)")}
                  value={form.dates}
                  onChange={(e) => setForm({ ...form, dates: e.target.value })}
                  required
                  className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                />
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <select
                  value={form.groupSize}
                  onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
                  required
                  aria-label={t("Group size")}
                  className="w-full h-[44px] pl-10 pr-9 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] appearance-none transition-colors"
                >
                  <option value="">{t("Group size")}</option>
                  <option value="10-20">10–20 {t("guests")}</option>
                  <option value="21-50">21–50 {t("guests")}</option>
                  <option value="51-100">51–100 {t("guests")}</option>
                  <option value="100+">100+ {t("guests")}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>

              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <select
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  aria-label={t("Budget range")}
                  className="w-full h-[44px] pl-10 pr-9 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] appearance-none transition-colors"
                >
                  <option value="">{t("Budget per night")}</option>
                  <option value="<50">{t("Under $50")}</option>
                  <option value="50-100">$50–$100</option>
                  <option value="100-200">$100–$200</option>
                  <option value="200+">{t("$200 and up")}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>

              <div className="relative sm:col-span-2">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  required
                  aria-label={t("Group type")}
                  className="w-full h-[44px] pl-10 pr-9 rounded-xl bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 text-[#111827] dark:text-white focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] appearance-none transition-colors"
                >
                  <option value="">{t("Type of group")}</option>
                  <option value="tour">{t("Tour group")}</option>
                  <option value="corporate">{t("Corporate booking")}</option>
                  <option value="event">{t("Event or conference")}</option>
                  <option value="wedding">{t("Wedding party")}</option>
                  <option value="delegation">{t("Delegation")}</option>
                  <option value="other">{t("Other")}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="sm:col-span-2 h-[48px] px-6 rounded-xl bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-['Inter:SemiBold',sans-serif] text-[15px] flex items-center justify-center gap-2 transition-colors shadow-[0_4px_16px_rgba(47,128,237,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" strokeWidth={2.4} />
                {submitting ? t("Sending…") : t("Submit Request")}
              </button>
            </div>

            <p className="mt-4 font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6B7280] dark:text-white/60 text-center">
              {t("No spam. We only use your details to prepare your offer.")}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Why groups choose us — 4 specialties
// ─────────────────────────────────────────────
function WhyGroupsSection() {
  const { t } = useLanguage();
  const specialties = [
    { Icon: MapIcon, title: "Tour groups", sub: "Multi-stop itineraries, single-vendor coordination." },
    { Icon: Briefcase, title: "Corporate bookings", sub: "Negotiated rates, billing on PO, single invoice." },
    { Icon: GraduationCap, title: "Events & delegations", sub: "Conferences, training trips, official visits." },
    { Icon: Hotel, title: "Multi-hotel itineraries", sub: "City-to-city blocks, room-list managed for you." },
  ];

  return (
    <section className="bg-[#EFF2F8] dark:bg-[#0A0A0A] py-10 md:py-14">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="text-center mb-8 md:mb-10 max-w-[640px] mx-auto">
          <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
            {t("Why groups choose us")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[36px] leading-[1.15] tracking-[-0.02em] text-[#0B1F3B] dark:text-white mb-3">
            {t("Built for group travel, not adapted for it.")}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[1.6] text-[#6B7280] dark:text-white/70">
            {t("Most OTAs are built for individuals. We are not.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {specialties.map(({ Icon, title, sub }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 rounded-2xl p-6 hover:border-[#2F80ED] hover:shadow-[0_8px_24px_rgba(47,128,237,0.10)] transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-[#2F80ED]/10 text-[#2F80ED] flex items-center justify-center mb-4">
                <Icon className="w-[20px] h-[20px]" strokeWidth={1.75} />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16.5px] tracking-[-0.005em] text-[#0B1F3B] dark:text-white mb-1.5">
                {t(title)}
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[13.5px] leading-[1.55] text-[#6B7280] dark:text-white/70">
                {t(sub)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// What we handle — 6 service items
// ─────────────────────────────────────────────
function WhatWeHandleSection() {
  const { t } = useLanguage();
  const items = [
    { Icon: Hotel, label: "Hotel sourcing" },
    { Icon: KeyRound, label: "Room allocations" },
    { Icon: Wallet, label: "Group pricing negotiations" },
    { Icon: HeartHandshake, label: "Special requests" },
    { Icon: Compass, label: "On-ground coordination" },
    { Icon: Zap, label: "Last-minute changes" },
  ];

  return (
    <section
      className="py-10 md:py-14"
      style={{ background: "var(--brand-accent-soft)" }}
    >
      <div className="max-w-[1080px] mx-auto px-4 md:px-10">
        <div className="text-center mb-10 md:mb-12 max-w-[620px] mx-auto">
          <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
            {t("What we handle for you")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[36px] leading-[1.15] tracking-[-0.02em] text-[#0B1F3B] dark:text-white">
            {t("We take care of everything.")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(({ Icon, label }) => (
            <div
              key={label}
              className="bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 rounded-xl px-5 py-4 flex items-center gap-3"
            >
              <span className="shrink-0 w-9 h-9 rounded-lg bg-[#2F80ED]/10 text-[#2F80ED] flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.85} />
              </span>
              <span className="font-['Poppins:SemiBold',sans-serif] text-[14.5px] text-[#0B1F3B] dark:text-white">
                {t(label)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Why we win deals — 5 differentiators (left text + check list right)
// ─────────────────────────────────────────────
function WhyWeWinSection() {
  const { t } = useLanguage();
  const wins = [
    "Direct hotel relationships",
    "Local team in destination",
    "Faster response times",
    "Flexible group terms",
    "Real accountability",
  ];

  return (
    <section className="bg-white dark:bg-[#161616] py-10 md:py-14">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
              {t("Why we win deals")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[40px] leading-[1.12] tracking-[-0.02em] text-[#0B1F3B] dark:text-white mb-4">
              {t("Better control. Better pricing. Better execution.")}
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.6] text-[#6B7280] dark:text-white/70 max-w-[480px]">
              {t("We're not a generic marketplace. We negotiate, plan, and execute group bookings ourselves — so you get one accountable partner instead of a dozen vendors.")}
            </p>
          </div>

          <ul className="space-y-3">
            {wins.map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-4 bg-white dark:bg-[#1F1F1F] border border-[#E6EAF0] dark:border-white/10 rounded-xl p-4"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#2F80ED]/10 text-[#2F80ED] flex items-center justify-center font-['Poppins:SemiBold',sans-serif] text-[13px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-['Poppins:SemiBold',sans-serif] text-[15px] md:text-[16px] text-[#0B1F3B] dark:text-white">
                  {t(item)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Process timeline — 4 steps
// ─────────────────────────────────────────────
function ProcessSection() {
  const { t } = useLanguage();
  const steps = [
    { n: "01", title: "Send group details", sub: "Fill the form or WhatsApp us your basics." },
    { n: "02", title: "We propose hotel options", sub: "Curated shortlist with rates, photos, and terms." },
    { n: "03", title: "You review & confirm", sub: "Pick your favourite, lock in dates, sign one document." },
    { n: "04", title: "We handle execution locally", sub: "Room lists, check-ins, on-the-ground coordination." },
  ];

  return (
    <section className="bg-[#F7F9FC] dark:bg-[#0A0A0A] py-10 md:py-14">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="text-center mb-8 md:mb-10 max-w-[620px] mx-auto">
          <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
            {t("How it works")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[36px] leading-[1.15] tracking-[-0.02em] text-[#0B1F3B] dark:text-white">
            {t("Four steps, no surprises.")}
          </h2>
        </div>

        {/* Horizontal timeline on lg+, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-0 relative">
          {/* Connector line on lg+ */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-[28px] left-[12.5%] right-[12.5%] h-px bg-[#E6EAF0] dark:bg-white/10"
          />
          {steps.map(({ n, title, sub }) => (
            <div key={n} className="relative flex flex-col items-center text-center px-4">
              <div className="relative z-10 w-14 h-14 rounded-full bg-white dark:bg-[#161616] border-2 border-[#2F80ED] text-[#2F80ED] flex items-center justify-center font-['Poppins:Bold',sans-serif] text-[16px] shadow-[0_4px_16px_rgba(47,128,237,0.18)]">
                {n}
              </div>
              <h3 className="mt-4 font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-[#0B1F3B] dark:text-white mb-1.5">
                {t(title)}
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[13px] md:text-[13.5px] leading-[1.55] text-[#6B7280] dark:text-white/70 max-w-[220px]">
                {t(sub)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────
function FinalCTASection() {
  const { t } = useLanguage();
  return (
    <section className="bg-white dark:bg-[#161616] py-10 md:py-14 border-t border-[#E6EAF0] dark:border-white/10">
      <div className="max-w-[1080px] mx-auto px-4 md:px-10">
        <div
          className="rounded-2xl p-8 md:p-14 lg:p-16 text-center shadow-[0_8px_32px_rgba(11,31,59,0.18)]"
          style={{ background: "linear-gradient(135deg, #0B1F3B 0%, #112A52 100%)" }}
        >
          <div className="inline-flex items-center gap-2 font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#5DA0F8] mb-4">
            <Handshake className="w-3.5 h-3.5" strokeWidth={2} />
            {t("Talk to our group desk")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[40px] leading-[1.15] tracking-[-0.02em] text-white mb-4">
            {t("Get a tailored group offer.")}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.55] text-white/75 mb-8 max-w-[520px] mx-auto">
            {t("Send us your group details — we'll come back with hotel options and pricing within 24 hours.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 h-[52px] px-7 rounded-xl bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-['Inter:SemiBold',sans-serif] text-[15px] transition-colors shadow-[0_4px_16px_rgba(47,128,237,0.3)]"
            >
              <MessageSquareQuote className="w-[18px] h-[18px]" strokeWidth={2.4} />
              {t("Request Group Quote")}
            </a>
            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[52px] px-7 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white font-['Inter:SemiBold',sans-serif] text-[15px] transition-colors"
            >
              {t("Chat on WhatsApp")}
              <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 pt-6 border-t border-white/10">
            {[
              "24h response SLA",
              "Direct hotel rates",
              "One single invoice",
            ].map((label) => (
              <div key={label} className="flex items-center gap-1.5 text-white/75">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5DA0F8]" strokeWidth={2.4} />
                <span className="font-['Inter:Regular',sans-serif] text-[13px]">{t(label)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick contact line — fast scan for impatient buyers */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[#6B7280] dark:text-white/70 font-['Inter:Regular',sans-serif] text-[13px]">
          <span className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2F80ED]" strokeWidth={2} />
            {t("Avg. response: under 2 hours during business hours")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2F80ED]" strokeWidth={2} />
            {t("Local desks: Istanbul · Cappadocia · Antalya")}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────
export function GroupsPage() {
  useSEO({
    title: "Group hotel bookings in Turkey | Book United Hotels",
    description:
      "Reliable hotel sourcing for tour groups, corporate travel, and events across Istanbul and Turkey. Direct hotel agreements, negotiated rates, 24-hour quote turnaround.",
    canonical: "/groups",
    jsonLd: breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Groups", url: "/groups" },
    ]),
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0A0A0A]">
      <Navigation />
      <div id="top" />
      <GroupsHero />
      <WhyGroupsSection />
      <WhatWeHandleSection />
      <WhyWeWinSection />
      <ProcessSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}

export default GroupsPage;
