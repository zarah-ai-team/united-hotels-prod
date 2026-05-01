/**
 * IMPLEMENTATION EXAMPLE: How to Integrate API into ListingPageNew
 * 
 * This file demonstrates the pattern to follow when integrating pages with the API services.
 * Copy this pattern and adapt it for other pages in your application.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader, AlertCircle } from "lucide-react";
import { hotelService, pricingService } from "../services/api";
import { ApiError } from "../services/api";
import { toast } from "sonner";

// Example component structure
export function ListingPageNewExample() {
  const navigate = useNavigate();

  // State management
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 2,
    location: ""
  });

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Handle search/filter
  useEffect(() => {
    if (filters.checkInDate && filters.checkOutDate) {
      searchAvailability();
    }
  }, [filters]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hotelService.getAll();
      setHotels(data);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load hotels";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching hotels:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchAvailability = async () => {
    try {
      // Get availability from pricing API
      const availability = await pricingService.getAllAvailability({
        checkInDate: filters.checkInDate,
        checkOutDate: filters.checkOutDate,
        guests: filters.guests
      });

      // Filter hotels based on availability
      if (availability) {
        // Process availability data and filter hotels
        console.log("Availability data:", availability);
        // Implement your filtering logic here
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to check availability";
      toast.error(errorMessage);
      console.error("Error checking availability:", err);
    }
  };

  const handleHotelSelect = (hotelId: string) => {
    // Save to context if needed and navigate
    navigate(`/hotel/${hotelId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1abc9c]" />
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={fetchHotels}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search/Filter Section */}
      <div className="bg-white border-b p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Search Hotels</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <input
                type="date"
                value={filters.checkInDate}
                onChange={(e) => setFilters({ ...filters, checkInDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc9c]"
              />
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <input
                type="date"
                value={filters.checkOutDate}
                onChange={(e) => setFilters({ ...filters, checkOutDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc9c]"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <select
                value={filters.guests}
                onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc9c]"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="City or hotel name"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc9c]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto p-6">
        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hotels found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => handleHotelSelect(hotel.id)}
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-pointer"
              >
                {/* Hotel Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                {/* Hotel Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{hotel.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{hotel.location}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < Math.floor(hotel.rating || 4) ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({hotel.reviewCount || 0} reviews)
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-[#1abc9c] text-white py-2 rounded-lg hover:bg-[#16a085] transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingPageNewExample;

/**
 * KEY PATTERNS TO FOLLOW:
 * 
 * 1. STATE MANAGEMENT
 *    - Use useState for data, loading, and errors
 *    - Separate state for filters/search criteria
 * 
 * 2. FETCHING DATA
 *    - Use useEffect with empty dependency array for initial load
 *    - Wrap API calls in try/catch blocks
 *    - Always set loading state before and after API call
 *    - Always handle errors with user-friendly messages
 * 
 * 3. ERROR HANDLING
 *    - Catch all errors and display to user
 *    - Use toast notifications for quick feedback
 *    - Show error state UI with retry button
 * 
 * 4. LOADING STATES
 *    - Show loading spinner while fetching
 *    - Disable interactive elements during loading
 *    - Clear loading state in finally block
 * 
 * 5. USER FEEDBACK
 *    - Use toast.error() for errors
 *    - Use toast.success() for successful operations
 *    - Provide clear messages
 * 
 * 6. NAVIGATION
 *    - Use useNavigate hook for routing
 *    - Pass data via route params or state
 * 
 * 7. FILTERING/SEARCH
 *    - Use separate state for filter values
 *    - Use useEffect to trigger search when filters change
 *    - Debounce search if needed to reduce API calls
 * 
 * APPLY THIS PATTERN TO:
 * - HotelDetailPageNew (load hotel details)
 * - BookingStep1 (search hotels)
 * - BookingStep2 (load rooms)
 * - BookingStep3 (submit booking)
 * - ConfirmationPageNew (fetch confirmation)
 * - GuestPortal (load user bookings)
 */
