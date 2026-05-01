import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Star, MapPin, BedDouble, DollarSign, Search, Tag, ExternalLink, Pencil, Save, XCircle, Sliders, ChevronRight } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AddHotelWizard } from '../../components/admin/AddHotelWizard';
import { adminService, hotelService, vendorService, type PublicHotel, type PublicHotelRoom } from '../../services/api';
import { pickHotelImage } from '../../utils/hotelImages';
import { useRole } from '../../components/admin/RoleSwitcher';

const fmtUsd = (n: number) => `$${Math.round(Number(n) || 0).toLocaleString()}`;

interface HotelRow {
  id: number;
  name: string;
  location: string;
  district?: string | null;
  starRating: number;
  reviewCount: number;
  totalRooms?: number | null;
  vendorId?: number | null;
  rooms: PublicHotelRoom[];
  minPrice: number;
  maxPrice: number;
  image: string;
}

const mapHotel = (h: PublicHotel): HotelRow => {
  const rooms = Array.isArray(h.rooms) ? h.rooms : [];
  const prices = rooms
    .map((r) => Number(r.price_per_night ?? r.base_price ?? 0))
    .filter((p) => Number.isFinite(p) && p > 0);

  return {
    id: Number(h.id),
    name: h.hotel_name || h.name || 'Hotel',
    location: h.location_raw || h.location || 'Turkey',
    district: h.district ?? null,
    starRating: Number(h.starRating ?? h.star_rating ?? h.rating ?? 0),
    reviewCount: Number(h.reviewCount ?? 0),
    totalRooms: h.totalRooms ?? h.total_rooms ?? null,
    vendorId: (h as any).vendor_id ?? null,
    rooms,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    // Backend serves the cover URL on `image_url` (mapHotelRecord +
    // attachImageKitUrls). Pass it through so pickHotelImage finds it
    // instead of falling back to the empty string.
    image: pickHotelImage(h as any),
  };
};

export function AdminHotelsPage() {
  const navigate = useNavigate();
  const role = useRole();
  const isVendor = role === 'vendor';
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '', category: 'standard', maxGuests: '2',
    basePrice: '', minPrice: '', maxPrice: '',
  });
  const [savingRoom, setSavingRoom] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Vendors load their own hotels (with rooms inline) via vendor endpoints.
  // Admins see every hotel via the public list.
  useEffect(() => {
    let active = true;
    setLoading(true);

    const load = async () => {
      try {
        if (isVendor) {
          const vendorHotels = await vendorService.getMyHotels();
          const rooms = await vendorService.getMyRooms();
          const byHotel = new Map<number, PublicHotelRoom[]>();
          for (const r of rooms.rooms) {
            const hid = Number(r.hotel_id);
            if (!byHotel.has(hid)) byHotel.set(hid, []);
            byHotel.get(hid)!.push(r);
          }
          const mapped: HotelRow[] = vendorHotels.hotels.map((h) => mapHotel({
            id: h.id,
            hotel_name: h.name,
            name: h.name,
            location_raw: h.location,
            location: h.location,
            address: h.address || null,
            // The vendor endpoint returns the cover URL on `image`; pass it
            // through both names so pickHotelImage finds it (it reads
            // image_url / imageUrl / cover_image / images[]).
            image: h.image || null,
            image_url: h.image || null,
            totalRooms: h.totalRooms ?? null,
            rooms: byHotel.get(h.id) || [],
            recommendedPrices: [],
          } as any));
          if (!active) return;
          setHotels(mapped);
          if (mapped.length > 0) setActiveId((prev) => prev ?? mapped[0].id);
          return;
        }

        const res = await hotelService.getPublicHotels({ limit: 200, offset: 0, includeRecommendedPrices: false });
        if (!active) return;
        const mapped = res.hotels.map(mapHotel);
        setHotels(mapped);
        if (mapped.length > 0) setActiveId((prev) => prev ?? mapped[0].id);
      } catch (e: any) {
        if (active) setError(e?.data?.error || e?.message || 'Failed to load hotels');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVendor, refreshKey]);

  const handleAddRoom = async () => {
    if (activeId == null) return;
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
        hotelId: activeId,
        name: roomForm.name.trim(),
        category: roomForm.category,
        maxGuests: Number(roomForm.maxGuests) || 2,
        basePrice,
        minPrice,
        maxPrice,
      });
      setFlash({ kind: 'ok', text: `Room "${roomForm.name}" added.` });
      setRoomForm({ name: '', category: 'standard', maxGuests: '2', basePrice: '', minPrice: '', maxPrice: '' });
      setShowAddRoom(false);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to add room' });
    } finally {
      setSavingRoom(false);
    }
  };

  // Inline price editor — admin tweaks base + bands; vendor only the bands.
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [priceDraft, setPriceDraft] = useState<{ base: string; min: string; max: string }>({ base: '', min: '', max: '' });
  const [savingPriceId, setSavingPriceId] = useState<number | null>(null);

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

  const cancelEdit = () => {
    setEditingRoomId(null);
  };

  const savePrice = async (roomId: number) => {
    const base = Number(priceDraft.base);
    const min = priceDraft.min === '' ? undefined : Number(priceDraft.min);
    const max = priceDraft.max === '' ? undefined : Number(priceDraft.max);

    if (isVendor) {
      // Vendor: bands only.
      if (!Number.isFinite(min as number) || !Number.isFinite(max as number)) {
        setFlash({ kind: 'err', text: 'Both min and max prices are required.' });
        return;
      }
      if ((max as number) < (min as number)) {
        setFlash({ kind: 'err', text: 'Max must be ≥ min.' });
        return;
      }
    } else {
      // Admin: base required, bands optional.
      if (!Number.isFinite(base) || base <= 0) {
        setFlash({ kind: 'err', text: 'Base price must be > 0.' });
        return;
      }
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hotels;
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (h.district || '').toLowerCase().includes(q),
    );
  }, [hotels, search]);

  const active = useMemo(() => hotels.find((h) => h.id === activeId) || null, [hotels, activeId]);

  return (
    <AdminLayout title="Hotels & Rooms" breadcrumb="Admin / Hotels">
      <div className="space-y-4">
        {/* Toolbar — single tidy row, smaller search/button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-[#6b7280] dark:text-white/55" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="text-[#1f2937] dark:text-white font-semibold">{hotels.length}</span> properties · room inventory
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
              <input
                placeholder="Search hotels…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-[#eaeaea] dark:border-white/10 bg-white dark:bg-[#11151a] dark:text-white dark:placeholder-white/40 pl-8 pr-3 py-1.5 text-[12.5px] w-56 focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/25 focus:border-[#1ABC9C] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            {!isVendor && (
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1ABC9C] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#16A085] transition-colors shadow-[0_4px_12px_-4px_rgba(26,188,156,0.55)]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Hotel
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12.5px] text-red-700">{error}</div>
        )}

        {loading ? (
          <p className="text-[12.5px] text-[#8c8c8c] dark:text-white/55">Loading hotels…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
            {/* Hotel list — single-column horizontal row layout with a 96x72
                thumbnail on the left and stats laid out in a column-based
                grid. Reads like an industry partner-portal property list
                (Booking, Cloudbeds, Hotelogix) instead of a Pinterest grid. */}
            <div className="bg-white dark:bg-[#11151a] rounded-xl border border-[#eaeaea] dark:border-white/8 overflow-hidden shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
              <div className="hidden md:grid grid-cols-[96px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_88px] gap-3 px-3 py-2 bg-[#fafafa] dark:bg-[#0d1014] border-b border-[#eaeaea] dark:border-white/8 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] dark:text-white/45" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div></div>
                <div>Property</div>
                <div>Rating</div>
                <div>Price band</div>
                <div>Inventory</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y divide-[#f1f1f1] dark:divide-white/5">
                {filtered.map((h) => {
                  const isActiveRow = activeId === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setActiveId(h.id)}
                      className={`group grid grid-cols-[96px_minmax(0,1fr)_72px] md:grid-cols-[96px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_88px] gap-3 px-3 py-2.5 transition-colors cursor-pointer ${
                        isActiveRow
                          ? 'bg-[#1ABC9C]/[0.06] hover:bg-[#1ABC9C]/[0.08]'
                          : 'hover:bg-[#fafafa] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-[72px] w-[96px] rounded-lg overflow-hidden bg-gradient-to-br from-[#1ABC9C]/15 to-[#2dd4bf]/10 dark:from-[#1ABC9C]/20 dark:to-[#2dd4bf]/15 shrink-0">
                        {h.image ? (
                          <img
                            src={h.image}
                            alt={h.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (img.dataset.fallback === '1') return;
                              img.dataset.fallback = '1';
                              img.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BedDouble className="w-5 h-5 text-[#1ABC9C] opacity-60" />
                          </div>
                        )}
                        {h.vendorId ? (
                          <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded-full bg-[#1ABC9C] text-white text-[9px] px-1 py-px shadow-sm">
                            <Tag className="w-2 h-2" /> {h.vendorId}
                          </span>
                        ) : null}
                      </div>

                      {/* Property name + location */}
                      <div className="min-w-0 flex flex-col justify-center">
                        <h3 className="text-[13.5px] font-semibold text-[#1f2937] dark:text-white truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {h.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11.5px] text-[#8c8c8c] dark:text-white/55 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{h.location}</span>
                        </div>
                      </div>

                      {/* Rating — desktop only */}
                      <div className="hidden md:flex items-center gap-1.5 text-[11.5px]">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < h.starRating
                                  ? 'fill-[#FFA500] text-[#FFA500]'
                                  : 'fill-[#eaeaea] text-[#eaeaea] dark:fill-white/10 dark:text-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        {h.reviewCount > 0 && (
                          <span className="text-[10.5px] text-[#9aa0a6] dark:text-white/45">({h.reviewCount})</span>
                        )}
                      </div>

                      {/* Price band — desktop only */}
                      <div className="hidden md:flex items-center text-[12px] font-semibold text-[#0f9b86] dark:text-[#2dd4bf]">
                        {h.minPrice > 0 ? `${fmtUsd(h.minPrice)}–${fmtUsd(h.maxPrice)}` : '—'}
                      </div>

                      {/* Inventory — desktop only */}
                      <div className="hidden md:flex items-center text-[11.5px] text-[#6b7280] dark:text-white/65">
                        <BedDouble className="w-3.5 h-3.5 mr-1 text-[#9aa0a6]" />
                        {h.rooms.length} {h.rooms.length === 1 ? 'type' : 'types'}
                        {h.totalRooms ? ` · ${h.totalRooms} rms` : ''}
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/hotels/${h.id}`); }}
                          className="inline-flex items-center gap-1 rounded-md bg-[#1ABC9C]/10 hover:bg-[#1ABC9C] hover:text-white text-[#0f9b86] dark:text-[#2dd4bf] dark:hover:text-white text-[11px] font-semibold px-2 py-1.5 transition-colors"
                        >
                          Open <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-[13px] text-[#9aa0a6]">No hotels match your search.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail panel */}
            <aside className="bg-white dark:bg-[#11151a] rounded-xl border border-[#eaeaea] dark:border-white/8 p-5 sticky top-4 self-start shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
              {!active ? (
                <p className="text-sm text-[#8c8c8c]">Select a hotel to inspect its rooms.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#3b3b3b]">{active.name}</h2>
                    <p className="text-xs text-[#8c8c8c] mt-1">{active.location}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#6b7280]">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#FFA500] text-[#FFA500]" /> {active.starRating} · {active.reviewCount} reviews
                      </span>
                      <span>{active.totalRooms ?? '—'} rooms</span>
                    </div>
                    <a
                      href={`/hotel/${active.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-[#1ABC9C] hover:text-[#16A085]"
                    >
                      View public page <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="border-t border-[#eaeaea] pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-[#3b3b3b] flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-[#1ABC9C]" /> Room categories
                      </h3>
                      <button
                        onClick={() => setShowAddRoom((v) => !v)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1ABC9C] hover:text-[#16A085]"
                      >
                        <Plus className="w-3.5 h-3.5" /> {showAddRoom ? 'Cancel' : 'Add room'}
                      </button>
                    </div>
                    {flash && (
                      <div className={`mb-3 rounded-md px-3 py-2 text-xs ${flash.kind === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {flash.text}
                      </div>
                    )}
                    {showAddRoom && (
                      <div className="rounded-lg border border-[#eaeaea] p-3 mb-3 space-y-2 text-sm">
                        <input
                          placeholder="Room name (e.g. Family Suite)"
                          value={roomForm.name}
                          onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                          className="w-full rounded-md border border-[#eaeaea] px-2 py-1.5 text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={roomForm.category}
                            onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                            className="rounded-md border border-[#eaeaea] px-2 py-1.5 bg-white"
                          >
                            <option value="economy">Economy</option>
                            <option value="standard">Standard</option>
                            <option value="superior">Superior</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="executive">Executive</option>
                            <option value="suite">Suite</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Max guests"
                            value={roomForm.maxGuests}
                            onChange={(e) => setRoomForm({ ...roomForm, maxGuests: e.target.value })}
                            className="rounded-md border border-[#eaeaea] px-2 py-1.5"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Base $"
                            value={roomForm.basePrice}
                            onChange={(e) => setRoomForm({ ...roomForm, basePrice: e.target.value })}
                            className="rounded-md border border-[#eaeaea] px-2 py-1.5"
                          />
                          <input
                            type="number"
                            placeholder="Min $"
                            value={roomForm.minPrice}
                            onChange={(e) => setRoomForm({ ...roomForm, minPrice: e.target.value })}
                            className="rounded-md border border-[#eaeaea] px-2 py-1.5"
                          />
                          <input
                            type="number"
                            placeholder="Max $"
                            value={roomForm.maxPrice}
                            onChange={(e) => setRoomForm({ ...roomForm, maxPrice: e.target.value })}
                            className="rounded-md border border-[#eaeaea] px-2 py-1.5"
                          />
                        </div>
                        <button
                          onClick={handleAddRoom}
                          disabled={savingRoom}
                          className="w-full rounded-md bg-[#1ABC9C] hover:bg-[#16A085] text-white text-sm font-semibold py-1.5 disabled:opacity-60"
                        >
                          {savingRoom ? 'Adding…' : 'Add Room'}
                        </button>
                      </div>
                    )}
                    {active.rooms.length === 0 ? (
                      <p className="text-xs text-[#8c8c8c]">No rooms configured.</p>
                    ) : (
                      <div className="space-y-2">
                        {active.rooms.map((r, i) => {
                          const roomId = r.id != null ? Number(r.id) : null;
                          const isEditing = roomId != null && editingRoomId === roomId;
                          const isSaving = roomId != null && savingPriceId === roomId;
                          return (
                            <div key={r.id ?? i} className="rounded-lg border border-[#eaeaea] p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-[#3b3b3b]">{r.room_name || `Room ${i + 1}`}</span>
                                <span className="text-[#1ABC9C] font-semibold">{fmtUsd(Number(r.price_per_night ?? r.base_price ?? 0))}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-[#8c8c8c] mt-1">
                                <span className="capitalize">{r.room_category || 'standard'}</span>
                                <span>
                                  {r.min_price != null ? fmtUsd(Number(r.min_price)) : '—'} ↔ {r.max_price != null ? fmtUsd(Number(r.max_price)) : '—'}
                                </span>
                              </div>

                              {!isEditing ? (
                                <button
                                  onClick={() => startEdit(r)}
                                  disabled={roomId == null}
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1ABC9C] hover:text-[#16A085] disabled:opacity-50"
                                >
                                  {isVendor ? <Sliders className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                                  {isVendor ? 'Set price band' : 'Adjust price'}
                                </button>
                              ) : (
                                <div className="mt-3 space-y-2 rounded-md bg-[#fafafa] border border-[#eaeaea] p-2">
                                  {!isVendor && (
                                    <label className="block">
                                      <span className="text-[11px] uppercase tracking-wider text-[#8c8c8c]">Base price</span>
                                      <input
                                        type="number"
                                        value={priceDraft.base}
                                        onChange={(e) => setPriceDraft({ ...priceDraft, base: e.target.value })}
                                        className="w-full rounded-md border border-[#eaeaea] px-2 py-1 mt-0.5"
                                      />
                                    </label>
                                  )}
                                  <div className="grid grid-cols-2 gap-2">
                                    <label className="block">
                                      <span className="text-[11px] uppercase tracking-wider text-[#8c8c8c]">Min</span>
                                      <input
                                        type="number"
                                        value={priceDraft.min}
                                        onChange={(e) => setPriceDraft({ ...priceDraft, min: e.target.value })}
                                        className="w-full rounded-md border border-[#eaeaea] px-2 py-1 mt-0.5"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-[11px] uppercase tracking-wider text-[#8c8c8c]">Max</span>
                                      <input
                                        type="number"
                                        value={priceDraft.max}
                                        onChange={(e) => setPriceDraft({ ...priceDraft, max: e.target.value })}
                                        className="w-full rounded-md border border-[#eaeaea] px-2 py-1 mt-0.5"
                                      />
                                    </label>
                                  </div>
                                  <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                      onClick={cancelEdit}
                                      className="inline-flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#3b3b3b]"
                                    >
                                      <XCircle className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                    <button
                                      onClick={() => roomId != null && savePrice(roomId)}
                                      disabled={isSaving}
                                      className="inline-flex items-center gap-1 rounded-md bg-[#1ABC9C] hover:bg-[#16A085] text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-60"
                                    >
                                      <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving…' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      <AddHotelWizard isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </AdminLayout>
  );
}
