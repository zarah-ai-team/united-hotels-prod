import { RouterProvider } from 'react-router';
import { BookingProvider } from './context/BookingContext';
import { router } from './routes';

export default function App() {
  return (
    <BookingProvider>
      <RouterProvider router={router} />
    </BookingProvider>
  );
}
