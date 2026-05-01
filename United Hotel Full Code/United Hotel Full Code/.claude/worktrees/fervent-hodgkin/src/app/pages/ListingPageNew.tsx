import { useState } from "react";
import { Link } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
const imgImageHotel1 = "/figma-assets/24b94370ae50cf05c8eda404c2045b52c5b68320.png";
const imgImageHotel2 = "/figma-assets/126d7e43c8c296ca95f6cc5a2e933adaced67080.png";
const imgImageHotel3 = "/figma-assets/2192c11a429594d69f4c28f4fc3ed22cdc4449b5.png";
import { 
  MapPin, Star, ChevronDown, ChevronUp, Search, SlidersHorizontal, 
  Wifi, Coffee, Utensils, AirVent, X, TrendingDown, Sparkles
} from "lucide-react";

interface Hotel {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  otaPrice: number;
  directPrice: number;
  savings: number;
  badge?: string;
  amenities: string[];
  neighborhood: string;
}

const mockHotels: Hotel[] = [
  {
    id: 1,
    name: "Taksim Central Stay",
    location: "Taksim, Beyoğlu",
    image: imgImageHotel1,
    rating: 4,
    reviews: 127,
    otaPrice: 50,
    directPrice: 38,
    savings: 12,
    badge: "Save $12",
    amenities: ["Nice View", "Free WiFi", "Breakfast"],
    neighborhood: "Taksim"
  },
  {
    id: 2,
    name: "Sultanahmet Boutique Hotel",
    location: "Sultanahmet, Old City",
    image: imgImageHotel2,
    rating: 4,
    reviews: 89,
    otaPrice: 57,
    directPrice: 42,
    savings: 15,
    badge: "Save $15",
    amenities: ["Free WiFi", "Breakfast", "Airport Shuttle"],
    neighborhood: "Sultanahmet"
  },
  {
    id: 3,
    name: "Kadıköy Harbor View",
    location: "Kadıköy, Asian Side",
    image: imgImageHotel3,
    rating: 5,
    reviews: 156,
    otaPrice: 57,
    directPrice: 45,
    savings: 12,
    badge: "Save $12",
    amenities: ["Nice View", "Free WiFi", "Restaurant"],
    neighborhood: "Kadıköy"
  },
  {
    id: 4,
    name: "Taksim Central Stay",
    location: "Taksim, Beyoğlu",
    image: imgImageHotel1,
    rating: 4,
    reviews: 127,
    otaPrice: 50,
    directPrice: 38,
    savings: 12,
    badge: "Save $12",
    amenities: ["Nice View", "Free WiFi", "Breakfast"],
    neighborhood: "Taksim"
  },
  {
    id: 5,
    name: "Sultanahmet Boutique Hotel",
    location: "Sultanahmet, Old City",
    image: imgImageHotel2,
    rating: 4,
    reviews: 89,
    otaPrice: 57,
    directPrice: 42,
    savings: 15,
    badge: "Save $15",
    amenities: ["Free WiFi", "Breakfast", "Airport Shuttle"],
    neighborhood: "Sultanahmet"
  },
  {
    id: 6,
    name: "Kadıköy Harbor View",
    location: "Kadıköy, Asian Side",
    image: imgImageHotel3,
    rating: 5,
    reviews: 156,
    otaPrice: 57,
    directPrice: 45,
    savings: 12,
    badge: "Save $12",
    amenities: ["Nice View", "Free WiFi", "Restaurant"],
    neighborhood: "Kadıköy"
  },
  {
    id: 7,
    name: "Kadıköy Harbor View",
    location: "Kadıköy, Asian Side",
    image: imgImageHotel3,
    rating: 5,
    reviews: 156,
    otaPrice: 57,
    directPrice: 45,
    savings: 12,
    badge: "Save $12",
    amenities: ["Nice View", "Free WiFi", "Restaurant"],
    neighborhood: "Kadıköy"
  }
];

export function ListingPageNew() {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [searchTerm, setSearchTerm] = useState("Istanbul, Turkey");
  const [showFilters, setShowFilters] = useState(true);

  // Filter hotels
  const filteredHotels = mockHotels.filter((hotel) => {
    const matchesPrice = hotel.directPrice >= priceRange[0] && hotel.directPrice <= priceRange[1];
    const matchesStars = selectedStars.length === 0 || selectedStars.includes(hotel.rating);
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => hotel.amenities.some(a => a.includes(amenity)));
    const matchesNeighborhood = selectedNeighborhoods.length === 0 || 
      selectedNeighborhoods.includes(hotel.neighborhood);

    return matchesPrice && matchesStars && matchesAmenities && matchesNeighborhood;
  });

  // Sort hotels
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.directPrice - b.directPrice;
      case "price-high":
        return b.directPrice - a.directPrice;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const toggleStar = (star: number) => {
    setSelectedStars(prev => 
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleNeighborhood = (neighborhood: string) => {
    setSelectedNeighborhoods(prev =>
      prev.includes(neighborhood) ? prev.filter(n => n !== neighborhood) : [...prev, neighborhood]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 200]);
    setSelectedStars([]);
    setSelectedAmenities([]);
    setSelectedNeighborhoods([]);
  };

  const hasActiveFilters = selectedStars.length > 0 || selectedAmenities.length > 0 || 
    selectedNeighborhoods.length > 0 || priceRange[0] > 0 || priceRange[1] < 200;

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      <main className="max-w-[1840px] mx-auto px-10 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-['Poppins:Bold',sans-serif] text-[40px] leading-[48px] text-[#3b3b3b] mb-2">
                Hotels in Istanbul
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#8c8c8c]">
                {filteredHotels.length} properties found
              </p>
            </div>

            {/* Search Bar - Top Right */}
            <div className="w-[400px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Istanbul, Turkey"
                  className="w-full pl-12 pr-4 py-3 border border-[#eaeaea] rounded-lg font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-[280px] flex-shrink-0 space-y-6">
            {/* Price Range Filter */}
            <div className="bg-white rounded-xl p-6 border border-[#eaeaea]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Bold',sans-serif] text-[13px] text-[#3b3b3b] uppercase tracking-wide">
                  Price Range
                </h3>
                <ChevronUp className="w-4 h-4 text-[#8c8c8c]" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[14px]">$</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full pl-6 pr-3 py-2 bg-[#fafafa] border border-[#e5e7eb] rounded-lg text-[14px] text-[#3b3b3b] focus:outline-none focus:border-[#1abc9c] focus:bg-white focus:ring-2 focus:ring-[#1abc9c]/10 font-['Inter:Medium',sans-serif] transition-all"
                    />
                  </div>
                </div>
                <span className="text-[#8c8c8c] text-[14px]">-</span>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[14px]">$</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full pl-6 pr-3 py-2 bg-[#fafafa] border border-[#e5e7eb] rounded-lg text-[14px] text-[#3b3b3b] focus:outline-none focus:border-[#1abc9c] focus:bg-white focus:ring-2 focus:ring-[#1abc9c]/10 font-['Inter:Medium',sans-serif] transition-all"
                    />
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#1abc9c] h-2 cursor-pointer"
              />
            </div>

            {/* Star Rating Filter */}
            <div className="bg-white rounded-xl p-6 border border-[#eaeaea]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Bold',sans-serif] text-[13px] text-[#3b3b3b] uppercase tracking-wide">
                  Star Rating
                </h3>
                <ChevronUp className="w-4 h-4 text-[#8c8c8c]" />
              </div>

              <div className="space-y-3">
                {[5, 4, 3].map((star) => (
                  <label key={star} className="flex items-center gap-3 cursor-pointer group hover:bg-[#fafafa] p-2 -ml-2 rounded-lg transition-all">
                    <input
                      type="checkbox"
                      checked={selectedStars.includes(star)}
                      onChange={() => toggleStar(star)}
                      className="w-5 h-5 accent-[#1abc9c] cursor-pointer rounded border-2 border-[#1abc9c]/30 bg-white checked:bg-[#1abc9c] checked:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    />
                    <div className="flex items-center gap-1">
                      {[...Array(star)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#FFA500] text-[#FFA500]" />
                      ))}
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b] group-hover:text-[#1abc9c] transition-colors">
                      {star} Stars
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="bg-white rounded-xl p-6 border border-[#eaeaea]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Bold',sans-serif] text-[13px] text-[#3b3b3b] uppercase tracking-wide">
                  Amenities
                </h3>
                <ChevronUp className="w-4 h-4 text-[#8c8c8c]" />
              </div>

              <div className="space-y-3">
                {[
                  { value: "WiFi", label: "Free WiFi" },
                  { value: "Breakfast", label: "Breakfast" },
                  { value: "Airport", label: "Airport Shuttle" },
                  { value: "AC", label: "AC" },
                  { value: "Restaurant", label: "Restaurant" },
                  { value: "Sea View", label: "Sea View" }
                ].map((amenity) => (
                  <label key={amenity.value} className="flex items-center gap-3 cursor-pointer group hover:bg-[#fafafa] p-2 -ml-2 rounded-lg transition-all">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.value)}
                      onChange={() => toggleAmenity(amenity.value)}
                      className="w-5 h-5 accent-[#1abc9c] cursor-pointer rounded border-2 border-[#1abc9c]/30 bg-white checked:bg-[#1abc9c] checked:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    />
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b] group-hover:text-[#1abc9c] transition-colors">
                      {amenity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Neighborhoods Filter */}
            <div className="bg-white rounded-xl p-6 border border-[#eaeaea]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Inter:Bold',sans-serif] text-[13px] text-[#3b3b3b] uppercase tracking-wide">
                  Neighborhoods
                </h3>
                <ChevronUp className="w-4 h-4 text-[#8c8c8c]" />
              </div>

              <div className="space-y-3">
                {["Sultanahmet", "Taksim", "Beyoğlu", "Kadıköy", "Beşiktaş", "Fatih"].map((neighborhood) => (
                  <label key={neighborhood} className="flex items-center gap-3 cursor-pointer group hover:bg-[#fafafa] p-2 -ml-2 rounded-lg transition-all">
                    <input
                      type="checkbox"
                      checked={selectedNeighborhoods.includes(neighborhood)}
                      onChange={() => toggleNeighborhood(neighborhood)}
                      className="w-5 h-5 accent-[#1abc9c] cursor-pointer rounded border-2 border-[#1abc9c]/30 bg-white checked:bg-[#1abc9c] checked:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    />
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b] group-hover:text-[#1abc9c] transition-colors">
                      {neighborhood}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear All Filters Button */}
            <button
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="w-full py-3 border-2 border-[#1abc9c] text-[#1abc9c] rounded-xl hover:bg-[#1abc9c] hover:text-white transition-all font-['Inter:SemiBold',sans-serif] text-[15px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#1abc9c]"
            >
              Clear All Filters
            </button>
          </aside>

          {/* Hotel Listings */}
          <div className="flex-1">
            {/* Hotel Cards Grid - 3 Columns */}
            {sortedHotels.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-[#eaeaea]">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-[#f3f4f6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-[#8c8c8c]" />
                  </div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] text-[#3b3b3b] mb-2">
                    No hotels found
                  </h3>
                  <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#6b7280] mb-6">
                    No hotels match your current filters. Try adjusting your search criteria.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-[#1abc9c] text-white px-6 py-3 rounded-xl hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px]"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {sortedHotels.map((hotel, index) => (
                  <HotelCard key={`${hotel.id}-${index}`} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Hotel Card Component
function HotelCard({ hotel }: { hotel: Hotel }) {
  const fullStars = Math.floor(hotel.rating);
  const savingsPercent = Math.round((hotel.savings / hotel.otaPrice) * 100);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#eaeaea] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img 
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Save Badge - Top Right */}
        {hotel.badge && (
          <div className="absolute top-3 right-3 bg-[#10b981] text-white px-3 py-1.5 rounded-lg shadow-lg font-['Inter:Bold',sans-serif] text-[12px] flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            {hotel.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Hotel Name */}
        <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] leading-[24px] text-[#3b3b3b] mb-2 group-hover:text-[#1abc9c] transition-colors">
          {hotel.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-[#8c8c8c] flex-shrink-0" />
          <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
            {hotel.location}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < fullStars 
                    ? 'fill-[#FFA500] text-[#FFA500]' 
                    : 'fill-[#e5e7eb] text-[#e5e7eb]'
                }`}
              />
            ))}
          </div>
          <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c]">
            ({hotel.reviews})
          </span>
        </div>

        {/* Amenities Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {hotel.amenities.map((amenity, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-[#f9fafb] border border-[#eaeaea] text-[#6b7280] rounded-md text-[11px] font-['Inter:Medium',sans-serif] hover:border-[#1abc9c] hover:text-[#1abc9c] transition-colors"
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="px-2.5 py-1 bg-[#f9fafb] border border-[#eaeaea] text-[#6b7280] rounded-md text-[11px] font-['Inter:Medium',sans-serif]">
              +{hotel.amenities.length - 3}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#eaeaea] mb-4" />

        {/* Pricing Row */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] line-through">
                ${hotel.otaPrice}
              </span>
              <span className="font-['Inter:Bold',sans-serif] text-[12px] text-[#10b981]">
                -{savingsPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-['Poppins:Bold',sans-serif] text-[32px] leading-[32px] text-[#3b3b3b]">
                ${hotel.directPrice}
              </span>
              <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                /night
              </span>
            </div>
          </div>
        </div>

        {/* View Rooms Button */}
        <Link
          to={`/hotel/${hotel.id}`}
          className="block w-full bg-[#1abc9c] text-white py-3 rounded-lg hover:bg-[#16a085] transition-all font-['Inter:SemiBold',sans-serif] text-[15px] text-center group/btn relative overflow-hidden"
        >
          <span className="relative z-10">View Rooms</span>
          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </Link>
      </div>
    </div>
  );
}

export default ListingPageNew;