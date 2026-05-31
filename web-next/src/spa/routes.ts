import { createElement, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import HomePage from '@/features/home/HomePage';
import { ListingPageNew } from '@/features/hotels/ListingPageNew';
import { HotelDetailPageNew } from '@/features/hotels/HotelDetailPageNew';
import { BookingStep1 } from '@/features/booking/BookingStep1';
import { BookingStep2 } from '@/features/booking/BookingStep2';
import { BookingStep3 } from '@/features/booking/BookingStep3';
import { ConfirmationPageNew } from '@/features/booking/ConfirmationPageNew';
import { GuestPortal } from '@/features/guest/GuestPortal';
import { GroupsPage } from '@/features/groups/GroupsPage';
import { BlogPage } from '@/features/blog/BlogPage';
import { BlogArticlePage } from '@/features/blog/BlogArticlePage';
import { SupportPage } from '@/features/support/SupportPage';
import { PrivacyPolicyPage } from '@/features/support/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/features/support/TermsOfServicePage';
import { AuthPage } from '@/features/auth/AuthPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { AdminLoginPage } from '@/features/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { AdminBookingsPage } from '@/features/admin/AdminBookingsPage';
import { AdminHotelsPage } from '@/features/admin/AdminHotelsPage';
import { AdminAnalyticsPage } from '@/features/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/features/admin/AdminSettingsPage';
import { AdminUsersPage } from '@/features/admin/AdminUsersPage';
import { VendorPortalPage } from '@/features/vendor/VendorPortalPage';
import { VendorLoginPage } from '@/features/vendor/VendorLoginPage';
import { AdminHotelDetailPage } from '@/features/admin/AdminHotelDetailPage';
import { AdminEmailLogsPage } from '@/features/admin/AdminEmailLogsPage';
import { AdminGroupRequestsPage } from '@/features/admin/AdminGroupRequestsPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { RequireAdmin } from '@/features/admin/components/RequireAdmin';
import { RequireVendor } from '@/features/admin/components/RequireVendor';
import { RouteErrorBoundary } from '@/shared/components/ErrorBoundary';

// Wrap an admin page in the RequireAdmin guard. Using a render-element route
// (`element:`) instead of `Component:` lets us inject the wrapper without
// touching each page component.
const guarded = (Component: ComponentType) =>
  createElement(RequireAdmin, null, createElement(Component));

const vendorGuarded = (Component: ComponentType) =>
  createElement(RequireVendor, null, createElement(Component));

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
  {
    path: '/privacy',
    Component: PrivacyPolicyPage,
    errorElement,
  },
  {
    path: '/terms',
    Component: TermsOfServicePage,
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
  {
    path: '/admin/group-requests',
    element: guarded(AdminGroupRequestsPage),
    errorElement,
  },
  // Vendor portal (separate role — guarded by RequireVendor)
  {
    path: '/vendor/login',
    Component: VendorLoginPage,
    errorElement,
  },
  {
    path: '/vendor',
    element: vendorGuarded(VendorPortalPage),
    errorElement,
  },
  // Catch-all 404 — must be the LAST route. Anything that didn't match a
  // real route above lands here with our branded NotFound experience.
  {
    path: '*',
    Component: NotFoundPage,
    errorElement,
  },
]);
