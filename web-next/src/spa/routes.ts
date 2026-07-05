import { createElement, lazy, type ComponentType } from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router';

// Eager: the SEO-critical pages a visitor is most likely to land on directly.
// These stay in the main bundle so first paint isn't gated on a second chunk.
import HomePage from '@/features/home/HomePage';
import { ListingPageNew } from '@/features/hotels/ListingPageNew';
import { HotelDetailPageNew } from '@/features/hotels/HotelDetailPageNew';
import { BlogArticlePage } from '@/features/blog/BlogArticlePage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
// Guards + error boundary are tiny and needed everywhere — keep them eager.
import { RequireAdmin } from '@/features/admin/components/RequireAdmin';
import { RequireVendor } from '@/features/admin/components/RequireVendor';
import { RouteErrorBoundary } from '@/shared/components/ErrorBoundary';

// Everything else is code-split so public visitors never download the booking
// flow, auth, the admin dashboards (which pull in recharts), the vendor portal
// or the blog editor. React.lazy + the <Suspense> boundary in App.tsx resolve
// these on demand. Helper keeps the named-export lazy imports tidy.
const page = (importer: () => Promise<any>, name: string): ComponentType =>
  lazy(() => importer().then((m) => ({ default: m[name] }))) as unknown as ComponentType;

const BookingStep1 = page(() => import('@/features/booking/BookingStep1'), 'BookingStep1');
const BookingStep2 = page(() => import('@/features/booking/BookingStep2'), 'BookingStep2');
const BookingStep3 = page(() => import('@/features/booking/BookingStep3'), 'BookingStep3');
const ConfirmationPageNew = page(() => import('@/features/booking/ConfirmationPageNew'), 'ConfirmationPageNew');
const PaymentResultPage = page(() => import('@/features/booking/PaymentResultPage'), 'PaymentResultPage');
const GuestPortal = page(() => import('@/features/guest/GuestPortal'), 'GuestPortal');
const GroupsPage = page(() => import('@/features/groups/GroupsPage'), 'GroupsPage');
const BlogPage = page(() => import('@/features/blog/BlogPage'), 'BlogPage');
const SupportPage = page(() => import('@/features/support/SupportPage'), 'SupportPage');
const PrivacyPolicyPage = page(() => import('@/features/support/PrivacyPolicyPage'), 'PrivacyPolicyPage');
const TermsOfServicePage = page(() => import('@/features/support/TermsOfServicePage'), 'TermsOfServicePage');
const AuthPage = page(() => import('@/features/auth/AuthPage'), 'AuthPage');
const VerifyEmailPage = page(() => import('@/features/auth/VerifyEmailPage'), 'VerifyEmailPage');
const ForgotPasswordPage = page(() => import('@/features/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = page(() => import('@/features/auth/ResetPasswordPage'), 'ResetPasswordPage');
const AdminLoginPage = page(() => import('@/features/admin/AdminLoginPage'), 'AdminLoginPage');
const AdminDashboardPage = page(() => import('@/features/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminBookingsPage = page(() => import('@/features/admin/AdminBookingsPage'), 'AdminBookingsPage');
const AdminHotelsPage = page(() => import('@/features/admin/AdminHotelsPage'), 'AdminHotelsPage');
const AdminAnalyticsPage = page(() => import('@/features/admin/AdminAnalyticsPage'), 'AdminAnalyticsPage');
const AdminSettingsPage = page(() => import('@/features/admin/AdminSettingsPage'), 'AdminSettingsPage');
const AdminUsersPage = page(() => import('@/features/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminHotelDetailPage = page(() => import('@/features/admin/AdminHotelDetailPage'), 'AdminHotelDetailPage');
const AdminEmailLogsPage = page(() => import('@/features/admin/AdminEmailLogsPage'), 'AdminEmailLogsPage');
const AdminGroupRequestsPage = page(() => import('@/features/admin/AdminGroupRequestsPage'), 'AdminGroupRequestsPage');
const VendorPortalPage = page(() => import('@/features/vendor/VendorPortalPage'), 'VendorPortalPage');
const VendorLoginPage = page(() => import('@/features/vendor/VendorLoginPage'), 'VendorLoginPage');
const BlogAdminPage = page(() => import('@/features/blog-admin/BlogAdminPage'), 'BlogAdminPage');

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
    // /hotels is a natural URL people type for the listing — send them to the
    // canonical /listing (also stops it falling through to the /:slug blog
    // lookup and showing "Article not found").
    path: '/hotels',
    element: createElement(Navigate, { to: '/listing', replace: true }),
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
