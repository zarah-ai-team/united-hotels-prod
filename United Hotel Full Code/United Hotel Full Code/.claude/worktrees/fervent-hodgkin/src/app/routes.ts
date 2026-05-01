import { createBrowserRouter } from 'react-router';
import HomePage from './pages/HomePage';
import { ListingPageNew } from './pages/ListingPageNew';
import { HotelDetailPageNew } from './pages/HotelDetailPageNew';
import { BookingStep1 } from './pages/BookingStep1';
import { BookingStep2 } from './pages/BookingStep2';
import { BookingStep3 } from './pages/BookingStep3';
import { ConfirmationPageNew } from './pages/ConfirmationPageNew';
import { GuestPortal } from './pages/GuestPortal';
import { BlogPage } from './pages/BlogPage';
import { BlogArticlePage } from './pages/BlogArticlePage';
import { SupportPage } from './pages/SupportPage';
import { AuthPage } from './pages/AuthPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/listing',
    Component: ListingPageNew,
  },
  {
    path: '/hotel/:id',
    Component: HotelDetailPageNew,
  },
  {
    path: '/booking/step1',
    Component: BookingStep1,
  },
  {
    path: '/auth',
    Component: AuthPage,
  },
  {
    path: '/booking/step2',
    Component: BookingStep2,
  },
  {
    path: '/booking/step3',
    Component: BookingStep3,
  },
  {
    path: '/booking/confirmation',
    Component: ConfirmationPageNew,
  },
  {
    path: '/portal',
    Component: GuestPortal,
  },
  {
    path: '/blog',
    Component: BlogPage,
  },
  {
    path: '/blog/:slug',
    Component: BlogArticlePage,
  },
  {
    path: '/support',
    Component: SupportPage,
  },
]);