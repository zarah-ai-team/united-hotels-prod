import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MapPin, Star, ChevronLeft, ChevronRight, Wifi, Coffee, Car, Wind } from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { Button } from '../components/ui/Button';
import { useBooking } from '../context/BookingContext';
import { getHotelById } from '../data/mockData';

export function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHotel, setRoom, setDates } = useBooking();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [checkIn, setCheckInDate] = useState('2025-03-15');
  const [checkOut, setCheckOutDate] = useState('2025-03-18');

  const hotel = id ? getHotelById(id) : null;

  if (!hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Poppins'] font-bold text-[24px] text-[#3b3b3b] mb-[16px]">
            Hotel not found
          </h2>
          <Button onClick={() => navigate('/listing')}>
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  const images = [hotel.image, ...(hotel.rooms?.map(r => r.image) || [])];

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleContinue = () => {
    if (!selectedRoomId) return;
    
    const room = hotel.rooms?.find(r => r.id === selectedRoomId);
    if (!room) return;

    setHotel({
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      image: hotel.image
    });

    setRoom({
      id: room.id,
      name: room.name,
      price: room.directPrice
    });

    setDates(checkIn, checkOut);
    navigate('/booking/step1');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-[16px] md:px-[32px]">
          <div className="flex items-center justify-between h-[64px]">
            <a href="/" className="font-['Poppins'] font-bold text-[20px] text-[#1ABC9C]">
              United Hotels
            </a>
            
            <nav className="hidden md:flex items-center gap-[32px]">
              <a href="/listing" className="font-['Inter'] text-[14px] text-[#3b3b3b] hover:text-[#1ABC9C]">
                Back to Search
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-[16px] md:px-[32px] py-[32px]">
        {/* Image Gallery */}
        <div className="relative mb-[32px] rounded-[12px] overflow-hidden">
          <div className="relative h-[300px] md:h-[500px]">
            <img 
              src={images[currentImageIndex]} 
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-[24px] h-[24px] text-[#3b3b3b]" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-[24px] h-[24px] text-[#3b3b3b]" />
                </button>
                
                <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 flex gap-[8px]">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-[8px] h-[8px] rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-[24px]' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-[32px]">
          {/* Left Side - Room Selection (8 columns) */}
          <div className="md:col-span-8">
            {/* Hotel Overview */}
            <div className="mb-[32px]">
              <h1 className="font-['Poppins'] font-bold text-[32px] text-[#3b3b3b] mb-[12px]">
                {hotel.name}
              </h1>
              
              <div className="flex items-center gap-[16px] mb-[16px]">
                <div className="flex items-center gap-[6px]">
                  <MapPin className="w-[18px] h-[18px] text-[#8c8c8c]" />
                  <span className="font-['Inter'] text-[16px] text-[#8c8c8c]">{hotel.location}</span>
                </div>
                
                <div className="flex items-center gap-[8px]">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-[16px] h-[16px] ${i < hotel.rating ? 'fill-[#FFA500] text-[#FFA500]' : 'text-[#E5E7EB]'}`}
                      />
                    ))}
                  </div>
                  <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">
                    ({hotel.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <p className="font-['Inter'] text-[16px] text-[#3b3b3b] leading-[1.7] mb-[24px]">
                {hotel.description}
              </p>

              {/* Amenities */}
              <div className="bg-[#fafafa] rounded-[12px] p-[24px] mb-[32px]">
                <h3 className="font-['Poppins'] font-semibold text-[18px] text-[#3b3b3b] mb-[16px]">
                  Hotel Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-[16px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-white rounded-[8px] flex items-center justify-center">
                      <Wifi className="w-[20px] h-[20px] text-[#1ABC9C]" />
                    </div>
                    <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">Free WiFi</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-white rounded-[8px] flex items-center justify-center">
                      <Coffee className="w-[20px] h-[20px] text-[#1ABC9C]" />
                    </div>
                    <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">Breakfast</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-white rounded-[8px] flex items-center justify-center">
                      <Car className="w-[20px] h-[20px] text-[#1ABC9C]" />
                    </div>
                    <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">Airport Shuttle</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-white rounded-[8px] flex items-center justify-center">
                      <Wind className="w-[20px] h-[20px] text-[#1ABC9C]" />
                    </div>
                    <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">Air Conditioning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Categories */}
            <div>
              <h2 className="font-['Poppins'] font-bold text-[24px] text-[#3b3b3b] mb-[24px]">
                Available Rooms
              </h2>

              {/* Date Selection */}
              <div className="bg-[#f0fdf4] rounded-[12px] p-[20px] mb-[24px]">
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="font-['Inter'] font-medium text-[14px] text-[#3b3b3b] mb-[8px] block">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-[16px] py-[12px] border border-[#eaeaea] rounded-[8px] font-['Inter'] text-[16px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-['Inter'] font-medium text-[14px] text-[#3b3b3b] mb-[8px] block">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-[16px] py-[12px] border border-[#eaeaea] rounded-[8px] font-['Inter'] text-[16px] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-[16px]">
                {hotel.rooms?.map((room) => (
                  <RoomCard
                    key={room.id}
                    {...room}
                    onSelect={handleRoomSelect}
                    isSelected={selectedRoomId === room.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar (Desktop) */}
          <div className="hidden md:block md:col-span-4">
            <div className="sticky top-[96px]">
              <div className="bg-white border-2 border-[#eaeaea] rounded-[12px] p-[24px]">
                <h3 className="font-['Poppins'] font-bold text-[18px] text-[#3b3b3b] mb-[16px]">
                  Booking Summary
                </h3>
                
                {selectedRoomId ? (
                  <>
                    <div className="space-y-[12px] mb-[20px] pb-[20px] border-b border-[#eaeaea]">
                      <div className="flex justify-between">
                        <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">Room</span>
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b] font-medium">
                          {hotel.rooms?.find(r => r.id === selectedRoomId)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">Check-in</span>
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">{checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">Check-out</span>
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">{checkOut}</span>
                      </div>
                    </div>

                    <div className="space-y-[8px] mb-[20px]">
                      <div className="flex justify-between">
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">Room rate</span>
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">
                          ${hotel.rooms?.find(r => r.id === selectedRoomId)?.directPrice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">3 nights</span>
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">
                          ${(hotel.rooms?.find(r => r.id === selectedRoomId)?.directPrice || 0) * 3}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">Taxes & fees</span>
                        <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">$12</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-[24px] pb-[20px] border-b border-[#eaeaea]">
                      <span className="font-['Poppins'] font-bold text-[18px] text-[#3b3b3b]">Total</span>
                      <span className="font-['Poppins'] font-bold text-[24px] text-[#1ABC9C]">
                        ${(hotel.rooms?.find(r => r.id === selectedRoomId)?.directPrice || 0) * 3 + 12}
                      </span>
                    </div>

                    <Button variant="primary" size="lg" fullWidth onClick={handleContinue}>
                      Continue to Book
                    </Button>
                  </>
                ) : (
                  <p className="font-['Inter'] text-[14px] text-[#8c8c8c] text-center py-[32px]">
                    Select a room to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        {selectedRoomId && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eaeaea] p-[16px] z-50">
            <div className="flex items-center justify-between mb-[12px]">
              <div>
                <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">Total</span>
                <div className="font-['Poppins'] font-bold text-[24px] text-[#1ABC9C]">
                  ${(hotel.rooms?.find(r => r.id === selectedRoomId)?.directPrice || 0) * 3 + 12}
                </div>
              </div>
              <Button variant="primary" size="lg" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}