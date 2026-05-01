import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Star, Edit, Power, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AddHotelWizard } from '../../components/admin/AddHotelWizard';
import { Modal } from '../../components/admin/Modal';
import { hotelService, type PublicHotel } from '../../services/api';
import { makeImageFallback } from '../../utils/hotelImages';

interface HotelCard {
  id: string;
  name: string;
  image: string;
  stars: number;
  city: string;
  roomCount: number;
  status: string;
  raw: PublicHotel;
}

const toHotelCard = (h: PublicHotel): HotelCard => {
  const rawAny = h as unknown as Record<string, unknown>;
  const id = String(h.id);
  const stars = Number(h.starRating ?? h.star_rating ?? 0) || 0;
  const totalRooms = Number(
    (rawAny.totalRooms as number | undefined) ??
      (rawAny.total_rooms as number | undefined) ??
      0,
  );
  const city =
    h.address ||
    h.location ||
    (rawAny.location_raw as string | undefined) ||
    'Location TBD';
  const status = String((rawAny.status as string | undefined) || 'active').toLowerCase();
  const image =
    (rawAny.image_url as string | undefined) ||
    (Array.isArray(rawAny.images) && typeof (rawAny.images as unknown[])[0] === 'string'
      ? ((rawAny.images as string[])[0])
      : '') ||
    '';

  return {
    id,
    name: h.name || h.hotel_name || `Hotel #${id}`,
    image,
    stars,
    city,
    roomCount: totalRooms,
    status,
    raw: h,
  };
};

export function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showEditHotelModal, setShowEditHotelModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelCard | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      // Public endpoint already returns the same hotel rows the admin needs,
      // and works regardless of manager-id wiring in mock mode. The backend
      // already injects image_url + images[] from ImageKit.
      const list = await hotelService.getAll();
      setHotels(list.map(toHotelCard));
    } catch (err) {
      const message =
        (err as { data?: { error?: string }; message?: string } | null)?.data?.error ||
        (err as { message?: string } | null)?.message ||
        'Failed to load hotels';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const total = hotels.length;
    const active = hotels.filter((h) => h.status === 'active').length;
    const totalRooms = hotels.reduce((sum, h) => sum + (h.roomCount || 0), 0);
    return { total, active, totalRooms };
  }, [hotels]);

  const handleEditHotel = (hotel: HotelCard) => {
    setSelectedHotel(hotel);
    setShowEditHotelModal(true);
  };

  return (
    <AdminLayout title="Hotels & Rooms" breadcrumb="Admin">
      <div className="space-y-6">
        {/* Header summary + Add button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p
              className="text-[13px] text-[#6b7280] dark:text-white/55"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {loading
                ? 'Loading properties…'
                : `${stats.total} properties · ${stats.active} active · ${stats.totalRooms} rooms total`}
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-[#1ABC9C] to-[#16A085] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,188,156,0.55)] hover:brightness-105 transition-all"
            onClick={() => setShowAddHotelModal(true)}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add New Hotel
          </button>
        </div>

        {error && (
          <div className="admin-card p-5 flex items-start gap-3 border-[#EF4444]/40">
            <AlertCircle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5" strokeWidth={1.8} />
            <div className="flex-1">
              <p
                className="text-[13.5px] font-semibold text-[#1f2937] dark:text-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Couldn&rsquo;t load hotels
              </p>
              <p
                className="text-[12.5px] text-[#6b7280] dark:text-white/60 mt-0.5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {error}
              </p>
              <button
                onClick={refresh}
                className="text-[12.5px] font-medium text-[#1ABC9C] hover:text-[#16A085] mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Hotels grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-card overflow-hidden">
                <div className="h-44 bg-black/[0.04] dark:bg-white/[0.04] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/2 rounded bg-black/[0.06] dark:bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-black/[0.04] dark:bg-white/[0.04] animate-pulse" />
                  <div className="h-2 w-full rounded bg-black/[0.04] dark:bg-white/[0.04] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="admin-card p-12 text-center">
            <div className="mx-auto admin-kpi-icon mb-4">
              <Plus className="h-5 w-5" strokeWidth={1.7} />
            </div>
            <h3
              className="text-[16px] font-semibold text-[#1f2937] dark:text-white mb-1"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              No hotels yet
            </h3>
            <p
              className="text-[13px] text-[#6b7280] dark:text-white/55 mb-5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Get started by adding your first property.
            </p>
            <button
              onClick={() => setShowAddHotelModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-[#1ABC9C] to-[#16A085] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(26,188,156,0.55)]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Add Your First Hotel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="admin-card overflow-hidden">
                <div className="relative h-44 bg-linear-to-br from-[#1ABC9C]/12 to-[#38bdf8]/8 dark:from-[#2dd4bf]/12 dark:to-[#60a5fa]/8">
                  {hotel.image ? (
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      onError={makeImageFallback({ id: hotel.id, name: hotel.name })}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <span
                    className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${
                      hotel.status === 'active'
                        ? 'bg-[#22C55E]/85 text-white'
                        : 'bg-black/55 text-white'
                    }`}
                  >
                    <Power className="h-3 w-3" strokeWidth={2.4} />
                    {hotel.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="p-5 space-y-3.5">
                  <div>
                    <h3
                      className="text-[15.5px] font-semibold text-[#1f2937] dark:text-white leading-tight line-clamp-1"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                      title={hotel.name}
                    >
                      {hotel.name}
                    </h3>
                    <p
                      className="text-[12.5px] text-[#6b7280] dark:text-white/55 mt-0.5 line-clamp-1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      title={hotel.city}
                    >
                      {hotel.city}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[12.5px]">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < hotel.stars
                              ? 'fill-[#FFA500] text-[#FFA500]'
                              : 'fill-black/[0.08] text-black/[0.08] dark:fill-white/[0.12] dark:text-white/[0.12]'
                          }`}
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                    <span
                      className="text-[#6b7280] dark:text-white/60"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <span className="font-semibold text-[#1f2937] dark:text-white">
                        {hotel.roomCount || '—'}
                      </span>{' '}
                      rooms
                    </span>
                  </div>

                  <button
                    onClick={() => handleEditHotel(hotel)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-black/[0.08] dark:border-white/[0.10] bg-white/55 dark:bg-white/[0.04] px-4 py-2 text-[12.5px] font-semibold text-[#1f2937] dark:text-white hover:border-[#1ABC9C]/45 hover:text-[#16A085] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Edit className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Edit Hotel & Rooms
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddHotelWizard
        isOpen={showAddHotelModal}
        onClose={() => {
          setShowAddHotelModal(false);
          refresh();
        }}
      />

      <Modal
        isOpen={showEditHotelModal}
        onClose={() => {
          setShowEditHotelModal(false);
          setSelectedHotel(null);
        }}
        title={`Edit ${selectedHotel?.name || 'Hotel'}`}
      >
        {selectedHotel && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1f2937] dark:text-white/85 mb-1.5">
                  Hotel Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedHotel.name}
                  className="w-full px-4 py-2.5 border border-black/[0.08] dark:border-white/[0.10] rounded-lg bg-white dark:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1f2937] dark:text-white/85 mb-1.5">
                  Star Rating
                </label>
                <select
                  defaultValue={selectedHotel.stars}
                  className="w-full px-4 py-2.5 border border-black/[0.08] dark:border-white/[0.10] rounded-lg bg-white dark:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                >
                  {[5, 4, 3, 2, 1].map((s) => (
                    <option key={s} value={s}>
                      {s} Star{s === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1f2937] dark:text-white/85 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  defaultValue={selectedHotel.city}
                  className="w-full px-4 py-2.5 border border-black/[0.08] dark:border-white/[0.10] rounded-lg bg-white dark:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1f2937] dark:text-white/85 mb-1.5">
                  Total Rooms
                </label>
                <input
                  type="number"
                  defaultValue={selectedHotel.roomCount}
                  className="w-full px-4 py-2.5 border border-black/[0.08] dark:border-white/[0.10] rounded-lg bg-white dark:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1f2937] dark:text-white/85 mb-1.5">
                  Status
                </label>
                <select
                  defaultValue={selectedHotel.status}
                  className="w-full px-4 py-2.5 border border-black/[0.08] dark:border-white/[0.10] rounded-lg bg-white dark:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowEditHotelModal(false);
                  setSelectedHotel(null);
                }}
                className="flex-1 px-4 py-2.5 border border-black/[0.08] dark:border-white/[0.10] rounded-lg text-[#1f2937] dark:text-white/85 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditHotelModal(false);
                  setSelectedHotel(null);
                }}
                className="flex-1 px-4 py-2.5 bg-linear-to-br from-[#1ABC9C] to-[#16A085] text-white rounded-lg text-[13px] font-semibold inline-flex items-center justify-center gap-2"
                disabled
                title="Save wiring coming soon"
              >
                <Loader2 className="h-3.5 w-3.5 opacity-0" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
