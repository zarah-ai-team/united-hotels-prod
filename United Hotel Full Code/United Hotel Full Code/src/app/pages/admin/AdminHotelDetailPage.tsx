import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Star, MapPin, Phone, Mail, BedDouble, DollarSign, Plus,
  Pencil, Save, XCircle, Sliders, ExternalLink, CalendarRange, Trash2, AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useRole } from '../../components/admin/RoleSwitcher';
import {
  adminService, vendorService, hotelService, roomService,
  type PublicHotel, type PublicHotelRoom,
} from '../../services/api';
import { pickHotelGallery, pickHotelImage } from '../../utils/hotelImages';

const fmtUsd = (n: number) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
const fmtDate = (d: string | null | undefined) => (d ? String(d).slice(0, 10) : '—');

const nightsBetween = (a?: string | null, b?: string | null) => {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 86400000)) : 0;
};

type RoomBookingRow = {
  id: number;
  user_name: string | null;
  user_email: string | null;
  room_name: string | null;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  hotel_id: number | null;
};

type HotelEdit = {
  name: string;
  location: string;
  address: string;
  description: string;
  contact: string;
  email: string;
  totalRooms: string;
  starRating: string;
};

const toEditState = (h: PublicHotel | null): HotelEdit => ({
  name: h?.hotel_name || h?.name || '',
  location: h?.location_raw || h?.location || '',
  address: h?.address || '',
  description: h?.hotel_description || h?.description || '',
  contact: String((h as any)?.contact_phone ?? (h as any)?.contactPhone ?? (h as any)?.contact ?? ''),
  email: h?.email || '',
  totalRooms: String(h?.totalRooms ?? h?.total_rooms ?? ''),
  starRating: String(h?.starRating ?? h?.star_rating ?? h?.rating ?? ''),
});

export function AdminHotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useRole();
  const isAdmin = role === 'admin';
  const isVendor = role === 'vendor';

  const [hotel, setHotel] = useState<PublicHotel | null>(null);
  const [rooms, setRooms] = useState<PublicHotelRoom[]>([]);
  const [bookings, setBookings] = useState<RoomBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Hotel edit
  const [hotelEdit, setHotelEdit] = useState<HotelEdit>(toEditState(null));
  const [savingHotel, setSavingHotel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingHotel, setDeletingHotel] = useState(false);

  // Add-room
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '', category: 'standard', maxGuests: '2',
    basePrice: '', minPrice: '', maxPrice: '', totalRooms: '5',
  });
  const [savingRoom, setSavingRoom] = useState(false);

  // Inline price editor
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [priceDraft, setPriceDraft] = useState({ base: '', min: '', max: '' });
  const [savingPriceId, setSavingPriceId] = useState<number | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const found = await hotelService.getById(id);
        if (!active) return;
        if (!found) {
          setError('Hotel not found');
          return;
        }
        setHotel(found);
        setHotelEdit(toEditState(found));
        setRooms(Array.isArray(found.rooms) ? found.rooms : []);

        try {
          const bk = await vendorService.getBookings();
          if (!active) return;
          const matching = (bk.bookings as unknown as RoomBookingRow[])
            .filter((b) => Number(b.hotel_id) === Number(id))
            .slice(0, 25);
          setBookings(matching);
        } catch {
          if (active) setBookings([]);
        }
      } catch (e: any) {
        if (active) setError(e?.data?.error || e?.message || 'Failed to load hotel');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, refreshKey]);

  const hotelName = hotel?.hotel_name || hotel?.name || 'Hotel';
  const heroImages = useMemo(
    () => pickHotelGallery((hotel || { id: undefined, name: hotelName }) as any, 4),
    [hotel, hotelName],
  );
  const heroImage = pickHotelImage((hotel || { id: undefined, name: hotelName }) as any);

  const totalInventory = useMemo(() => {
    let total = 0; let avail = 0;
    rooms.forEach((r) => {
      total += Number((r as any).total_rooms ?? 0);
      avail += Number((r as any).available_rooms ?? (r as any).total_rooms ?? 0);
    });
    return { total, avail };
  }, [rooms]);

  // ─── Hotel save / delete ───────────────────────────────────────────────
  const saveHotel = async () => {
    if (!hotel?.id) return;
    setSavingHotel(true);
    setFlash(null);
    try {
      await hotelService.update(String(hotel.id), {
        name: hotelEdit.name.trim(),
        location: hotelEdit.location.trim(),
        address: hotelEdit.address.trim(),
        description: hotelEdit.description.trim(),
        contact: hotelEdit.contact.trim(),
        contact_phone: hotelEdit.contact.trim(),
        email: hotelEdit.email.trim(),
        totalRooms: hotelEdit.totalRooms ? Number(hotelEdit.totalRooms) : undefined,
        total_rooms: hotelEdit.totalRooms ? Number(hotelEdit.totalRooms) : undefined,
        starRating: hotelEdit.starRating ? Number(hotelEdit.starRating) : undefined,
        star_rating: hotelEdit.starRating ? Number(hotelEdit.starRating) : undefined,
      });
      setFlash({ kind: 'ok', text: 'Hotel saved.' });
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to save hotel' });
    } finally {
      setSavingHotel(false);
    }
  };

  const deleteHotel = async () => {
    if (!hotel?.id) return;
    setDeletingHotel(true);
    try {
      await hotelService.delete(String(hotel.id));
      navigate('/admin/hotels', { replace: true });
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to delete hotel' });
      setDeletingHotel(false);
    }
  };

  // ─── Rooms: add / edit / delete ────────────────────────────────────────
  const handleAddRoom = async () => {
    if (!hotel?.id) return;
    const basePrice = Number(roomForm.basePrice);
    const minPrice = roomForm.minPrice ? Number(roomForm.minPrice) : undefined;
    const maxPrice = roomForm.maxPrice ? Number(roomForm.maxPrice) : undefined;
    if (!roomForm.name.trim() || !Number.isFinite(basePrice) || basePrice <= 0) {
      setFlash({ kind: 'err', text: 'Room name and base price are required.' });
      return;
    }
    setSavingRoom(true);
    setFlash(null);
    try {
      await vendorService.addRoom({
        hotelId: Number(hotel.id),
        name: roomForm.name.trim(),
        category: roomForm.category,
        maxGuests: Number(roomForm.maxGuests) || 2,
        basePrice, minPrice, maxPrice,
        totalRooms: Number(roomForm.totalRooms) || 1,
      });
      setFlash({ kind: 'ok', text: `Room "${roomForm.name}" added.` });
      setRoomForm({ name: '', category: 'standard', maxGuests: '2', basePrice: '', minPrice: '', maxPrice: '', totalRooms: '5' });
      setShowAddRoom(false);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to add room' });
    } finally {
      setSavingRoom(false);
    }
  };

  const startEdit = (room: PublicHotelRoom) => {
    if (room.id == null) return;
    setEditingRoomId(Number(room.id));
    setPriceDraft({
      base: String(Number(room.price_per_night ?? room.base_price ?? 0) || ''),
      min: room.min_price != null ? String(room.min_price) : '',
      max: room.max_price != null ? String(room.max_price) : '',
    });
    setFlash(null);
  };

  const savePrice = async (roomId: number) => {
    const base = Number(priceDraft.base);
    const min = priceDraft.min === '' ? undefined : Number(priceDraft.min);
    const max = priceDraft.max === '' ? undefined : Number(priceDraft.max);

    if (isVendor) {
      if (!Number.isFinite(min as number) || !Number.isFinite(max as number)) {
        setFlash({ kind: 'err', text: 'Both min and max prices are required.' });
        return;
      }
      if ((max as number) < (min as number)) {
        setFlash({ kind: 'err', text: 'Max must be ≥ min.' });
        return;
      }
    } else if (!Number.isFinite(base) || base <= 0) {
      setFlash({ kind: 'err', text: 'Base price must be > 0.' });
      return;
    }

    setSavingPriceId(roomId);
    try {
      if (isVendor) {
        await vendorService.setRoomPriceBand(roomId, min as number, max as number);
      } else {
        await adminService.updateRoomPrice(roomId, {
          basePrice: base,
          ...(min !== undefined ? { minPrice: min } : {}),
          ...(max !== undefined ? { maxPrice: max } : {}),
        });
      }
      setFlash({ kind: 'ok', text: 'Price updated.' });
      setEditingRoomId(null);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to save price' });
    } finally {
      setSavingPriceId(null);
    }
  };

  const deleteRoom = async (roomId: number) => {
    if (!confirm('Delete this room? This cannot be undone.')) return;
    setDeletingRoomId(roomId);
    try {
      await roomService.delete(String(roomId));
      setFlash({ kind: 'ok', text: 'Room deleted.' });
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to delete room' });
    } finally {
      setDeletingRoomId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Hotel" breadcrumb="Admin / Hotels / …">
        <p className="text-sm text-[#8c8c8c]">Loading hotel…</p>
      </AdminLayout>
    );
  }

  if (error || !hotel) {
    return (
      <AdminLayout title="Hotel" breadcrumb="Admin / Hotels">
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error || 'Hotel not found'}
        </div>
        <Link to="/admin/hotels" className="inline-flex items-center gap-1 mt-4 text-[#2F80ED] hover:text-[#1E5FBC] text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to hotels
        </Link>
      </AdminLayout>
    );
  }

  const starRating = Number(hotel.starRating ?? hotel.star_rating ?? hotel.rating ?? 0);

  return (
    <AdminLayout title={hotelName} breadcrumb={`Admin / Hotels / ${hotelName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/admin/hotels" className="inline-flex items-center gap-1 text-sm text-[#2F80ED] hover:text-[#1E5FBC]">
            <ArrowLeft className="w-4 h-4" /> Back to hotels
          </Link>
          <a
            href={`/hotel/${hotel.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#3b3b3b]"
          >
            View public page <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {flash && (
          <div className={`rounded-lg px-4 py-3 text-sm ${flash.kind === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {flash.text}
          </div>
        )}

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden bg-white border border-[#eaeaea]">
          <div className="grid grid-cols-2 gap-1.5 h-[300px]">
            <img src={heroImage} alt={hotelName} className="row-span-2 w-full h-full object-cover" />
            {heroImages.slice(1, 4).map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-full object-cover" />
            ))}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < starRating ? 'fill-[#FFA500] text-[#FFA500]' : 'fill-[#eaeaea] text-[#eaeaea]'}`} />
              ))}
              <span className="text-xs text-[#8c8c8c] ml-1">{Number(hotel.reviewCount || 0)} reviews</span>
            </div>
            <h1 className="text-2xl font-bold text-[#3b3b3b]">{hotelName}</h1>
            <p className="flex items-center gap-1.5 text-sm text-[#6b7280] mt-1">
              <MapPin className="w-4 h-4" /> {hotelEdit.address || hotelEdit.location}
            </p>
          </div>
        </div>

        {/* Inventory summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label="Room categories" value={String(rooms.length)} icon={BedDouble} />
          <Stat label="Total inventory" value={totalInventory.total > 0 ? String(totalInventory.total) : (hotelEdit.totalRooms || '—')} icon={BedDouble} />
          <Stat label="Currently available" value={String(totalInventory.avail || 0)} icon={BedDouble} accent="#22C55E" />
          <Stat label="Recent bookings" value={String(bookings.length)} icon={CalendarRange} accent="#3B82F6" />
        </div>

        {/* Hotel edit (admin only) */}
        {isAdmin && (
          <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#3b3b3b] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#2F80ED]" /> Hotel details
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 text-sm font-semibold px-3 py-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete hotel
                </button>
                <button
                  onClick={saveHotel}
                  disabled={savingHotel}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-sm font-semibold px-3 py-1.5 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {savingHotel ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Field label="Hotel name">
                <input
                  value={hotelEdit.name}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, name: e.target.value })}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
              <Field label="Location">
                <input
                  value={hotelEdit.location}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, location: e.target.value })}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
              <Field label="Address" className="md:col-span-2">
                <input
                  value={hotelEdit.address}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, address: e.target.value })}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <textarea
                  value={hotelEdit.description}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
              <Field label="Contact phone">
                <input
                  value={hotelEdit.contact}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, contact: e.target.value })}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={hotelEdit.email}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, email: e.target.value })}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
              <Field label="Total rooms">
                <input
                  type="number"
                  value={hotelEdit.totalRooms}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, totalRooms: e.target.value })}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
              <Field label="Star rating (1–5)">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={hotelEdit.starRating}
                  onChange={(e) => setHotelEdit({ ...hotelEdit, starRating: e.target.value })}
                  className="w-full rounded-md border border-[#eaeaea] px-3 py-2"
                />
              </Field>
            </div>

            {/* Read-only contact summary */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#6b7280]">
              {hotelEdit.contact && <span className="inline-flex items-center gap-2"><Phone className="w-4 h-4" /> {hotelEdit.contact}</span>}
              {hotelEdit.email && <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4" /> {hotelEdit.email}</span>}
            </div>
          </section>
        )}

        {/* Rooms */}
        <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#3b3b3b] flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-[#2F80ED]" /> Room inventory ({rooms.length})
            </h2>
            <button
              onClick={() => setShowAddRoom((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-sm font-semibold px-3 py-1.5"
            >
              <Plus className="w-4 h-4" /> {showAddRoom ? 'Cancel' : 'Add Room'}
            </button>
          </div>

          {showAddRoom && (
            <div className="rounded-lg border border-[#eaeaea] p-4 mb-4 bg-[#fafafa] grid grid-cols-1 md:grid-cols-7 gap-3 text-sm">
              <input
                placeholder="Room name"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                className="md:col-span-2 rounded-md border border-[#eaeaea] px-3 py-2 bg-white"
              />
              <select
                value={roomForm.category}
                onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                className="rounded-md border border-[#eaeaea] px-3 py-2 bg-white"
              >
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="superior">Superior</option>
                <option value="deluxe">Deluxe</option>
                <option value="executive">Executive</option>
                <option value="suite">Suite</option>
              </select>
              <input type="number" placeholder="Max guests" value={roomForm.maxGuests}
                onChange={(e) => setRoomForm({ ...roomForm, maxGuests: e.target.value })}
                className="rounded-md border border-[#eaeaea] px-3 py-2 bg-white" />
              <input type="number" placeholder="Total rooms" value={roomForm.totalRooms}
                onChange={(e) => setRoomForm({ ...roomForm, totalRooms: e.target.value })}
                className="rounded-md border border-[#eaeaea] px-3 py-2 bg-white" />
              <input type="number" placeholder="Base $" value={roomForm.basePrice}
                onChange={(e) => setRoomForm({ ...roomForm, basePrice: e.target.value })}
                className="rounded-md border border-[#eaeaea] px-3 py-2 bg-white" />
              <button onClick={handleAddRoom} disabled={savingRoom}
                className="rounded-md bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-semibold py-2 disabled:opacity-60">
                {savingRoom ? 'Adding…' : 'Save'}
              </button>
              <input type="number" placeholder="Min $ (optional)" value={roomForm.minPrice}
                onChange={(e) => setRoomForm({ ...roomForm, minPrice: e.target.value })}
                className="md:col-span-2 rounded-md border border-[#eaeaea] px-3 py-2 bg-white" />
              <input type="number" placeholder="Max $ (optional)" value={roomForm.maxPrice}
                onChange={(e) => setRoomForm({ ...roomForm, maxPrice: e.target.value })}
                className="md:col-span-2 rounded-md border border-[#eaeaea] px-3 py-2 bg-white" />
            </div>
          )}

          {rooms.length === 0 ? (
            <p className="text-sm text-[#8c8c8c]">No rooms configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#fafafa] text-[#8c8c8c]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Room</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Occupancy</th>
                    <th className="px-4 py-3 text-right font-medium">Inventory</th>
                    <th className="px-4 py-3 text-right font-medium">Base</th>
                    <th className="px-4 py-3 text-right font-medium">Min</th>
                    <th className="px-4 py-3 text-right font-medium">Max</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeaea]">
                  {rooms.map((r, i) => {
                    const roomId = r.id != null ? Number(r.id) : null;
                    const isEditing = roomId != null && editingRoomId === roomId;
                    const isSaving = roomId != null && savingPriceId === roomId;
                    const isDeleting = roomId != null && deletingRoomId === roomId;
                    const total = Number((r as any).total_rooms ?? 0);
                    const avail = Number((r as any).available_rooms ?? total);
                    return (
                      <tr key={r.id ?? i}>
                        <td className="px-4 py-3 text-[#3b3b3b] font-medium">{r.room_name || `Room ${i + 1}`}</td>
                        <td className="px-4 py-3 text-[#6b7280] capitalize">{r.room_category || 'standard'}</td>
                        <td className="px-4 py-3 text-[#6b7280] capitalize">{r.occupancy_type || '—'}</td>
                        <td className="px-4 py-3 text-right text-[#3b3b3b]">
                          {total > 0 ? <>{avail}<span className="text-[#8c8c8c]"> / {total}</span></> : '—'}
                        </td>
                        {isEditing && !isVendor ? (
                          <td className="px-4 py-3 text-right">
                            <input type="number" value={priceDraft.base}
                              onChange={(e) => setPriceDraft({ ...priceDraft, base: e.target.value })}
                              className="w-20 rounded-md border border-[#eaeaea] px-2 py-1 text-right" />
                          </td>
                        ) : (
                          <td className="px-4 py-3 text-right text-[#2F80ED] font-semibold">
                            {fmtUsd(Number(r.price_per_night ?? r.base_price ?? 0))}
                          </td>
                        )}
                        {isEditing ? (
                          <>
                            <td className="px-4 py-3 text-right">
                              <input type="number" value={priceDraft.min}
                                onChange={(e) => setPriceDraft({ ...priceDraft, min: e.target.value })}
                                className="w-20 rounded-md border border-[#eaeaea] px-2 py-1 text-right" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input type="number" value={priceDraft.max}
                                onChange={(e) => setPriceDraft({ ...priceDraft, max: e.target.value })}
                                className="w-20 rounded-md border border-[#eaeaea] px-2 py-1 text-right" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button onClick={() => setEditingRoomId(null)}
                                  className="inline-flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#3b3b3b]">
                                  <XCircle className="w-3.5 h-3.5" /> Cancel
                                </button>
                                <button onClick={() => roomId != null && savePrice(roomId)} disabled={isSaving}
                                  className="inline-flex items-center gap-1 rounded-md bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-xs font-semibold px-2 py-1 disabled:opacity-60">
                                  <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-right text-[#3b3b3b]">{r.min_price != null ? fmtUsd(Number(r.min_price)) : '—'}</td>
                            <td className="px-4 py-3 text-right text-[#3b3b3b]">{r.max_price != null ? fmtUsd(Number(r.max_price)) : '—'}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-3">
                                <button
                                  onClick={() => startEdit(r)}
                                  disabled={roomId == null}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F80ED] hover:text-[#1E5FBC] disabled:opacity-50"
                                >
                                  {isVendor ? <Sliders className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                                  {isVendor ? 'Set band' : 'Adjust'}
                                </button>
                                {isAdmin && roomId != null && (
                                  <button
                                    onClick={() => deleteRoom(roomId)}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3" /> {isDeleting ? '…' : 'Delete'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bookings */}
        <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#3b3b3b] flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-[#2F80ED]" /> Recent bookings
            </h2>
            <span className="text-xs text-[#8c8c8c]">{bookings.length} shown</span>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-[#8c8c8c]">No bookings for this hotel yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#fafafa] text-[#8c8c8c]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Guest</th>
                    <th className="px-4 py-3 text-left font-medium">Room</th>
                    <th className="px-4 py-3 text-left font-medium">Check-in</th>
                    <th className="px-4 py-3 text-left font-medium">Nights</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeaea]">
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 font-mono text-xs text-[#2F80ED]">BK-{b.id}</td>
                      <td className="px-4 py-3 text-[#3b3b3b]">
                        <div className="font-medium">{b.user_name || 'Guest'}</div>
                        <div className="text-xs text-[#8c8c8c]">{b.user_email || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{b.room_name || '—'}</td>
                      <td className="px-4 py-3">{fmtDate(b.check_in_date)}</td>
                      <td className="px-4 py-3">{nightsBetween(b.check_in_date, b.check_out_date)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmtUsd(Number(b.total_price))}</td>
                      <td className="px-4 py-3 text-xs capitalize">{b.status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deletingHotel && setConfirmDelete(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#3b3b3b]">Delete this hotel?</h3>
                <p className="text-sm text-[#6b7280] mt-1">
                  This will permanently remove <strong>{hotelName}</strong> and all its rooms. Existing bookings will lose their hotel reference.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deletingHotel}
                className="rounded-lg border border-[#eaeaea] bg-white text-[#3b3b3b] hover:bg-[#fafafa] text-sm font-semibold px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={deleteHotel}
                disabled={deletingHotel}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" /> {deletingHotel ? 'Deleting…' : 'Delete hotel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({
  label, children, className,
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ''}`}>
      <span className="block text-[11px] uppercase tracking-wider text-[#8c8c8c] mb-1">{label}</span>
      {children}
    </label>
  );
}

function Stat({
  label, value, icon: Icon, accent = '#2F80ED',
}: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#eaeaea] p-4 flex items-center gap-3">
      <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1a` }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-[#8c8c8c]">{label}</p>
        <p className="text-lg font-bold text-[#3b3b3b] truncate">{value}</p>
      </div>
    </div>
  );
}
