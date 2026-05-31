import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Room {
  id: string;
  name: string;
  price: number;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  image: string;
}

interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequest?: string;
}

interface BookingState {
  hotel: Hotel | null;
  room: Room | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  roomCount: number;
  guestDetails: GuestDetails | null;
  nights: number;
  confirmationId: string | null;
}

interface BookingContextType {
  booking: BookingState;
  setHotel: (hotel: Hotel) => void;
  setRoom: (room: Room) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: number) => void;
  setOccupancy: (adults: number, children: number) => void;
  setRoomCount: (roomCount: number) => void;
  setGuestDetails: (details: GuestDetails) => void;
  clearBooking: () => void;
  calculateNights: () => number;
  setConfirmationId: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>({
    hotel: null,
    room: null,
    checkIn: '',
    checkOut: '',
    guests: 2,
    adults: 2,
    children: 0,
    roomCount: 1,
    guestDetails: null,
    nights: 0,
    confirmationId: null
  });

  // All setters are wrapped in useCallback so they keep a stable identity
  // across renders. Components can safely include them in useEffect/useMemo
  // dependency arrays without triggering infinite re-render loops.
  const setHotel = useCallback((hotel: Hotel) => {
    setBooking(prev => ({ ...prev, hotel }));
  }, []);

  const setRoom = useCallback((room: Room) => {
    setBooking(prev => ({ ...prev, room }));
  }, []);

  const setDates = useCallback((checkIn: string, checkOut: string) => {
    const nights = calculateNightsBetween(checkIn, checkOut);
    setBooking(prev => ({ ...prev, checkIn, checkOut, nights }));
  }, []);

  const setGuests = useCallback((guests: number) => {
    setBooking(prev => ({ ...prev, guests }));
  }, []);

  const setOccupancy = useCallback((adults: number, children: number) => {
    const safeAdults = Math.max(1, Math.floor(adults) || 1);
    const safeChildren = Math.max(0, Math.floor(children) || 0);
    setBooking(prev => ({
      ...prev,
      adults: safeAdults,
      children: safeChildren,
      guests: safeAdults + safeChildren,
    }));
  }, []);

  const setRoomCount = useCallback((roomCount: number) => {
    setBooking(prev => ({ ...prev, roomCount: Math.max(1, roomCount) }));
  }, []);

  const setGuestDetails = useCallback((guestDetails: GuestDetails) => {
    setBooking(prev => ({ ...prev, guestDetails }));
  }, []);

  const setConfirmationId = useCallback((confirmationId: string) => {
    setBooking(prev => ({ ...prev, confirmationId }));
  }, []);

  const clearBooking = useCallback(() => {
    setBooking({
      hotel: null,
      room: null,
      checkIn: '',
      checkOut: '',
      guests: 2,
      adults: 2,
      children: 0,
      roomCount: 1,
      guestDetails: null,
      nights: 0,
      confirmationId: null
    });
  }, []);

  const calculateNightsBetween = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateNights = useCallback(() => {
    return calculateNightsBetween(booking.checkIn, booking.checkOut);
  }, [booking.checkIn, booking.checkOut]);

  return (
    <BookingContext.Provider value={{
      booking,
      setHotel,
      setRoom,
      setDates,
      setGuests,
      setOccupancy,
      setRoomCount,
      setGuestDetails,
      clearBooking,
      calculateNights,
      setConfirmationId
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
