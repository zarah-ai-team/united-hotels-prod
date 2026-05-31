// Import this first to suppress recharts warnings before any components mount
import '@/shared/lib/suppressRechartsWarnings';

import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/shared/context/AuthContext';
import { BookingProvider } from '@/shared/context/BookingContext';
import { LanguageProvider } from '@/shared/context/LanguageContext';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LocaleSuggestionModal } from '@/shared/components/LocaleSuggestionModal';
import { router } from '@/spa/routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { suppressRechartsWarnings } from '@/shared/lib/suppressRechartsWarnings';

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
