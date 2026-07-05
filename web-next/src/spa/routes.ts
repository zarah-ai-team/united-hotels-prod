import { createElement, type ComponentType } from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router';
import HomePage from '@/features/home/HomePage';
import { ListingPageNew } from '@/features/hotels/ListingPageNew';
import { HotelDetailPageNew } from '@/features/hotels/HotelDetailPageNew';
import { BookingStep1 } from '@/features/booking/BookingStep1';
import { BookingStep2 } from '@/features/booking/BookingStep2';
import { BookingStep3 } from '@/features/booking/BookingStep3';
import { ConfirmationPageNew } from '@/features/booking/ConfirmationPageNew';
import { PaymentResultPage } from '@/features/booking/PaymentResultPage';
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
import { BlogAdminPage } from '@/features/blog-admin/BlogAdminPage';
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

// Blog posts now live at the site root (/<slug>). Old /blog/<slug> links
// redirect here so existing/shared URLs keep working.
function BlogSlugRedirect() {
  const { slug } = useParams();
  return createElement(Navigate, { to: `/${slug || ''}`, replace: true });
}

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
    // İş Bankası redirects the browser here after a card payment attempt.
    path: '/payment/result',
    Component: PaymentResultPage,
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
    // Blog index / listing stays at /blog.
    path: '/blog',
    Component: BlogPage,
    errorElement,
  },
  {
    // Backward-compat: old /blog/<slug> permalinks redirect to /<slug>.
    path: '/blog/:slug',
    Component: BlogSlugRedirect,
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
  // Standalone Blog Studio — a separate editor used by the content team.
  // Guarded by the same staff/admin gate but deliberately kept outside the
  // /admin dashboard (its own URL, its own chrome).
  {
    path: '/blog-admin',
    element: guarded(BlogAdminPage),
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
  // Root-level blog permalinks: /<slug>. Placed second-to-last so every real
  // static route above (/, /listing, /groups, /blog, /support, …) and every
  // multi-segment route wins first — react-router ranks static > dynamic. A
  // single-segment path that matches no real route is treated as a blog slug;
  // if no published post exists the page shows its own "not found" state.
  {
    path: '/:slug',
    Component: BlogArticlePage,
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
