import { createContext, useContext, useState, ReactNode } from 'react';

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
  guestDetails: GuestDetails | null;
  nights: number;
}

interface BookingContextType {
  booking: BookingState;
  setHotel: (hotel: Hotel) => void;
  setRoom: (room: Room) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: number) => void;
  setGuestDetails: (details: GuestDetails) => void;
  clearBooking: () => void;
  calculateNights: () => number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>({
    hotel: null,
    room: null,
    checkIn: '',
    checkOut: '',
    guests: 2,
    guestDetails: null,
    nights: 0
  });

  const setHotel = (hotel: Hotel) => {
    setBooking(prev => ({ ...prev, hotel }));
  };

  const setRoom = (room: Room) => {
    setBooking(prev => ({ ...prev, room }));
  };

  const setDates = (checkIn: string, checkOut: string) => {
    const nights = calculateNightsBetween(checkIn, checkOut);
    setBooking(prev => ({ ...prev, checkIn, checkOut, nights }));
  };

  const setGuests = (guests: number) => {
    setBooking(prev => ({ ...prev, guests }));
  };

  const setGuestDetails = (guestDetails: GuestDetails) => {
    setBooking(prev => ({ ...prev, guestDetails }));
  };

  const clearBooking = () => {
    setBooking({
      hotel: null,
      room: null,
      checkIn: '',
      checkOut: '',
      guests: 2,
      guestDetails: null,
      nights: 0
    });
  };

  const calculateNightsBetween = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateNights = () => {
    return calculateNightsBetween(booking.checkIn, booking.checkOut);
  };

  return (
    <BookingContext.Provider value={{
      booking,
      setHotel,
      setRoom,
      setDates,
      setGuests,
      setGuestDetails,
      clearBooking,
      calculateNights
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
