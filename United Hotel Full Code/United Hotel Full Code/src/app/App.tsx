// Import this first to suppress recharts warnings before any components mount
import './utils/suppressRechartsWarnings';

import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LocaleSuggestionModal } from './components/LocaleSuggestionModal';
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
        <AuthProvider>
          <BookingProvider>
            <ErrorBoundary label="root">
              <RouterProvider router={router} />
            </ErrorBoundary>
            <Toaster position="top-right" richColors />
            {/* Suggests a region/currency switch when IP detection finds
                a different country than the active region. Renders nothing
                when no suggestion is pending. */}
            <LocaleSuggestionModal />
          </BookingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
