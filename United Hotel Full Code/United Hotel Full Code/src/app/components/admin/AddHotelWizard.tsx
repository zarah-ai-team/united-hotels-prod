import { useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { hotelService } from '../../services/api';

interface AddHotelWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

interface WizardFormData {
  name: string;
  address: string;
  description: string;
  starRating: string;
  status: 'active' | 'inactive';
  totalRooms: string;
  contactPhone: string;
  email: string;
  hotelLink: string;
  googleMapsLink: string;
  checkInTime: string;
  checkOutTime: string;
  childPolicy: string;
  petPolicy: string;
  smokingPolicy: string;
  amenitiesText: string;
  roomCategoriesJson: string;
}

const initialData: WizardFormData = {
  name: '',
  address: '',
  description: '',
  starRating: '5',
  status: 'active',
  totalRooms: '',
  contactPhone: '',
  email: '',
  hotelLink: '',
  googleMapsLink: '',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  childPolicy: '',
  petPolicy: '',
  smokingPolicy: '',
  amenitiesText: '',
  roomCategoriesJson: ''
};

const parseAmenities = (input: string) => {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
};

const parseRoomCategories = (input: string) => {
  if (!input.trim()) return null;
  const parsed = JSON.parse(input);
  if (!Array.isArray(parsed)) {
    throw new Error('Room categories must be a JSON array.');
  }
  return parsed;
};

export function AddHotelWizard({ isOpen, onClose }: AddHotelWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<WizardFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;

  const canContinue = useMemo(() => {
    if (currentStep === 1) {
      return Boolean(formData.name.trim() && formData.address.trim() && formData.description.trim());
    }
    if (currentStep === 2) {
      return Boolean(formData.contactPhone.trim() && formData.email.trim());
    }
    return true;
  }, [currentStep, formData]);

  const closeAndReset = () => {
    setCurrentStep(1);
    setFormData(initialData);
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const nextStep = () => {
    if (!canContinue || currentStep >= totalSteps) return;
    setCurrentStep((currentStep + 1) as Step);
  };

  const prevStep = () => {
    if (currentStep <= 1) return;
    setCurrentStep((currentStep - 1) as Step);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const amenities = parseAmenities(formData.amenitiesText);
      const roomCategories = parseRoomCategories(formData.roomCategoriesJson);
      const totalRooms = Number.parseInt(formData.totalRooms, 10);

      const payload: Record<string, any> = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        description: formData.description.trim(),
        starRating: Number.parseInt(formData.starRating, 10),
        status: formData.status,
        contactPhone: formData.contactPhone.trim(),
        email: formData.email.trim(),
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime
      };

      if (!Number.isNaN(totalRooms) && totalRooms > 0) {
        payload.totalRooms = totalRooms;
      }
      if (formData.hotelLink.trim()) payload.hotelLink = formData.hotelLink.trim();
      if (formData.googleMapsLink.trim()) payload.googleMapsLink = formData.googleMapsLink.trim();
      if (formData.childPolicy.trim()) payload.childPolicy = formData.childPolicy.trim();
      if (formData.petPolicy.trim()) payload.petPolicy = formData.petPolicy.trim();
      if (formData.smokingPolicy.trim()) payload.smokingPolicy = formData.smokingPolicy.trim();
      if (amenities.length) payload.amenities = amenities;
      if (roomCategories) payload.roomCategories = roomCategories;

      await hotelService.create(payload);
      closeAndReset();
    } catch (submitError: any) {
      setError(submitError?.data?.error || submitError?.message || 'Failed to create hotel');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAndReset} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#EAEAEA]">
          <div>
            <h2 className="text-2xl font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Add New Hotel
            </h2>
            <p className="text-sm text-[#8C8C8C] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Step {currentStep} of {totalSteps} - Schema-aligned fields only
            </p>
          </div>
          <button onClick={closeAndReset} className="text-[#8C8C8C] hover:text-[#3B3B3B] transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-8 py-4 bg-[#FAFAFA] border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`h-2 flex-1 rounded-full ${step <= currentStep ? 'bg-[#1ABC9C]' : 'bg-[#EAEAEA]'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {currentStep === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Hotel Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Description *</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Star Rating</label>
                  <select
                    value={formData.starRating}
                    onChange={(e) => setFormData((prev) => ({ ...prev, starRating: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Total Rooms</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalRooms}
                    onChange={(e) => setFormData((prev) => ({ ...prev, totalRooms: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Contact Phone *</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Hotel Link</label>
                  <input
                    type="url"
                    value={formData.hotelLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hotelLink: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Google Maps Link</label>
                  <input
                    type="url"
                    value={formData.googleMapsLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, googleMapsLink: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Check-in Time</label>
                  <input
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, checkInTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Check-out Time</label>
                  <input
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, checkOutTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Child Policy</label>
                  <input
                    type="text"
                    value={formData.childPolicy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, childPolicy: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Pet Policy</label>
                  <input
                    type="text"
                    value={formData.petPolicy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, petPolicy: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Smoking Policy</label>
                  <input
                    type="text"
                    value={formData.smokingPolicy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, smokingPolicy: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Amenities (comma separated)</label>
                <input
                  type="text"
                  placeholder="wifi, breakfast, pool"
                  value={formData.amenitiesText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amenitiesText: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3B3B3B] mb-2">Room Categories JSON (optional)</label>
                <textarea
                  rows={5}
                  placeholder='[{"room_name":"Deluxe Room","room_category":"deluxe","base_price":2400,"currency_code":"TRY"}]'
                  value={formData.roomCategoriesJson}
                  onChange={(e) => setFormData((prev) => ({ ...prev, roomCategoriesJson: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] font-mono text-sm resize-none"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-[#EAEAEA] bg-[#FAFAFA]">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#EAEAEA] text-[#3B3B3B] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canContinue || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1ABC9C] text-white font-semibold disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1ABC9C] text-white font-semibold disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Create Hotel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
