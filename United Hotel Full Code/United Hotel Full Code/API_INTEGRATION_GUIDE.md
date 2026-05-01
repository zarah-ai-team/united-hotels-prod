# API Integration Guide

## Overview

This document provides a comprehensive guide to the integrated API services in the United Hotels application. The API integration is based on the Postman collection included in the project.

## Project Structure

```
src/app/
├── config/
│   └── api.ts              # API configuration, endpoints, and headers
├── services/
│   └── api.ts              # Main API service with all endpoints
├── hooks/
│   └── useApi.ts           # Custom hooks for API calls
├── context/
│   └── BookingContext.tsx  # Booking state management
└── pages/
    ├── AuthPage.tsx        # Authentication (integrated)
    └── [other pages]       # To be integrated
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following:

```env
VITE_API_URL=http://localhost:5000
```

For production:
```env
VITE_API_URL=https://api.unitedhotels.com
```

## API Endpoints

All endpoints are defined in `src/app/config/api.ts` with the following base endpoints:

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create hotel (admin)
- `PUT /api/hotels/:id` - Update hotel (admin)
- `DELETE /api/hotels/:id` - Delete hotel (admin)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (admin)
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Itineraries
- `GET /api/itineraries` - Get all itineraries
- `GET /api/itineraries/:id` - Get itinerary by ID
- `POST /api/itineraries` - Create itinerary (admin)
- `PUT /api/itineraries/:id` - Update itinerary (admin)
- `DELETE /api/itineraries/:id` - Delete itinerary (admin)

### Room Itineraries
- `GET /api/room-itineraries/itinerary/:id` - Get rooms in itinerary
- `POST /api/room-itineraries` - Add room to itinerary (admin)
- `PUT /api/room-itineraries/:id` - Update room itinerary (admin)
- `DELETE /api/room-itineraries/:id` - Delete room itinerary (admin)

### Pricing
- `POST /api/pricing/recommend` - Get recommended price
- `POST /api/pricing/availability` - Get specific hotel availability
- `POST /api/pricing/all-availability` - Get all hotels availability

### Bookings
- `GET /api/bookings/getallbookings` - Get all bookings
- `POST /api/bookings/bookroom` - Book a room

## Usage Examples

### 1. Authentication Service

```typescript
import { authService } from '@/app/services/api';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});
// Token is automatically stored in localStorage

// Register
await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  phoneNumber: 15551234567
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

### 2. Hotels Service

```typescript
import { hotelService } from '@/app/services/api';

// Get all hotels
const hotels = await hotelService.getAll();

// Get specific hotel
const hotel = await hotelService.getById('hotel-id');

// Create hotel (requires authentication)
const newHotel = await hotelService.create({
  name: 'Grand Hotel',
  address: '123 Main St',
  contact_name: 'Manager',
  contact_phone: '+1234567890',
  contact_email: 'manager@hotel.com',
  total_rooms: 50,
  description: 'A luxurious hotel',
  rooms: [
    {
      category: 'standard',
      count: 20,
      price_per_night: 100,
      images: ['image1.jpg'],
      max_count: 2
    }
  ]
});
```

### 3. Rooms Service

```typescript
import { roomService } from '@/app/services/api';

// Get all rooms
const rooms = await roomService.getAll();

// Get specific room
const room = await roomService.getById('room-id');

// Create room (requires authentication)
const newRoom = await roomService.create({
  hotel_id: 1,
  category: 'deluxe',
  max_count: 4,
  price_per_night: 200,
  room_number: '101',
  images: ['room1.jpg']
});

// Update room
const updated = await roomService.update('room-id', {
  price_per_night: 250
});

// Delete room
await roomService.delete('room-id');
```

### 4. Pricing Service

```typescript
import { pricingService } from '@/app/services/api';

// Get recommended price
const recommendation = await pricingService.getRecommendedPrice({
  hotelName: 'Luxury Hotel Downtown',
  minBound: 100,
  maxBound: 300
});

// Get specific hotel availability
const availability = await pricingService.getAvailability({
  hotelName: 'Luxury Hotel Downtown',
  checkInDate: '2026-05-10',
  checkOutDate: '2026-05-12',
  guests: 2
});

// Get all hotels availability
const allAvailability = await pricingService.getAllAvailability({
  checkInDate: '2026-05-10',
  checkOutDate: '2026-05-12',
  guests: 2
});
```

### 5. Bookings Service

```typescript
import { bookingService } from '@/app/services/api';

// Get all bookings
const bookings = await bookingService.getAll();

// Book a room
const booking = await bookingService.bookRoom({
  room: {
    name: 'Deluxe Room',
    id: 1
  },
  userid: 1,
  fromdate: '2026-05-10',
  todate: '2026-05-12',
  totalamount: 400,
  totaldays: 2
});
```

## Custom Hooks

### useAuth Hook

```typescript
import { useAuth } from '@/app/hooks/useApi';

function MyComponent() {
  const { 
    user,
    token,
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated 
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login.mutate({
        email: 'user@example.com',
        password: 'password'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### useHotels Hook

```typescript
import { useHotels } from '@/app/hooks/useApi';

function HotelsComponent() {
  const { hotels, getHotel } = useHotels();

  // hotels.data contains the hotels list
  // hotels.loading shows loading state
  // hotels.error contains error if any

  const fetchSpecificHotel = async (id: string) => {
    try {
      const hotel = await getHotel(id);
      console.log('Hotel:', hotel);
    } catch (error) {
      console.error('Failed to fetch hotel:', error);
    }
  };

  return (
    <div>
      {hotels.loading && <p>Loading...</p>}
      {hotels.error && <p>Error: {hotels.error.message}</p>}
      {hotels.data && hotels.data.map(hotel => (
        <div key={hotel.id}>{hotel.name}</div>
      ))}
    </div>
  );
}
```

### useBookings Hook

```typescript
import { useBookings } from '@/app/hooks/useApi';

function BookingsComponent() {
  const { bookings, bookRoom } = useBookings();

  const handleBooking = async () => {
    try {
      const result = await bookRoom.mutate({
        room: { name: 'Deluxe', id: 1 },
        userid: 1,
        fromdate: '2026-05-10',
        todate: '2026-05-12',
        totalamount: 400,
        totaldays: 2
      });
      console.log('Booking successful:', result);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <button onClick={handleBooking} disabled={bookRoom.loading}>
      {bookRoom.loading ? 'Booking...' : 'Book Room'}
    </button>
  );
}
```

## Error Handling

The API service includes built-in error handling. All errors are thrown as `ApiError` objects:

```typescript
interface ApiError {
  message: string;
  status?: number;
  data?: any;
}
```

Example error handling:

```typescript
try {
  await authService.login(credentials);
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid credentials');
  } else if (error.status === 500) {
    console.error('Server error');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Authentication Token Management

Tokens are automatically stored in `localStorage` under the key `uh_auth_token`. The token is included in all authenticated requests:

- Stored after successful login: `authService.login()`
- Removed on logout: `authService.logout()`
- Automatically included in requests to protected endpoints

## Pages to Integrate

The following pages need API integration:

1. **ListingPageNew** - Load hotels from API
2. **HotelDetailPageNew** - Load hotel details and availability
3. **BookingStep1** - Search and filter hotels by availability
4. **BookingStep2** - Load rooms and calculate pricing
5. **BookingStep3** - Submit booking to API
6. **ConfirmationPageNew** - Get booking details from API
7. **GuestPortal** - Load user bookings
8. **AdminPages** - Load and manage hotels, rooms, bookings

## Best Practices

1. **Always handle loading states** - Show loading spinners while fetching data
2. **Always handle errors** - Display meaningful error messages to users
3. **Use TypeScript** - Take advantage of the provided type definitions
4. **Store tokens securely** - Never expose tokens in the UI
5. **Validate form data** - Validate before sending to API
6. **Cache responses** - Consider caching hotel data to reduce API calls
7. **Use debouncing** - For search/filter operations to reduce API calls
8. **Test with Postman** - Use the included Postman collection for testing

## Testing with Postman

The project includes a Postman collection (`postman_collection.json`) with pre-configured requests for all endpoints. 

Steps to use:
1. Open Postman
2. Import the `postman_collection.json` file
3. Set the `base_url` variable to your API server URL
4. For authenticated requests, first run the "Login" request to get the token
5. The token is automatically saved to the `token` variable for subsequent requests

## Next Steps

1. Install dependencies: `npm install`
2. Create `.env` file with API configuration
3. Start the development server: `npm run dev`
4. Implement API integration in remaining pages following the examples above
5. Test all endpoints with Postman collection
6. Deploy to production with appropriate API URL

## Support

For API documentation details, refer to the Postman collection included in the project. For implementation questions, check the type definitions in `src/app/services/api.ts`.
