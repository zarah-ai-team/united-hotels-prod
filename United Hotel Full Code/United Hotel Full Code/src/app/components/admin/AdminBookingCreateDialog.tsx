import { useEffect, useMemo, useState } from "react";
import { X, Loader2, CalendarRange, BedDouble, User as UserIcon, Mail, Phone, MessageSquare, CreditCard, Building2 } from "lucide-react";
import { toast } from "sonner";
import { bookingService, hotelService, type PublicHotel } from "../../services/api";

// Admin-side "create booking" dialog. POSTs through the same
// /api/bookings/bookroom endpoint guests use, so all the column
// auto-migration, payment-row insert, and confirmation-email side
// effects come along for free. Refreshes the parent list via the
// onCreated callback when the booking lands.

interface AdminBookingCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface RoomOption {
  id: number;
  name: string;
  category?: string | null;
  price: number;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const isoPlusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const nightsBetween = (a: string, b: string) => {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 86400000)) : 0;
};

export function AdminBookingCreateDialog({ open, onClose, onCreated }: AdminBookingCreateDialogProps) {
  const [hotels, setHotels] = useState<PublicHotel[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelId, setHotelId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(isoPlusDays(2));
  const [bookedRooms, setBookedRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [paymentMode, setPaymentMode] = useState<"card" | "hotel">("hotel");
  const [submitting, setSubmitting] = useState(false);

  // Load hotels once when the dialog first opens. The list is small (< 100
  // hotels) so we keep the full payload in memory for the room dropdown.
  useEffect(() => {
    if (!open || hotels.length > 0) return;
    let cancelled = false;
    setHotelsLoading(true);
    hotelService
      .getPublicHotels({ limit: 200, includeRecommendedPrices: false })
      .then((res) => {
        if (cancelled) return;
        setHotels(res.hotels || []);
      })
      .catch((e: any) => {
        if (cancelled) return;
        toast.error("Could not load hotels", { description: e?.message || "Try again" });
      })
      .finally(() => { if (!cancelled) setHotelsLoading(false); });
    return () => { cancelled = true; };
  }, [open, hotels.length]);

  const selectedHotel = useMemo(
    () => hotels.find((h) => String(h.id) === hotelId) || null,
    [hotels, hotelId],
  );

  const roomOptions = useMemo<RoomOption[]>(() => {
    if (!selectedHotel || !Array.isArray(selectedHotel.rooms)) return [];
    return selectedHotel.rooms
      .filter((r: any) => r && (r.id != null))
      .map((r: any) => ({
        id: Number(r.id),
        name: r.room_name || r.room_number || r.category || `Room ${r.id}`,
        category: r.room_category || r.category || null,
        price: Number(r.price_per_night ?? r.base_price ?? 0),
      }));
  }, [selectedHotel]);

  // Reset room selection when hotel changes.
  useEffect(() => {
    if (roomOptions.length > 0) {
      setRoomId(String(roomOptions[0].id));
    } else {
      setRoomId("");
    }
  }, [roomOptions]);

  const selectedRoom = useMemo(
    () => roomOptions.find((r) => String(r.id) === roomId) || null,
    [roomOptions, roomId],
  );

  const nights = nightsBetween(fromDate, toDate);
  const totalAmount = (selectedRoom?.price || 0) * Math.max(1, nights) * Math.max(1, bookedRooms);

  const reset = () => {
    setHotelId("");
    setRoomId("");
    setFromDate(todayIso());
    setToDate(isoPlusDays(2));
    setBookedRooms(1);
    setGuests(2);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSpecialRequest("");
    setPaymentMode("hotel");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !selectedRoom) {
      toast.error("Pick a hotel and room first");
      return;
    }
    if (!email || !phone) {
      toast.error("Guest email and phone are required");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (totalAmount <= 0) {
      toast.error("This room has no price set — pick another room");
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.bookRoom({
        room: {
          id: selectedRoom.id,
          name: selectedRoom.name,
          hotelid: Number(selectedHotel.id),
        },
        fromdate: fromDate,
        todate: toDate,
        totalamount: totalAmount,
        totaldays: nights,
        bookedRooms,
        paymentMode,
        email,
        phoneNumber: phone,
        specialRequest,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestName: [firstName, lastName].filter(Boolean).join(" "),
        guests,
        currency: "USD",
      });
      toast.success("Booking created", { description: `${selectedHotel.name} — ${nights} night${nights > 1 ? "s" : ""}` });
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      const message = err?.data?.error || err?.message || "Booking failed";
      toast.error("Could not create booking", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1f2937] shadow-2xl ring-1 ring-black/10 dark:ring-white/10 animate-in zoom-in-95 duration-200">
        <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[#eef2f8] dark:border-white/10 bg-white/95 dark:bg-[#1f2937]/95 backdrop-blur">
          <div>
            <h2 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#1f2937] dark:text-white">
              New booking
            </h2>
            <p className="text-[12px] text-[#6b7280] dark:text-white/55 mt-0.5">
              Manually create a booking for a guest. Triggers the same confirmation email + payment row as the public flow.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md text-[#6b7280] hover:text-[#1f2937] dark:text-white/65 dark:hover:text-white hover:bg-[#f1f5f9] dark:hover:bg-white/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Hotel + room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Hotel" icon={<Building2 className="w-3.5 h-3.5" />}>
              <select
                required
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
                className={inputCls}
                disabled={hotelsLoading}
              >
                <option value="">{hotelsLoading ? "Loading hotels…" : "Select a hotel"}</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name || h.hotel_name || `Hotel ${h.id}`}{h.location ? ` — ${h.location}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Room" icon={<BedDouble className="w-3.5 h-3.5" />}>
              <select
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className={inputCls}
                disabled={!selectedHotel || roomOptions.length === 0}
              >
                {roomOptions.length === 0 ? (
                  <option value="">{selectedHotel ? "No rooms available" : "Pick a hotel first"}</option>
                ) : (
                  roomOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}{r.category ? ` (${r.category})` : ""}{r.price ? ` — $${r.price}/night` : ""}
                    </option>
                  ))
                )}
              </select>
            </Field>
          </div>

          {/* Dates + counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Check-in" icon={<CalendarRange className="w-3.5 h-3.5" />}>
              <input
                type="date"
                required
                value={fromDate}
                min={todayIso()}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Check-out" icon={<CalendarRange className="w-3.5 h-3.5" />}>
              <input
                type="date"
                required
                value={toDate}
                min={fromDate || todayIso()}
                onChange={(e) => setToDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Rooms">
              <input
                type="number"
                min={1}
                value={bookedRooms}
                onChange={(e) => setBookedRooms(Math.max(1, Number(e.target.value) || 1))}
                className={inputCls}
              />
            </Field>
            <Field label="Guests">
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Guest contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="First name" icon={<UserIcon className="w-3.5 h-3.5" />}>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputCls}
                placeholder="Sachin"
              />
            </Field>
            <Field label="Last name">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputCls}
                placeholder="Verma"
              />
            </Field>
            <Field label="Email" icon={<Mail className="w-3.5 h-3.5" />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="guest@example.com"
              />
            </Field>
            <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
                placeholder="+1 555 0000"
              />
            </Field>
          </div>

          {/* Payment + special request */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <Field label="Special request" icon={<MessageSquare className="w-3.5 h-3.5" />}>
              <input
                type="text"
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className={inputCls}
                placeholder="Late check-in, high floor, etc."
              />
            </Field>
            <Field label="Payment" icon={<CreditCard className="w-3.5 h-3.5" />}>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as "card" | "hotel")}
                className={inputCls}
              >
                <option value="hotel">Pay at hotel</option>
                <option value="card">Card</option>
              </select>
            </Field>
          </div>

          {/* Total summary */}
          <div className="rounded-xl bg-[#f8fafe] dark:bg-white/[0.04] border border-[#e6ecf6] dark:border-white/10 p-3 flex items-center justify-between">
            <div className="text-[12px] text-[#6b7280] dark:text-white/60">
              {selectedRoom ? (
                <>
                  ${selectedRoom.price.toFixed(2)} × {Math.max(1, nights)} night{nights !== 1 ? "s" : ""} × {bookedRooms} room{bookedRooms !== 1 ? "s" : ""}
                </>
              ) : (
                "Select a room to see pricing"
              )}
            </div>
            <div className="text-[18px] font-['Poppins:Bold',sans-serif] text-[#2F80ED] tabular-nums">
              ${totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eef2f8] dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-[13px] font-['Inter:Medium',sans-serif] text-[#6b7280] dark:text-white/70 hover:bg-[#f1f5f9] dark:hover:bg-white/[0.05] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || totalAmount <= 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-[13px] font-['Inter:SemiBold',sans-serif] shadow-[0_8px_18px_-8px_rgba(47,128,237,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating…" : "Create booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-[#e6ecf6] dark:border-white/10 bg-white dark:bg-white/[0.04] text-[13px] text-[#1f2937] dark:text-white placeholder-[#9ca3af] dark:placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] disabled:opacity-60 disabled:cursor-not-allowed";

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[10.5px] font-['Inter:SemiBold',sans-serif] uppercase tracking-[0.08em] text-[#6b7280] dark:text-white/55 mb-1">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

export default AdminBookingCreateDialog;
