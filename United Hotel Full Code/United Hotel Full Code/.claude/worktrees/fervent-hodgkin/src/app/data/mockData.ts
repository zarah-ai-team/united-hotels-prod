export const hotels = [
  {
    id: '1',
    name: 'Sultanahmet Boutique Hotel',
    location: 'Sultanahmet, Old City',
    rating: 4,
    reviewCount: 127,
    directPrice: 42,
    otaPrice: 57,
    savings: 15,
    urgency: 'Only 2 rooms left',
    amenities: ['Free WiFi', 'Breakfast', 'Airport Shuttle', 'AC'],
    image: 'https://images.unsplash.com/photo-1641851962761-43d3c1a34360?w=800',
    description: 'Located in the heart of historic Turkey, just steps from Hagia Sophia and Blue Mosque. Our boutique hotel offers comfortable rooms with modern amenities in a traditional setting.',
    rooms: [
      {
        id: 'r1',
        name: 'Standard Double Room',
        image: 'https://images.unsplash.com/photo-1641851962761-43d3c1a34360?w=600',
        size: '18 m²',
        maxGuests: 2,
        amenities: ['Free WiFi', 'AC', 'TV', 'Private Bathroom'],
        cancellationPolicy: 'Free cancellation until 24 hours before check-in',
        directPrice: 42,
        otaPrice: 57,
        available: 2
      },
      {
        id: 'r2',
        name: 'Deluxe Room with City View',
        image: 'https://images.unsplash.com/photo-1648766378129-11c3d8d0da05?w=600',
        size: '22 m²',
        maxGuests: 2,
        amenities: ['Free WiFi', 'AC', 'TV', 'Mini Bar', 'City View'],
        cancellationPolicy: 'Free cancellation until 48 hours before check-in',
        directPrice: 58,
        otaPrice: 75,
        available: 3
      }
    ]
  },
  {
    id: '2',
    name: 'Taksim Central Stay',
    location: 'Taksim, Beyoğlu',
    rating: 4,
    reviewCount: 89,
    directPrice: 38,
    otaPrice: 50,
    urgency: 'Booked 12 times this week',
    amenities: ['Free WiFi', 'Central Location', 'Modern Rooms', 'Elevator'],
    image: 'https://images.unsplash.com/photo-1648766378129-11c3d8d0da05?w=800',
    description: 'Modern hotel in the vibrant Taksim district. Perfect for exploring Turkey\'s nightlife and shopping scene on Istiklal Street.',
    rooms: [
      {
        id: 'r3',
        name: 'Economy Room',
        image: 'https://images.unsplash.com/photo-1590761044169-b9ad903fca4d?w=600',
        size: '16 m²',
        maxGuests: 2,
        amenities: ['Free WiFi', 'AC', 'Desk'],
        cancellationPolicy: 'Free cancellation until 24 hours before check-in',
        directPrice: 38,
        otaPrice: 50,
        available: 5
      }
    ]
  },
  {
    id: '3',
    name: 'Kadıköy Harbor View',
    location: 'Kadıköy, Asian Side',
    rating: 5,
    reviewCount: 156,
    directPrice: 45,
    otaPrice: 57,
    savings: 12,
    amenities: ['Sea View', 'Free WiFi', 'Restaurant', 'Terrace'],
    image: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?w=800',
    description: 'Experience authentic Turkey on the Asian side with stunning Bosphorus views. Close to cafes, markets, and the ferry terminal.',
    rooms: [
      {
        id: 'r4',
        name: 'Harbor View Room',
        image: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?w=600',
        size: '20 m²',
        maxGuests: 2,
        amenities: ['Free WiFi', 'AC', 'Sea View', 'Balcony'],
        cancellationPolicy: 'Free cancellation until 24 hours before check-in',
        directPrice: 45,
        otaPrice: 57,
        available: 4
      }
    ]
  }
];

export function getHotelById(id: string) {
  return hotels.find(h => h.id === id);
}

export function getRoomById(hotelId: string, roomId: string) {
  const hotel = getHotelById(hotelId);
  return hotel?.rooms?.find(r => r.id === roomId);
}
