import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, MapPin, Calendar, Users, ArrowUpDown } from 'lucide-react';
import { ListingHotelCard } from '../components/ListingHotelCard';
import { Button } from '../components/ui/Button';
import { hotels } from '../data/mockData';

export function ListingPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedRating, setSelectedRating] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  
  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    price: true,
    rating: true,
    amenities: true,
    neighborhoods: false
  });

  const amenitiesList = ['Free WiFi', 'Breakfast', 'Airport Shuttle', 'AC', 'Restaurant', 'Sea View'];
  const neighborhoodsList = ['Sultanahmet', 'Taksim', 'Beyoğlu', 'Kadıköy', 'Beşiktaş', 'Fatih'];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRating(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFilterCount = selectedRating.length + selectedAmenities.length + (priceRange[1] < 200 ? 1 : 0);

  const FilterPanel = () => (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm">
      {/* Price Range Section */}
      <div className="border-b border-[#e5e7eb]">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#fafafa] transition-colors"
        >
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] uppercase tracking-wide">
            Price Range
          </h3>
          <ChevronDown 
            className={`w-5 h-5 text-[#6b7280] transition-transform duration-300 ${expandedSections.price ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.price ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 md:px-5 pb-6 space-y-4">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="200"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-1.5 bg-[#eaeaea] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1abc9c] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1abc9c] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
                style={{
                  background: `linear-gradient(to right, #1abc9c 0%, #1abc9c ${(priceRange[1] / 200) * 100}%, #eaeaea ${(priceRange[1] / 200) * 100}%, #eaeaea 100%)`
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="bg-[#fafafa] px-3 py-1.5 rounded-lg border border-[#e5e7eb]">
                <span className="font-['Inter:Medium',sans-serif] text-[13px] md:text-[14px] text-[#6b7280]">
                  $0
                </span>
              </div>
              <div className="bg-[#f0fdf4] px-3 py-1.5 rounded-lg border border-[#1abc9c]/20">
                <span className="font-['Inter:SemiBold',sans-serif] text-[13px] md:text-[14px] text-[#1abc9c]">
                  ${priceRange[1]}+
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Star Rating Section */}
      <div className="border-b border-[#e5e7eb]">
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#fafafa] transition-colors"
        >
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] uppercase tracking-wide">
            Star Rating
          </h3>
          <ChevronDown 
            className={`w-5 h-5 text-[#6b7280] transition-transform duration-300 ${expandedSections.rating ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.rating ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 md:px-5 pb-6 space-y-3">
            {[5, 4, 3].map((rating) => (
              <label 
                key={rating} 
                className="flex items-center gap-3 cursor-pointer group min-h-[44px]"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedRating.includes(rating)}
                    onChange={() => toggleRating(rating)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-[#e5e7eb] peer-checked:border-[#1abc9c] peer-checked:bg-[#1abc9c] transition-all duration-200 flex items-center justify-center group-hover:border-[#1abc9c]/50">
                    <svg 
                      className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] group-hover:text-[#1abc9c] transition-colors">
                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                </span>
                <div className="flex items-center ml-auto gap-0.5">
                  {[...Array(rating)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-[#FFA500] fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="border-b border-[#e5e7eb]">
        <button
          onClick={() => toggleSection('amenities')}
          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#fafafa] transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-['Poppins:SemiBold',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] uppercase tracking-wide">
              Amenities
            </h3>
            {selectedAmenities.length > 0 && (
              <span className="bg-[#1abc9c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {selectedAmenities.length}
              </span>
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-[#6b7280] transition-transform duration-300 ${expandedSections.amenities ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.amenities ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 md:px-5 pb-6">
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`
                    px-3 py-2 rounded-lg border-2 transition-all font-['Inter:Medium',sans-serif] text-[13px] md:text-[14px] min-h-[44px] md:min-h-0
                    ${selectedAmenities.includes(amenity) 
                      ? 'bg-[#1abc9c] border-[#1abc9c] text-white shadow-sm' 
                      : 'bg-white border-[#e5e7eb] text-[#3b3b3b] hover:border-[#1abc9c] hover:text-[#1abc9c]'
                    }
                  `}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Neighborhoods Section */}
      <div className="border-b border-[#e5e7eb]">
        <button
          onClick={() => toggleSection('neighborhoods')}
          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#fafafa] transition-colors"
        >
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] uppercase tracking-wide">
            Neighborhoods
          </h3>
          <ChevronDown 
            className={`w-5 h-5 text-[#6b7280] transition-transform duration-300 ${expandedSections.neighborhoods ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.neighborhoods ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 md:px-5 pb-6">
            <div className="flex flex-wrap gap-2">
              {neighborhoodsList.map((neighborhood) => (
                <button
                  key={neighborhood}
                  className="px-3 py-2 rounded-lg border-2 border-[#e5e7eb] bg-white text-[#3b3b3b] hover:border-[#1abc9c] hover:text-[#1abc9c] transition-all font-['Inter:Medium',sans-serif] text-[13px] md:text-[14px] min-h-[44px] md:min-h-0"
                >
                  {neighborhood}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Count & Clear All */}
      <div className="p-4 md:p-5">
        {activeFilterCount > 0 && (
          <div className="bg-[#f0fdf4] border border-[#1abc9c]/20 rounded-xl p-3 mb-4">
            <p className="font-['Inter:Medium',sans-serif] text-[13px] text-[#1abc9c] text-center">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </p>
          </div>
        )}

        <Button 
          variant="outline" 
          fullWidth 
          onClick={() => {
            setPriceRange([0, 200]);
            setSelectedRating([]);
            setSelectedAmenities([]);
          }}
          className="border-[#e5e7eb] hover:border-[#1abc9c] hover:bg-[#f0fdf4] transition-all min-h-[44px]"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[56px] md:h-[64px]">
            <a href="/" className="font-['Poppins:Bold',sans-serif] text-[18px] md:text-[20px] text-[#1abc9c]">
              United Hotels
            </a>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="/#hotels" className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b] hover:text-[#1abc9c]">
                Hotels
              </a>
              <a href="/#neighborhoods" className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b] hover:text-[#1abc9c]">
                Neighborhoods
              </a>
              <a href="/portal" className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b] hover:text-[#1abc9c]">
                My Bookings
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Sticky Filter/Search Bar - Mobile Priority */}
      <div className="bg-white border-b border-[#e5e7eb] sticky top-[56px] md:top-[64px] z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8c8c]" />
              <input
                type="text"
                placeholder="Turkey"
                className="w-full pl-10 pr-3 py-2.5 md:py-3 border border-[#e5e7eb] rounded-xl font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] focus:outline-none focus:border-[#1abc9c] transition-colors"
              />
            </div>
            
            {/* Filters Button - Prominent on Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 bg-white border-2 border-[#e5e7eb] hover:border-[#1abc9c] px-4 py-2.5 md:py-3 rounded-xl transition-colors min-w-[100px] md:min-w-[120px]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#3b3b3b]" />
              <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">Filters</span>
              {activeFilterCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#1abc9c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg">
                  {activeFilterCount}
                </div>
              )}
            </button>
          </div>
          
          {/* Active Filter Chips - Mobile friendly */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              <span className="font-['Inter:Medium',sans-serif] text-[11px] text-[#6b7280] flex-shrink-0">
                Active:
              </span>
              
              {priceRange[1] < 200 && (
                <button
                  onClick={() => setPriceRange([0, 200])}
                  className="flex items-center gap-1.5 bg-[#1abc9c] text-white px-2.5 py-1 rounded-full font-['Inter:Medium',sans-serif] text-[11px] hover:bg-[#16a085] transition-colors flex-shrink-0"
                >
                  <span>Up to ${priceRange[1]}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {selectedRating.map(rating => (
                <button
                  key={rating}
                  onClick={() => toggleRating(rating)}
                  className="flex items-center gap-1.5 bg-[#1abc9c] text-white px-2.5 py-1 rounded-full font-['Inter:Medium',sans-serif] text-[11px] hover:bg-[#16a085] transition-colors flex-shrink-0"
                >
                  <span>{rating}★</span>
                  <X className="w-3 h-3" />
                </button>
              ))}

              {selectedAmenities.map(amenity => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className="flex items-center gap-1.5 bg-[#1abc9c] text-white px-2.5 py-1 rounded-full font-['Inter:Medium',sans-serif] text-[11px] hover:bg-[#16a085] transition-colors flex-shrink-0"
                >
                  <span>{amenity}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="md:grid md:grid-cols-12 md:gap-8">
          {/* Hotel Listings - PRIMARY FOCUS */}
          <div className="md:col-span-8">
            {/* Results Header - Compact on mobile */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-['Poppins:Bold',sans-serif] text-[18px] md:text-[28px] text-[#3b3b3b] mb-1">
                  Turkey Hotels
                </h1>
                <p className="font-['Inter:Regular',sans-serif] text-[12px] md:text-[14px] text-[#8c8c8c]">
                  {hotels.length} properties
                </p>
              </div>
              
              {/* Sort - Mobile dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-[#e5e7eb] rounded-lg font-['Inter:Medium',sans-serif] text-[12px] md:text-[13px] bg-white hover:border-[#1abc9c] transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236b7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_6px_center] bg-no-repeat"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                </select>
              </div>
            </div>

            {/* 2-COLUMN GRID ON MOBILE - Airbnb style */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {hotels.map((hotel) => (
                <ListingHotelCard
                  key={hotel.id}
                  {...hotel}
                />
              ))}
            </div>

            {/* Load More Indicator */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-white border border-[#e5e7eb] px-5 py-3 rounded-xl shadow-sm">
                <div className="w-1.5 h-1.5 bg-[#1abc9c] rounded-full"></div>
                <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                  All <span className="font-semibold text-[#3b3b3b]">{hotels.length}</span> properties shown
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Filters - Sidebar (Hidden on mobile) */}
          <aside className="hidden md:block md:col-span-4">
            <div className="sticky top-[96px]">
              <FilterPanel />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Filter Modal - Bottom Sheet */}
      {showFilters && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200" 
          onClick={() => setShowFilters(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#e5e7eb] px-5 py-4 flex items-center justify-between z-10">
              <h2 className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#3b3b3b]">
                Filters
              </h2>
              <button 
                onClick={() => setShowFilters(false)} 
                className="p-2 hover:bg-[#f9fafb] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#3b3b3b]" />
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-5 py-4">
              <FilterPanel />
            </div>
            
            {/* Modal Footer - Sticky */}
            <div className="sticky bottom-0 bg-white border-t border-[#e5e7eb] px-5 py-4">
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => setShowFilters(false)}
                className="min-h-[48px] font-['Inter:Bold',sans-serif] text-[15px]"
              >
                Show {hotels.length} Properties
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}