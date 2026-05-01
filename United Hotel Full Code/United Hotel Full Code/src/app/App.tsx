// Import this first to suppress recharts warnings before any components mount
import './utils/suppressRechartsWarnings';

import { RouterProvider } from 'react-router';
import { BookingProvider } from './context/BookingContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { suppressRechartsWarnings } from './utils/suppressRechartsWarnings';

export default function App() {
  // Suppress known benign recharts warnings on mount
  useEffect(() => {
    suppressRechartsWarnings();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BookingProvider>
          <ErrorBoundary label="root">
            <RouterProvider router={router} />
          </ErrorBoundary>
          <Toaster position="top-right" richColors />
        </BookingProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
