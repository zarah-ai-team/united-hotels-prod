import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import { Navigation } from "@/shared/components/Navigation";

// Landing page the İş Bankası callback redirects the browser to after a
// payment attempt: /payment/result?status=success|failed&oid=...&reason=...
export function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get("status");
  const oid = params.get("oid") || "";
  const reason = params.get("reason") || "";
  const success = status === "success";

  const failureMessage = useMemo(() => {
    switch (reason) {
      case "signature":
        return "We couldn't verify the payment response. No charge was made.";
      case "declined":
        return "Your card was declined by the bank. Please try a different card.";
      case "amount_mismatch":
        return "The payment amount didn't match your booking. No charge was completed.";
      case "unknown_order":
        return "We couldn't match this payment to a booking.";
      default:
        return "Your payment could not be completed. You have not been charged.";
    }
  }, [reason]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0f1419]">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] dark:text-white/60 hover:text-[#2F80ED] mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="glass-card rounded-2xl p-6 md:p-8 text-center">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 ${
              success ? "bg-[#10b981]/10" : "bg-[#ef4444]/10"
            }`}
          >
            {success ? (
              <CheckCircle2 className="w-9 h-9 text-[#10b981]" />
            ) : (
              <XCircle className="w-9 h-9 text-[#ef4444]" />
            )}
          </div>

          <h1 className="font-['Poppins:Bold',sans-serif] text-[22px] md:text-[26px] text-[#3b3b3b] dark:text-white mb-2">
            {success ? "Payment successful" : "Payment not completed"}
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280] dark:text-white/70 mb-6 leading-relaxed">
            {success
              ? "Your card was charged and your booking is confirmed. A confirmation email is on its way."
              : failureMessage}
          </p>

          {oid && (
            <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c] mb-6">
              Reference:{" "}
              <span className="font-mono text-[#3b3b3b] dark:text-white/80">{oid}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {success ? (
              <Link
                to="/portal"
                className="bg-[#2F80ED] text-white px-6 py-3 rounded-xl hover:bg-[#1E5FBC] transition-all font-['Inter:Bold',sans-serif] text-[14px]"
              >
                View my bookings
              </Link>
            ) : (
              <Link
                to="/booking/step3"
                className="bg-[#2F80ED] text-white px-6 py-3 rounded-xl hover:bg-[#1E5FBC] transition-all font-['Inter:Bold',sans-serif] text-[14px]"
              >
                Try payment again
              </Link>
            )}
            <Link
              to="/listing"
              className="border border-[#eaeaea] dark:border-white/[0.12] text-[#3b3b3b] dark:text-white px-6 py-3 rounded-xl hover:border-[#2F80ED]/40 transition-all font-['Inter:Bold',sans-serif] text-[14px]"
            >
              Browse hotels
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PaymentResultPage;
