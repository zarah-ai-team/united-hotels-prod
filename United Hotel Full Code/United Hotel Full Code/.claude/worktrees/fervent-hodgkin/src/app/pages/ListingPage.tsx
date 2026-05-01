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

  const FilterPanel = () => (
    <div className="bg-white rounded-[16px] border border-[#e5e7eb] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Price Range Section */}
      <div className="border-b border-[#e5e7eb]">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-[20px] hover:bg-[#fafafa] transition-colors"
        >
          <h3 className="font-['Poppins'] font-semibold text-[15px] text-[#3b3b3b] uppercase tracking-wide">
            Price Range
          </h3>
          <ChevronDown 
            className={`w-[20px] h-[20px] text-[#6b7280] transition-transform duration-300 ${expandedSections.price ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.price ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-[20px] pb-[24px] space-y-[16px]">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="200"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-[6px] bg-[#eaeaea] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1ABC9C] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(26,188,156,0.3)] [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1ABC9C] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(26,188,156,0.3)]"
                style={{
                  background: `linear-gradient(to right, #1ABC9C 0%, #1ABC9C ${(priceRange[1] / 200) * 100}%, #eaeaea ${(priceRange[1] / 200) * 100}%, #eaeaea 100%)`
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="bg-[#fafafa] px-[12px] py-[6px] rounded-[8px] border border-[#e5e7eb]">
                <span className="font-['Inter'] text-[14px] text-[#6b7280] font-medium">
                  $0
                </span>
              </div>
              <div className="bg-[#f0fdf4] px-[12px] py-[6px] rounded-[8px] border border-[#1ABC9C]/20">
                <span className="font-['Inter'] text-[14px] text-[#1ABC9C] font-semibold">
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
          className="w-full flex items-center justify-between p-[20px] hover:bg-[#fafafa] transition-colors"
        >
          <h3 className="font-['Poppins'] font-semibold text-[15px] text-[#3b3b3b] uppercase tracking-wide">
            Star Rating
          </h3>
          <ChevronDown 
            className={`w-[20px] h-[20px] text-[#6b7280] transition-transform duration-300 ${expandedSections.rating ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.rating ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-[20px] pb-[24px] space-y-[12px]">
            {[5, 4, 3].map((rating) => (
              <label 
                key={rating} 
                className="flex items-center gap-[12px] cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedRating.includes(rating)}
                    onChange={() => toggleRating(rating)}
                    className="peer sr-only"
                  />
                  <div className="w-[20px] h-[20px] rounded-[6px] border-2 border-[#e5e7eb] peer-checked:border-[#1ABC9C] peer-checked:bg-[#1ABC9C] transition-all duration-200 flex items-center justify-center group-hover:border-[#1ABC9C]/50">
                    <svg 
                      className="w-[12px] h-[12px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="font-['Inter'] text-[15px] text-[#3b3b3b] group-hover:text-[#1ABC9C] transition-colors">
                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                </span>
                <div className="flex items-center ml-auto">
                  {[...Array(rating)].map((_, i) => (
                    <svg key={i} className="w-[14px] h-[14px] text-[#FFA500] fill-current" viewBox="0 0 24 24">
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
          className="w-full flex items-center justify-between p-[20px] hover:bg-[#fafafa] transition-colors"
        >
          <div className="flex items-center gap-[8px]">
            <h3 className="font-['Poppins'] font-semibold text-[15px] text-[#3b3b3b] uppercase tracking-wide">
              Amenities
            </h3>
            {selectedAmenities.length > 0 && (
              <span className="bg-[#1ABC9C] text-white text-[11px] font-semibold px-[6px] py-[2px] rounded-full min-w-[20px] text-center">
                {selectedAmenities.length}
              </span>
            )}
          </div>
          <ChevronDown 
            className={`w-[20px] h-[20px] text-[#6b7280] transition-transform duration-300 ${expandedSections.amenities ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.amenities ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-[20px] pb-[24px]">
            <div className="flex flex-wrap gap-[8px]">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`
                    px-[14px] py-[8px] rounded-[8px] border-2 transition-all font-['Inter'] text-[14px] font-medium
                    ${selectedAmenities.includes(amenity) 
                      ? 'bg-[#1ABC9C] border-[#1ABC9C] text-white' 
                      : 'bg-white border-[#e5e7eb] text-[#3b3b3b] hover:border-[#1ABC9C] hover:text-[#1ABC9C]'
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
          className="w-full flex items-center justify-between p-[20px] hover:bg-[#fafafa] transition-colors"
        >
          <h3 className="font-['Poppins'] font-semibold text-[15px] text-[#3b3b3b] uppercase tracking-wide">
            Neighborhoods
          </h3>
          <ChevronDown 
            className={`w-[20px] h-[20px] text-[#6b7280] transition-transform duration-300 ${expandedSections.neighborhoods ? 'rotate-180' : ''}`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${expandedSections.neighborhoods ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-[20px] pb-[24px]">
            <div className="flex flex-wrap gap-[8px]">
              {neighborhoodsList.map((neighborhood) => (
                <button
                  key={neighborhood}
                  className="px-[14px] py-[8px] rounded-[8px] border-2 border-[#e5e7eb] bg-white text-[#3b3b3b] hover:border-[#1ABC9C] hover:text-[#1ABC9C] transition-all font-['Inter'] text-[14px] font-medium"
                >
                  {neighborhood}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Count & Clear All */}
      <div className="p-[20px]">
        {(selectedRating.length > 0 || selectedAmenities.length > 0 || priceRange[1] < 200) && (
          <div className="bg-[#f0fdf4] border border-[#1ABC9C]/20 rounded-[10px] p-[12px] mb-[16px]">
            <p className="font-['Inter'] text-[13px] text-[#1ABC9C] text-center font-medium">
              {selectedRating.length + selectedAmenities.length + (priceRange[1] < 200 ? 1 : 0)} filter{selectedRating.length + selectedAmenities.length + (priceRange[1] < 200 ? 1 : 0) !== 1 ? 's' : ''} active
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
          className="border-[#e5e7eb] hover:border-[#1ABC9C] hover:bg-[#f0fdf4] transition-all"
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
        <div className="max-w-[1400px] mx-auto px-[16px] md:px-[32px]">
          <div className="flex items-center justify-between h-[64px]">
            <a href="/" className="font-['Poppins'] font-bold text-[20px] text-[#1ABC9C]">
              United Hotels
            </a>
            
            <nav className="hidden md:flex items-center gap-[32px]">
              <a href="/#hotels" className="font-['Inter'] text-[14px] text-[#3b3b3b] hover:text-[#1ABC9C]">
                Hotels
              </a>
              <a href="/#neighborhoods" className="font-['Inter'] text-[14px] text-[#3b3b3b] hover:text-[#1ABC9C]">
                Neighborhoods
              </a>
              <a href="/portal" className="font-['Inter'] text-[14px] text-[#3b3b3b] hover:text-[#1ABC9C]">
                My Bookings
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.1)] sticky top-[64px] z-40">
        <div className="max-w-[1400px] mx-auto px-[16px] md:px-[32px] py-[16px]">
          <div className="flex items-center gap-[12px]">
            <div className="relative flex-1">
              <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8c8c8c]" />
              <input
                type="text"
                placeholder="Istanbul, Turkey"
                className="w-full pl-[40px] pr-[16px] py-[12px] border border-[#eaeaea] rounded-[8px] font-['Inter'] text-[16px]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-white border border-[#eaeaea] px-[16px] py-[12px] rounded-[8px] min-h-[44px]"
            >
              <SlidersHorizontal className="w-[20px] h-[20px] text-[#3b3b3b]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-[16px] md:px-[32px] py-[32px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-[8px] mb-[24px] text-[14px]">
          <a href="/" className="font-['Inter'] text-[#8c8c8c] hover:text-[#1ABC9C] transition-colors">
            Home
          </a>
          <span className="text-[#d1d5db]">/</span>
          <a href="/#hotels" className="font-['Inter'] text-[#8c8c8c] hover:text-[#1ABC9C] transition-colors">
            Hotels
          </a>
          <span className="text-[#d1d5db]">/</span>
          <span className="font-['Inter'] text-[#3b3b3b] font-medium">
            Istanbul
          </span>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-[32px]">
          {/* Results - Left Side (8 columns) */}
          <div className="md:col-span-8">
            {/* Header with Title and Sort */}
            <div className="mb-[24px]">
              <div className="flex items-start justify-between mb-[16px]">
                <div>
                  <h1 className="font-['Poppins'] font-bold text-[32px] text-[#3b3b3b] mb-[8px]">
                    Budget Hotels in Istanbul
                  </h1>
                  <p className="font-['Inter'] text-[15px] text-[#8c8c8c]">
                    {hotels.length} properties available • Direct booking rates
                  </p>
                </div>
              </div>

              {/* Active Filters Chips */}
              {(selectedRating.length > 0 || selectedAmenities.length > 0 || priceRange[1] < 200) && (
                <div className="flex flex-wrap items-center gap-[8px] mb-[16px] pb-[16px] border-b border-[#e5e7eb]">
                  <span className="font-['Inter'] text-[13px] text-[#6b7280] font-medium">
                    Active filters:
                  </span>
                  
                  {priceRange[1] < 200 && (
                    <button
                      onClick={() => setPriceRange([0, 200])}
                      className="flex items-center gap-[6px] bg-[#f0fdf4] border border-[#1ABC9C]/30 text-[#1ABC9C] px-[10px] py-[4px] rounded-[6px] font-['Inter'] text-[13px] font-medium hover:bg-[#1ABC9C] hover:text-white transition-all"
                    >
                      Up to ${priceRange[1]}
                      <X className="w-[14px] h-[14px]" />
                    </button>
                  )}
                  
                  {selectedRating.map(rating => (
                    <button
                      key={rating}
                      onClick={() => toggleRating(rating)}
                      className="flex items-center gap-[6px] bg-[#f0fdf4] border border-[#1ABC9C]/30 text-[#1ABC9C] px-[10px] py-[4px] rounded-[6px] font-['Inter'] text-[13px] font-medium hover:bg-[#1ABC9C] hover:text-white transition-all"
                    >
                      {rating} Stars
                      <X className="w-[14px] h-[14px]" />
                    </button>
                  ))}

                  {selectedAmenities.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className="flex items-center gap-[6px] bg-[#f0fdf4] border border-[#1ABC9C]/30 text-[#1ABC9C] px-[10px] py-[4px] rounded-[6px] font-['Inter'] text-[13px] font-medium hover:bg-[#1ABC9C] hover:text-white transition-all"
                    >
                      {amenity}
                      <X className="w-[14px] h-[14px]" />
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setPriceRange([0, 200]);
                      setSelectedRating([]);
                      setSelectedAmenities([]);
                    }}
                    className="font-['Inter'] text-[13px] text-[#8c8c8c] hover:text-[#EF4444] underline transition-colors ml-[4px]"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="flex items-center justify-between">
                <p className="font-['Inter'] text-[14px] text-[#6b7280]">
                  Showing <span className="font-semibold text-[#3b3b3b]">{hotels.length}</span> results
                </p>
                <div className="relative">
                  <ArrowUpDown className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6b7280]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-[36px] pr-[36px] py-[10px] border border-[#e5e7eb] rounded-[10px] font-['Inter'] text-[14px] bg-white hover:border-[#1ABC9C] transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236b7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Best Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid Layout for Vertical Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
              {hotels.map((hotel) => (
                <ListingHotelCard
                  key={hotel.id}
                  {...hotel}
                />
              ))}
            </div>

            {/* Load More / Pagination Hint */}
            <div className="mt-[40px] text-center">
              <div className="inline-flex items-center gap-[12px] bg-white border border-[#e5e7eb] px-[24px] py-[16px] rounded-[12px] shadow-sm">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[6px] h-[6px] bg-[#1ABC9C] rounded-full"></div>
                  <p className="font-['Inter'] text-[14px] text-[#6b7280]">
                    You've viewed all <span className="font-semibold text-[#3b3b3b]">{hotels.length}</span> hotels
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Filters - Right Side (4 columns) */}
          <aside className="hidden md:block md:col-span-4">
            <div className="sticky top-[144px]">
              <FilterPanel />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] p-[24px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-[24px]">
              <h2 className="font-['Poppins'] font-bold text-[20px] text-[#3b3b3b]">
                Filters
              </h2>
              <button onClick={() => setShowFilters(false)} className="p-[8px]">
                <X className="w-[24px] h-[24px] text-[#3b3b3b]" />
              </button>
            </div>
            <FilterPanel />
            <div className="mt-[24px]">
              <Button variant="primary" fullWidth onClick={() => setShowFilters(false)}>
                Show {hotels.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}