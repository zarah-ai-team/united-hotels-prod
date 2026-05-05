import { createElement, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import HomePage from './pages/HomePage';
import { ListingPageNew } from './pages/ListingPageNew';
import { HotelDetailPageNew } from './pages/HotelDetailPageNew';
import { BookingStep1 } from './pages/BookingStep1';
import { BookingStep2 } from './pages/BookingStep2';
import { BookingStep3 } from './pages/BookingStep3';
import { ConfirmationPageNew } from './pages/ConfirmationPageNew';
import { GuestPortal } from './pages/GuestPortal';
import { GroupsPage } from './pages/GroupsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogArticlePage } from './pages/BlogArticlePage';
import { SupportPage } from './pages/SupportPage';
import { AuthPage } from './pages/AuthPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminHotelsPage } from './pages/admin/AdminHotelsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { VendorPortalPage } from './pages/admin/VendorPortalPage';
import { AdminHotelDetailPage } from './pages/admin/AdminHotelDetailPage';
import { AdminEmailLogsPage } from './pages/admin/AdminEmailLogsPage';
import { RequireAdmin } from './components/admin/RequireAdmin';
import { RouteErrorBoundary } from './components/ErrorBoundary';

// Wrap an admin page in the RequireAdmin guard. Using a render-element route
// (`element:`) instead of `Component:` lets us inject the wrapper without
// touching each page component.
const guarded = (Component: ComponentType) =>
  createElement(RequireAdmin, null, createElement(Component));

// React-router calls this whenever a loader or rendered component throws.
// Attached to every route so users never see the default "Hey developer 👋"
// fallback — they get our branded glass error screen instead.
const errorElement = createElement(RouteErrorBoundary);

export const router = createBrowserRouter([
  // User-facing routes
  {
    path: '/',
    Component: HomePage,
    errorElement,
  },
  {
    path: '/listing',
    Component: ListingPageNew,
    errorElement,
  },
  {
    path: '/hotel/:id',
    Component: HotelDetailPageNew,
    errorElement,
  },
  {
    path: '/auth',
    Component: AuthPage,
    errorElement,
  },
  {
    path: '/auth/verify',
    Component: VerifyEmailPage,
    errorElement,
  },
  {
    path: '/auth/forgot',
    Component: ForgotPasswordPage,
    errorElement,
  },
  {
    path: '/auth/reset',
    Component: ResetPasswordPage,
    errorElement,
  },
  {
    path: '/booking/step1',
    Component: BookingStep1,
    errorElement,
  },
  {
    path: '/booking/step2',
    Component: BookingStep2,
    errorElement,
  },
  {
    path: '/booking/step3',
    Component: BookingStep3,
    errorElement,
  },
  {
    path: '/booking/confirmation',
    Component: ConfirmationPageNew,
    errorElement,
  },
  {
    path: '/portal',
    Component: GuestPortal,
    errorElement,
  },
  {
    path: '/groups',
    Component: GroupsPage,
    errorElement,
  },
  {
    path: '/blog',
    Component: BlogPage,
    errorElement,
  },
  {
    path: '/blog/:slug',
    Component: BlogArticlePage,
    errorElement,
  },
  {
    path: '/support',
    Component: SupportPage,
    errorElement,
  },
  // Admin routes (all guarded except login)
  {
    path: '/admin/login',
    Component: AdminLoginPage,
    errorElement,
  },
  {
    path: '/admin',
    element: guarded(AdminDashboardPage),
    errorElement,
  },
  {
    path: '/admin/bookings',
    element: guarded(AdminBookingsPage),
    errorElement,
  },
  {
    path: '/admin/hotels',
    element: guarded(AdminHotelsPage),
    errorElement,
  },
  {
    path: '/admin/hotels/:id',
    element: guarded(AdminHotelDetailPage),
    errorElement,
  },
  {
    path: '/admin/analytics',
    element: guarded(AdminAnalyticsPage),
    errorElement,
  },
  {
    path: '/admin/settings',
    element: guarded(AdminSettingsPage),
    errorElement,
  },
  {
    path: '/admin/users',
    element: guarded(AdminUsersPage),
    errorElement,
  },
  {
    path: '/admin/email-logs',
    element: guarded(AdminEmailLogsPage),
    errorElement,
  },
  // Vendor portal (separate role — not admin-guarded)
  {
    path: '/vendor',
    Component: VendorPortalPage,
    errorElement,
  },
]);
