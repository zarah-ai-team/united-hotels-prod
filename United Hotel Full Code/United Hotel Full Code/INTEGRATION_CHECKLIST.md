# Quick Integration Checklist

Use this checklist when integrating API into any page component.

## Pre-Integration Setup

- [ ] Environment variable configured: `VITE_API_URL=http://localhost:5000`
- [ ] Backend API is running
- [ ] `src/app/services/api.ts` is created and imported
- [ ] `src/app/hooks/useApi.ts` is created (optional, for custom hooks)

## For Each Page to Integrate

### 1. Imports
```typescript
- [ ] Import required service: import { hotelService, bookingService, etc } from '../services/api'
- [ ] Import components: import { Loader, AlertCircle } from 'lucide-react'
- [ ] Import toast: import { toast } from 'sonner'
```

### 2. State Management
```typescript
- [ ] Add useState for data: const [data, setData] = useState([])
- [ ] Add useState for loading: const [loading, setLoading] = useState(false)
- [ ] Add useState for errors: const [error, setError] = useState(null)
- [ ] Add useState for filters if needed
```

### 3. Data Fetching
```typescript
- [ ] Create fetch function that:
    - [ ] Sets loading to true
    - [ ] Tries API call in try block
    - [ ] Sets data on success
    - [ ] Catches errors and displays message
    - [ ] Sets loading to false in finally block
- [ ] Call fetch function in useEffect with appropriate dependencies
- [ ] Handle empty/null responses
```

### 4. Error Handling
```typescript
- [ ] Wrap API calls in try/catch
- [ ] Extract error message: error?.message || error?.data?.message || 'An error occurred'
- [ ] Show error UI with retry button
- [ ] Use toast.error() for notifications
- [ ] Console.error for debugging
```

### 5. Loading States
```typescript
- [ ] Show loading spinner when loading === true
- [ ] Disable buttons while loading
- [ ] Show skeleton or placeholder content
- [ ] Display descriptive loading message
```

### 6. User Feedback
```typescript
- [ ] toast.success() on successful operations
- [ ] toast.error() on failed operations
- [ ] Clear error messages after user action
- [ ] Show success message with details when relevant
```

### 7. Empty States
```typescript
- [ ] Handle when data is empty/null
- [ ] Show "no results" message
- [ ] Provide action (e.g., "try different filters")
- [ ] Don't show loading spinner when data is empty
```

## Common API Service Usage

### Hotels
```typescript
// List all hotels
const hotels = await hotelService.getAll();

// Get single hotel
const hotel = await hotelService.getById(hotelId);

// Create/Update/Delete (requires auth)
await hotelService.create(hotelData);
await hotelService.update(hotelId, updates);
await hotelService.delete(hotelId);
```

### Bookings
```typescript
// Get all bookings
const bookings = await bookingService.getAll();

// Book a room
const booking = await bookingService.bookRoom({
  room: { name, id },
  userid: 1,
  fromdate: '2026-05-10',
  todate: '2026-05-12',
  totalamount: 400,
  totaldays: 2
});
```

### Pricing
```typescript
// Check availability
const availability = await pricingService.getAllAvailability({
  checkInDate: '2026-05-10',
  checkOutDate: '2026-05-12',
  guests: 2
});

// Get recommendation
const price = await pricingService.getRecommendedPrice({
  hotelName: 'Hotel Name',
  minBound: 100,
  maxBound: 300
});
```

### Authentication
```typescript
// Login
await authService.login({ email, password });

// Register
await authService.register({ name, email, password, phoneNumber });

// Get current user
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

## Code Template

```typescript
import { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { serviceYouNeed } from '../services/api';
import { toast } from 'sonner';

export function YourComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await serviceYouNeed.methodNeeded();
      setData(result);
    } catch (err) {
      const message = err?.message || 'Failed to load data';
      setError(message);
      toast.error(message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState />;

  return <YourContent data={data} />;
}
```

## Testing Checklist

- [ ] Test with valid data
- [ ] Test with empty results
- [ ] Test with network error
- [ ] Test with validation error
- [ ] Test with loading state
- [ ] Test with error state
- [ ] Test on slow network (throttle in DevTools)
- [ ] Verify tokens are stored/cleared correctly
- [ ] Verify error messages are user-friendly
- [ ] Verify toast notifications work
- [ ] Check browser console for errors

## Performance Optimization

- [ ] Implement request debouncing for search/filter
- [ ] Cache results in state when appropriate
- [ ] Avoid unnecessary re-renders
- [ ] Use useCallback for event handlers
- [ ] Consider pagination for large datasets
- [ ] Preload data if needed (e.g., hotels on landing)

## Common Mistakes to Avoid

❌ Not handling loading state
❌ Not catching errors
❌ Not clearing errors after retry
❌ Missing finally block to clear loading state
❌ Not disabling UI during loading
❌ Not providing user feedback on errors
❌ Using alert() instead of toast
❌ Not validating API responses
❌ Forgetting to handle empty/null data
❌ Not checking authentication before protected endpoints

## Debugging Tips

1. Check console for JavaScript errors
2. Check Network tab for failed API requests
3. Verify environment variable is set: `console.log(import.meta.env.VITE_API_URL)`
4. Use Postman to test API endpoints directly
5. Add console.log to track data flow:
   ```typescript
   console.log('Fetching...', endpoint);
   console.log('Response:', result);
   console.log('Error:', error);
   ```
6. Check if token is stored: `localStorage.getItem('uh_auth_token')`
7. Verify backend is running and accessible

## Quick Reference

| Task | Code |
|------|------|
| Get all hotels | `await hotelService.getAll()` |
| Get single hotel | `await hotelService.getById(id)` |
| Book room | `await bookingService.bookRoom(data)` |
| Check availability | `await pricingService.getAllAvailability(dates)` |
| Login | `await authService.login({email, password})` |
| Get current user | `await authService.getCurrentUser()` |
| Handle error | `catch (err) { toast.error(err.message) }` |
| Show loading | `{loading ? <Loader /> : <Content />}` |

---

**Need Help?** Check `API_INTEGRATION_GUIDE.md` for detailed examples and `INTEGRATION_EXAMPLE.tsx` for implementation patterns.
