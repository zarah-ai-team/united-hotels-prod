import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useBooking } from "../context/BookingContext";
const imgImageSultanahmetBoutiqueHotel = "/figma-assets/126d7e43c8c296ca95f6cc5a2e933adaced67080.png";
const imgImageStandardDoubleRoom = "/figma-assets/7e02ef53fba6bfed58a27b4d1bb05e80049a2e42.png";
const imgImageDeluxeRoomWithCityView = "/figma-assets/21fb56b8a548cacf25317bd5e15acdb4e2f63841.png";
import { 
  MapPin, Star, Wifi, Snowflake, Coffee, Plane, Check, 
  Clock, ChevronLeft, ChevronRight, Calendar, Users, 
  DollarSign, Shield, TrendingDown, Eye, Sparkles, 
  Maximize2, Bed, User2
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  image: string;
  size: number;
  beds: string;
  maxGuests: number;
  price: number;
  otaPrice: number;
  amenities: string[];
  cancellation: string;
  availability: number;
}

export function HotelDetailPageNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHotel, setRoom, setDates, setGuests } = useBooking();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState("10 March 2026");
  const [checkOut, setCheckOut] = useState("19 March 2026");
  const [guests, setGuestsState] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Hotel Data
  const hotel = {
    id: "1",
    name: "Sultanahmet Boutique Hotel",
    location: "Sultanahmet, Old City",
    rating: 4.6,
    reviews: 127,
    description: "Located in the heart of historic Istanbul, just steps from Hagia Sophia and Blue Mosque. Our boutique hotel offers comfortable rooms with modern amenities in a traditional setting.",
    images: [
      imgImageSultanahmetBoutiqueHotel,
      imgImageStandardDoubleRoom,
      imgImageDeluxeRoomWithCityView
    ],
    amenities: [
      { icon: <Wifi className="w-5 h-5" />, name: "Free WiFi", description: "High-speed internet" },
      { icon: <Snowflake className="w-5 h-5" />, name: "Air Conditioning", description: "All rooms" },
      { icon: <Coffee className="w-5 h-5" />, name: "Breakfast", description: "Turkish buffet" },
      { icon: <Plane className="w-5 h-5" />, name: "Airport Shuttle", description: "Paid service" }
    ],
    highlights: [
      "5 min walk to Blue Mosque",
      "Family-run property",
      "Rooftop terrace views",
      "24/7 reception"
    ]
  };

  const rooms: Room[] = [
    {
      id: "room-1",
      name: "Standard Double Room",
      image: imgImageStandardDoubleRoom,
      size: 18,
      beds: "1 Queen bed",
      maxGuests: 2,
      price: 42,
      otaPrice: 57,
      amenities: ["Free WiFi", "TV", "Private Bathroom", "AC", "Mini Fridge"],
      cancellation: "Free cancellation until 24 hours before check-in",
      availability: 3
    },
    {
      id: "room-2",
      name: "Deluxe Room with City View",
      image: imgImageDeluxeRoomWithCityView,
      size: 27,
      beds: "1 King bed",
      maxGuests: 2,
      price: 58,
      otaPrice: 75,
      amenities: ["Free WiFi", "TV", "City View", "Mini Bar", "AC", "Balcony"],
      cancellation: "Free cancellation until 48 hours before check-in",
      availability: 2
    }
  ];

  const handleRoomSelect = (room: Room) => {
    setSelectedRoomId(room.id);
    
    // Update booking context
    setHotel({
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      image: hotel.images[0]
    });
    
    setRoom({
      id: room.id,
      name: room.name,
      price: room.price
    });
    
    // Parse dates and set in context
    setDates("2026-03-10", "2026-03-19");
    setGuests(guests);
  };

  const handleContinueToBook = () => {
    if (selectedRoomId) {
      navigate('/booking/step1');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  const nights = 3; // Calculated from check-in/check-out
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const fullStars = Math.floor(hotel.rating);
  const hasHalfStar = hotel.rating % 1 >= 0.5;

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      <main className="max-w-[1840px] mx-auto px-10 py-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[14px]">
            <Link to="/" className="text-[#8c8c8c] hover:text-[#1abc9c] font-['Inter:Regular',sans-serif]">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-[#8c8c8c]" />
            <Link to="/listing" className="text-[#8c8c8c] hover:text-[#1abc9c] font-['Inter:Regular',sans-serif]">
              Hotels in Istanbul
            </Link>
            <ChevronRight className="w-4 h-4 text-[#8c8c8c]" />
            <span className="text-[#3b3b3b] font-['Inter:Medium',sans-serif]">
              {hotel.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_400px] gap-8">
          {/* Left Column - Hotel Details */}
          <div>
            {/* Hero Gallery - Grid Layout */}
            <div className="grid grid-cols-2 gap-3 mb-8 h-[480px]">
              {/* Main Large Image */}
              <div className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden group">
                <img 
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>

              {/* Two Smaller Images */}
              <div className="relative rounded-2xl overflow-hidden group">
                <img 
                  src={hotel.images[1]}
                  alt={`${hotel.name} - Room`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
              </div>

              <div className="relative rounded-2xl overflow-hidden group">
                <img 
                  src={hotel.images[2]}
                  alt={`${hotel.name} - View`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                
                {/* View All Photos Button */}
                <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                    <Eye className="w-5 h-5" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[15px]">
                      View all photos
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Hotel Header */}
            <div className="bg-white rounded-2xl p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[44px] text-[#3b3b3b] mb-3">
                    {hotel.name}
                  </h1>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[16px] text-[#6b7280]">
                        {hotel.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(fullStars)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFA500] text-[#FFA500]" />
                        ))}
                        {hasHalfStar && (
                          <Star className="w-4 h-4 text-[#FFA500]" style={{ fill: 'url(#halfStar)' }} />
                        )}
                        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-[#E5E7EB]" />
                        ))}
                      </div>
                      <span className="font-['Inter:Bold',sans-serif] text-[15px] text-[#3b3b3b]">
                        {hotel.rating}
                      </span>
                      <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                        ({hotel.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-gradient-to-br from-[#1abc9c]/10 to-[#1abc9c]/5 border border-[#1abc9c]/20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-[#1abc9c]" />
                    <span className="font-['Inter:Bold',sans-serif] text-[14px] text-[#1abc9c]">
                      Verified
                    </span>
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280]">
                    By United Hotels
                  </div>
                </div>
              </div>

              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#4b5563] leading-[26px]">
                {hotel.description}
              </p>

              {/* Highlights */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {hotel.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#1abc9c]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#1abc9c]" />
                    </div>
                    <span className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b]">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Amenities */}
            <div className="bg-white rounded-2xl p-8 mb-6">
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mb-6">
                Hotel Amenities
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-[#fafafa] rounded-xl border border-[#eaeaea] hover:border-[#1abc9c] hover:bg-white transition-all group">
                    <div className="bg-[#1abc9c]/10 p-2.5 rounded-lg text-[#1abc9c] group-hover:bg-[#1abc9c] group-hover:text-white transition-colors">
                      {amenity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b] mb-0.5">
                        {amenity.name}
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c]">
                        {amenity.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Rooms Section */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[28px] text-[#3b3b3b] mb-6">
                Choose Your Room
              </h2>

              {/* Room Cards */}
              <div className="space-y-6">
                {rooms.map((room) => {
                  const savings = room.otaPrice - room.price;
                  const savingsPercent = Math.round((savings / room.otaPrice) * 100);
                  const isSelected = selectedRoomId === room.id;

                  return (
                    <div
                      key={room.id}
                      className={`border-2 rounded-2xl overflow-hidden transition-all ${
                        isSelected
                          ? 'border-[#1abc9c] shadow-xl bg-[#1abc9c]/5'
                          : 'border-[#eaeaea] hover:border-[#1abc9c]/50 hover:shadow-lg bg-white'
                      }`}
                    >
                      <div className="grid grid-cols-[320px_1fr] gap-6 p-6">
                        {/* Room Image */}
                        <div className="relative rounded-xl overflow-hidden group/img">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                          />
                          
                          {/* Savings Badge */}
                          {savings > 0 && (
                            <div className="absolute top-3 right-3 bg-[#10b981] text-white px-3 py-1.5 rounded-lg shadow-lg font-['Inter:Bold',sans-serif] text-[13px] flex items-center gap-1">
                              <TrendingDown className="w-3.5 h-3.5" />
                              Save ${savings}
                            </div>
                          )}
                        </div>

                        {/* Room Details */}
                        <div className="flex flex-col">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] text-[#3b3b3b] mb-3">
                                  {room.name}
                                </h3>
                                
                                {/* Room Specs */}
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="flex items-center gap-2 text-[#6b7280]">
                                    <Maximize2 className="w-4 h-4" />
                                    <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                                      {room.size}m²
                                    </span>
                                  </div>
                                  <div className="w-1 h-1 bg-[#d1d5db] rounded-full" />
                                  <div className="flex items-center gap-2 text-[#6b7280]">
                                    <Bed className="w-4 h-4" />
                                    <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                                      {room.beds}
                                    </span>
                                  </div>
                                  <div className="w-1 h-1 bg-[#d1d5db] rounded-full" />
                                  <div className="flex items-center gap-2 text-[#6b7280]">
                                    <User2 className="w-4 h-4" />
                                    <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                                      Up to {room.maxGuests} guests
                                    </span>
                                  </div>
                                </div>

                                {/* Amenities Grid */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  {room.amenities.slice(0, 6).map((amenity, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Check className="w-3.5 h-3.5 text-[#1abc9c]" />
                                      <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b]">
                                        {amenity}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Cancellation Policy */}
                                <div className="bg-[#d1fae5] border border-[#86efac] rounded-xl p-3 flex items-start gap-2">
                                  <Check className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#059669] mb-0.5">
                                      Free Cancellation
                                    </div>
                                    <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#047857]">
                                      {room.cancellation}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Pricing Column */}
                              <div className="ml-6 text-right flex-shrink-0">
                                {room.otaPrice > room.price && (
                                  <div className="mb-2">
                                    <div className="flex items-center justify-end gap-2 mb-1">
                                      <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c] line-through">
                                        ${room.otaPrice}
                                      </span>
                                      <span className="bg-[#10b981] text-white px-2 py-0.5 rounded text-[12px] font-['Inter:Bold',sans-serif]">
                                        -{savingsPercent}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <div className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[36px] text-[#1abc9c] mb-1">
                                  ${room.price}
                                </div>
                                <div className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280] mb-3">
                                  per night
                                </div>
                                
                                {room.availability <= 3 && (
                                  <div className="inline-flex items-center gap-1.5 bg-[#fee2e2] border border-[#fca5a5] text-[#dc2626] px-3 py-1.5 rounded-lg font-['Inter:Bold',sans-serif] text-[12px] mb-4">
                                    <Clock className="w-3.5 h-3.5" />
                                    Only {room.availability} left
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Select Button */}
                          <button
                            onClick={() => handleRoomSelect(room)}
                            className={`w-full py-4 rounded-xl font-['Inter:Bold',sans-serif] text-[16px] transition-all relative overflow-hidden group/btn ${
                              isSelected
                                ? 'bg-[#1abc9c] text-white'
                                : 'bg-[#1abc9c] text-white hover:bg-[#16a085]'
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {isSelected ? (
                                <>
                                  <Check className="w-5 h-5" />
                                  Selected
                                </>
                              ) : (
                                'Select This Room'
                              )}
                            </span>
                            {!isSelected && (
                              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Booking Card */}
          <div>
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border-2 border-[#1abc9c] p-8 shadow-xl">
                <div className="mb-6">
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b] mb-2">
                    Your Booking
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                    Complete your reservation
                  </p>
                </div>

                {/* Dates Display */}
                <div className="bg-[#fafafa] rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-['Inter:Medium',sans-serif] text-[11px] text-[#8c8c8c] uppercase tracking-wide mb-1">
                        Check-in
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#1abc9c]" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                          {checkIn}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#eaeaea] mb-3" />
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-['Inter:Medium',sans-serif] text-[11px] text-[#8c8c8c] uppercase tracking-wide mb-1">
                        Check-out
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#1abc9c]" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                          {checkOut}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#eaeaea] mb-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-['Inter:Medium',sans-serif] text-[11px] text-[#8c8c8c] uppercase tracking-wide mb-1">
                        Guests
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#1abc9c]" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                          {guests} guests
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#eaeaea]">
                    <div className="flex items-center justify-between">
                      <span className="font-['Inter:Medium',sans-serif] text-[13px] text-[#6b7280]">
                        Total nights
                      </span>
                      <span className="font-['Inter:Bold',sans-serif] text-[14px] text-[#3b3b3b]">
                        {nights} nights
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Room Summary */}
                {selectedRoom ? (
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-[#1abc9c]/10 to-[#1abc9c]/5 border border-[#1abc9c]/20 rounded-xl p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#1abc9c] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          <Check className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-['Inter:Bold',sans-serif] text-[15px] text-[#3b3b3b] mb-1">
                            {selectedRoom.name}
                          </div>
                          <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                            {selectedRoom.beds} • Up to {selectedRoom.maxGuests} guests
                          </div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-2 pt-3 border-t border-[#1abc9c]/20">
                        <div className="flex items-center justify-between">
                          <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                            ${selectedRoom.price} × {nights} nights
                          </span>
                          <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                            ${selectedRoom.price * nights}
                          </span>
                        </div>
                        
                        {selectedRoom.otaPrice > selectedRoom.price && (
                          <div className="flex items-center justify-between">
                            <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#10b981]">
                              Direct booking savings
                            </span>
                            <span className="font-['Inter:Bold',sans-serif] text-[14px] text-[#10b981]">
                              -${(selectedRoom.otaPrice - selectedRoom.price) * nights}
                            </span>
                          </div>
                        )}

                        <div className="h-px bg-[#1abc9c]/20 my-3" />
                        
                        <div className="flex items-center justify-between">
                          <span className="font-['Inter:Bold',sans-serif] text-[16px] text-[#3b3b3b]">
                            Total Price
                          </span>
                          <span className="font-['Poppins:Bold',sans-serif] text-[24px] text-[#1abc9c]">
                            ${selectedRoom.price * nights}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 bg-[#fef3c7] border border-[#fbbf24] rounded-xl p-4 text-center">
                    <Sparkles className="w-6 h-6 text-[#f59e0b] mx-auto mb-2" />
                    <p className="font-['Inter:Medium',sans-serif] text-[14px] text-[#92400e]">
                      Select a room to continue
                    </p>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleContinueToBook}
                  disabled={!selectedRoomId}
                  className="w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[16px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1abc9c] mb-4 relative overflow-hidden group/btn"
                >
                  <span className="relative z-10">Continue to Book</span>
                  {selectedRoomId && (
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  )}
                </button>

                {/* Trust Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <Check className="w-4 h-4 text-[#10b981]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[13px]">
                      Free cancellation
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <Shield className="w-4 h-4 text-[#10b981]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[13px]">
                      Secure payment
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <DollarSign className="w-4 h-4 text-[#10b981]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[13px]">
                      Best price guarantee
                    </span>
                  </div>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="mt-6 bg-gradient-to-br from-[#f3f4f6] to-white rounded-2xl p-6 border border-[#eaeaea]">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#1abc9c]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Coffee className="w-6 h-6 text-[#1abc9c]" />
                  </div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-2">
                    Need Help?
                  </h3>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] mb-4">
                    Our local team is here 24/7 via WhatsApp
                  </p>
                  <button className="text-[#1abc9c] font-['Inter:SemiBold',sans-serif] text-[14px] hover:text-[#16a085] transition-colors">
                    Contact Support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* SVG Gradient for Half Star */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="50%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default HotelDetailPageNew;
