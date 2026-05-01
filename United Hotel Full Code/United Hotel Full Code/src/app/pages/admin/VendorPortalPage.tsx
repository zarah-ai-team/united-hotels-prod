import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { vendorService, type VendorHotel, type VendorRoom } from '../../services/api';
import { Button } from '../../components/ui/Button';

export function VendorPortalPage() {
  const [hotels, setHotels] = useState<VendorHotel[]>([]);
  const [activeHotelId, setActiveHotelId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<VendorRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRoomId, setSavingRoomId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { min: string; max: string }>>({});
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    vendorService
      .getMyHotels()
      .then((res) => {
        if (!active) return;
        setHotels(res.hotels);
        if (res.hotels.length > 0) setActiveHotelId(res.hotels[0].id);
      })
      .catch((e: any) => {
        if (active) setError(e?.data?.error || e?.message || 'Failed to load hotels');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!activeHotelId) return;
    let active = true;
    vendorService
      .getMyRooms(activeHotelId)
      .then((res) => {
        if (!active) return;
        setRooms(res.rooms);
        const next: Record<number, { min: string; max: string }> = {};
        res.rooms.forEach((r) => {
          if (typeof r.id === 'number') {
            next[r.id] = {
              min: r.min_price != null ? String(r.min_price) : '',
              max: r.max_price != null ? String(r.max_price) : '',
            };
          }
        });
        setDrafts(next);
      })
      .catch((e: any) => {
        if (active) setError(e?.data?.error || e?.message || 'Failed to load rooms');
      });
    return () => { active = false; };
  }, [activeHotelId]);

  const activeHotel = useMemo(
    () => hotels.find((h) => h.id === activeHotelId) || null,
    [hotels, activeHotelId],
  );

  const saveBand = async (roomId: number) => {
    const draft = drafts[roomId];
    if (!draft) return;
    const min = Number(draft.min);
    const max = Number(draft.max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
      setFlash({ kind: 'err', text: 'Invalid price band: max must be ≥ min' });
      return;
    }
    setSavingRoomId(roomId);
    setFlash(null);
    try {
      const { room } = await vendorService.setRoomPriceBand(roomId, min, max);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...room } : r)));
      setFlash({ kind: 'ok', text: 'Price band saved.' });
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Save failed' });
    } finally {
      setSavingRoomId(null);
    }
  };

  return (
    <AdminLayout title="Vendor Pricing" breadcrumb="Admin / Vendor Pricing" adminOnly>
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {flash && (
          <div className={`rounded-lg px-4 py-3 text-sm ${
            flash.kind === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {flash.text}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#8c8c8c]">Loading your hotels…</p>
        ) : hotels.length === 0 ? (
          <div className="rounded-xl border border-[#eaeaea] bg-white p-8 text-center">
            <p className="text-[#3b3b3b] mb-1">No hotels assigned to you yet.</p>
            <p className="text-sm text-[#8c8c8c]">Ask an admin to assign a property to your vendor account.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {hotels.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setActiveHotelId(h.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeHotelId === h.id
                      ? 'bg-[#1abc9c] text-white'
                      : 'bg-[#eaeaea] text-[#3b3b3b] hover:bg-[#d4d4d4]'
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>

            {activeHotel && (
              <div className="rounded-xl border border-[#eaeaea] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#3b3b3b] mb-1">{activeHotel.name}</h2>
                <p className="text-sm text-[#8c8c8c] mb-6">{activeHotel.location}</p>

                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa] text-[#8c8c8c]">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Room</th>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-left font-medium">Base / night</th>
                      <th className="px-4 py-3 text-left font-medium">Min Price</th>
                      <th className="px-4 py-3 text-left font-medium">Max Price</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {rooms.map((room) => {
                      if (room.id == null) return null;
                      const id = room.id;
                      const draft = drafts[id] || { min: '', max: '' };
                      return (
                        <tr key={id}>
                          <td className="px-4 py-3 text-[#3b3b3b]">{room.room_name}</td>
                          <td className="px-4 py-3 text-[#8c8c8c] capitalize">{room.room_category || '—'}</td>
                          <td className="px-4 py-3 text-[#3b3b3b]">${Number(room.price_per_night || 0).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={draft.min}
                              onChange={(e) => setDrafts({ ...drafts, [id]: { ...draft, min: e.target.value } })}
                              className="w-24 rounded-md border border-[#eaeaea] px-2 py-1.5 text-sm"
                              min={0}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={draft.max}
                              onChange={(e) => setDrafts({ ...drafts, [id]: { ...draft, max: e.target.value } })}
                              className="w-24 rounded-md border border-[#eaeaea] px-2 py-1.5 text-sm"
                              min={0}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => saveBand(id)}
                              disabled={savingRoomId === id}
                            >
                              {savingRoomId === id ? 'Saving…' : 'Save'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {rooms.length === 0 && (
                  <p className="mt-6 text-sm text-[#8c8c8c]">No rooms configured for this hotel yet.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
