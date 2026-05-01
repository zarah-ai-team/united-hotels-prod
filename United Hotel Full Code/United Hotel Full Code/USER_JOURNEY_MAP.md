# United Hotels - Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNITED HOTELS USER JOURNEY                           │
│                    From Discovery to Loyal Customer                          │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                            PHASE 1: DISCOVERY
═══════════════════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────────────┐
    │                      HOMEPAGE (/)                           │
    │  "United Hotels in Istanbul — Direct Rates. No Hidden Fees" │
    └─────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  Search  │  │ Featured │  │  Explore │
            │  Hotels  │  │  Hotels  │  │   Areas  │
            └──────────┘  └──────────┘  └──────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                                  ▼

═══════════════════════════════════════════════════════════════════════════════
                           PHASE 2: COMPARISON
═══════════════════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────────────┐
    │                  LISTING PAGE (/listing)                     │
    │          Browse & Filter Hotels in Istanbul                  │
    └─────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  Filter  │  │   Sort   │  │ Compare  │
            │  (Price, │  │  (Price, │  │  Hotels  │
            │  Rating) │  │  Rating) │  │  (Cards) │
            └──────────┘  └──────────┘  └──────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                                  ▼

═══════════════════════════════════════════════════════════════════════════════
                            PHASE 3: DECISION
═══════════════════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────────────┐
    │              HOTEL DETAIL PAGE (/hotel/:id)                  │
    │         View Gallery, Amenities, Location & Reviews          │
    └─────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │   View   │  │   Check  │  │  Compare │
            │  Photos  │  │ Amenities│  │   Rooms  │
            │ Gallery  │  │& Location│  │  (OTA vs │
            │          │  │          │  │  Direct) │
            └──────────┘  └──────────┘  └──────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   SELECT ROOM    │
                        └──────────────────┘
                                  │
                                  ▼

═══════════════════════════════════════════════════════════════════════════════
                          PHASE 4: CONVERSION
═══════════════════════════════════════════════════════════════════════════════

┌───────────────────────────────────────────────────────────────────────────┐
│                    BOOKING STEP 1 (/booking/step1)                         │
│                        Confirm Your Selection                              │
│  • Hotel & Room Summary                                                    │
│  • Booking Details (Dates, Guests)                                         │
│  • Cancellation Policy                                                     │
│  • Price Breakdown                                                         │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   User Logged    │
                        │      In?         │
                        └──────────────────┘
                         │               │
                    NO   │               │   YES
                         │               │
                         ▼               │
        ┌────────────────────────────┐   │
        │    AUTH PAGE (/auth)       │   │
        │   ┌────────────────────┐   │   │
        │   │  1. LOGIN          │   │   │
        │   │  • Email + Pass    │   │   │
        │   │                    │   │   │
        │   │  2. REGISTER       │   │   │
        │   │  • Name, Email,    │   │   │
        │   │    Password        │   │   │
        │   │                    │   │   │
        │   │  3. GUEST          │   │   │
        │   │  • Email only      │   │   │
        │   │  • Limited features│   │   │
        │   └────────────────────┘   │   │
        └────────────────────────────┘   │
                         │               │
                         └───────┬───────┘
                                 │
                                 ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    BOOKING STEP 2 (/booking/step2)                         │
│                         Enter Guest Details                                │
│  • Full Name                                                               │
│  • Email Address                                                           │
│  • Phone Number                                                            │
│  • Special Requests                                                        │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    BOOKING STEP 3 (/booking/step3)                         │
│                      Payment & Confirmation                                │
│  Payment Methods:                                                          │
│  • Credit Card    • Debit Card                                             │
│  • UPI            • Net Banking                                            │
│                                                                            │
│  INVOICE (Updated - NO TAXES):                                             │
│  • Room Price × Nights                                                     │
│  • Service Fee                                                             │
│  • ──────────────────                                                      │
│  • TOTAL PAYABLE                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │  Complete Booking         │
                    └───────────────────────────┘
                                  │
                                  ▼

═══════════════════════════════════════════════════════════════════════════════
                    PHASE 5: CONFIRMATION & RETENTION
═══════════════════════════════════════════════════════════════════════════════

┌───────────────────────────────────────────────────────────────────────────┐
│              CONFIRMATION PAGE (/booking/confirmation)                     │
│                                                                            │
│   ┌─────────────────────────────────────────────────┐                     │
│   │  ✓  BOOKING CONFIRMED!                           │                     │
│   │                                                   │                     │
│   │  Booking ID: UH-2025-12345                       │                     │
│   │  ─────────────────────────────────               │                     │
│   │                                                   │                     │
│   │  Hotel: Sultanahmet Boutique Hotel               │                     │
│   │  Check-in: March 15, 2025                        │                     │
│   │  Check-out: March 18, 2025                       │                     │
│   │  Room: Deluxe Double Room                        │                     │
│   │  Total Paid: $129                                │                     │
│   │                                                   │                     │
│   │  STATUS: ● Pending → Processing → Confirmed      │                     │
│   │                                                   │                     │
│   │  "Your booking request has been received and     │                     │
│   │   is being confirmed by the hotel."              │                     │
│   └─────────────────────────────────────────────────┘                     │
│                                                                            │
│   Actions:                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│   │  Download   │  │  Add to     │  │   View in   │                      │
│   │  Invoice    │  │  Calendar   │  │   Portal    │                      │
│   └─────────────┘  └─────────────┘  └─────────────┘                      │
│                                                                            │
│   Booking ID sent to:                                                      │
│   • User (Email)                                                           │
│   • Hotel (System notification)                                            │
│   • Super Admin (Dashboard)                                                │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    GUEST PORTAL (/portal)                                  │
│                      Manage Your Bookings                                  │
│                                                                            │
│   ┌────────────────────────────────────────────────────────┐              │
│   │  Tabs:                                                  │              │
│   │  [ Upcoming ]  [ Past ]  [ Cancelled ]                 │              │
│   └────────────────────────────────────────────────────────┘              │
│                                                                            │
│   Upcoming Bookings:                                                       │
│   ┌─────────────────────────────────────────────────┐                     │
│   │  📍 Sultanahmet Boutique Hotel                   │                     │
│   │  ID: UH-2025-12345                               │                     │
│   │  Mar 15-18, 2025 • Deluxe Room                   │                     │
│   │  Status: ● Confirmed                             │                     │
│   │  ┌────────┐  ┌────────┐  ┌────────┐             │                     │
│   │  │ Modify │  │ Cancel │  │Details │             │                     │
│   │  └────────┘  └────────┘  └────────┘             │                     │
│   └─────────────────────────────────────────────────┘                     │
│                                                                            │
│   Past Bookings:                                                           │
│   ┌─────────────────────────────────────────────────┐                     │
│   │  📍 Taksim Central Stay                          │                     │
│   │  ID: UH-2025-11890                               │                     │
│   │  Feb 10-12, 2025 • Standard Room                 │                     │
│   │  Status: ● Completed                             │                     │
│   │  ┌────────┐  ┌────────┐                          │                     │
│   │  │Download│  │  Book  │                          │                     │
│   │  │Invoice │  │ Again  │                          │                     │
│   │  └────────┘  └────────┘                          │                     │
│   └─────────────────────────────────────────────────┘                     │
└───────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                      SUPPORTING JOURNEYS: CONTENT & SUPPORT
═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│      BLOG PAGE (/blog)           │      │   SUPPORT PAGE (/support)        │
│                                  │      │                                  │
│  Travel Guides & Tips            │      │  Get Help & Answers              │
│  ┌────────────────────────┐      │      │  ┌────────────────────────┐     │
│  │ Category Filters:      │      │      │  │ Contact Methods:       │     │
│  │ • All                  │      │      │  │ • WhatsApp Support     │     │
│  │ • Neighborhoods        │      │      │  │ • Email Support        │     │
│  │ • Travel Tips          │      │      │  │ • Phone Support        │     │
│  │ • Budget Travel        │      │      │  └────────────────────────┘     │
│  │ • Food & Dining        │      │      │                                  │
│  │ • Culture              │      │      │  ┌────────────────────────┐     │
│  └────────────────────────┘      │      │  │ FAQ Accordion:         │     │
│                                  │      │  │ • How to book?         │     │
│  Article Cards:                  │      │  │ • Payment methods?     │     │
│  ┌────────────────────────┐      │      │  │ • Cancellation?        │     │
│  │ 📷 Featured Image      │      │      │  │ • Payment security?    │     │
│  │ 🏷️  Category Badge     │      │      │  │ • Booking fees?        │     │
│  │                        │      │      │  │ • What's included?     │     │
│  │ Title & Excerpt        │      │      │  │ • Confirmation?        │     │
│  │ Read More →            │      │      │  │ • Contact hotel?       │     │
│  └────────────────────────┘      │      │  │ • Airport transfers?   │     │
│                                  │      │  │ • Price match?         │     │
│  Featured Articles:              │      │  └────────────────────────┘     │
│  1. Where to Stay in Istanbul    │      │                                  │
│  2. Cheapest Neighborhoods       │      │  ┌────────────────────────┐     │
│  3. Best Time to Visit           │      │  │ Contact Form:          │     │
│  4. Grand Bazaar Guide           │      │  │ • Name, Email          │     │
│  5. Turkish Breakfast Guide      │      │  │ • Subject, Message     │     │
│  6. Galata & Karaköy Guide       │      │  │ • Submit Button        │     │
│           │                      │      │  └────────────────────────┘     │
│           ▼                      │      │                                  │
│  ┌────────────────────────┐      │      │  ┌────────────────────────┐     │
│  │  ARTICLE PAGE          │      │      │  │ Office Location:       │     │
│  │  (/blog/:slug)         │      │      │  │ • Map                  │     │
│  │                        │      │      │  │ • Address              │     │
│  │  • Full article        │      │      │  │ • Hours                │     │
│  │  • Rich formatting     │      │      │  └────────────────────────┘     │
│  │  • Tips & tables       │      │      └──────────────────────────────────┘
│  │  • Related articles    │      │
│  │  • Book Hotels CTA     │      │
│  └────────────────────────┘      │
└──────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                            NAVIGATION FLOW MAP
═══════════════════════════════════════════════════════════════════════════════

                              ┌──────────────┐
                              │   HOMEPAGE   │
                              │      (/)     │
                              └──────────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
         ┌────────────────┐  ┌────────────┐  ┌────────────────┐
         │  Destinations  │  │   Hotels   │  │ Travel Guides  │
         └────────────────┘  └────────────┘  └────────────────┘
                  │                  │                  │
                  ▼                  ▼                  ▼
         ┌────────────────┐  ┌────────────┐  ┌────────────────┐
         │ LISTING PAGE   │  │LISTING PAGE│  │   BLOG PAGE    │
         │  (filtered)    │  │            │  │                │
         └────────────────┘  └────────────┘  └────────────────┘
                                     │                  │
                                     ▼                  ▼
                          ┌────────────────┐  ┌────────────────┐
                          │ HOTEL DETAIL   │  │ ARTICLE PAGE   │
                          └────────────────┘  └────────────────┘
                                     │
                                     ▼
                          ┌────────────────┐
                          │ BOOKING STEP 1 │
                          └────────────────┘
                                     │
                                     ▼
                          ┌────────────────┐
                          │   AUTH PAGE    │
                          │ (if not logged)│
                          └────────────────┘
                                     │
                                     ▼
                          ┌────────────────┐
                          │ BOOKING STEP 2 │
                          └────────────────┘
                                     │
                                     ▼
                          ┌────────────────┐
                          │ BOOKING STEP 3 │
                          └────────────────┘
                                     │
                                     ▼
                          ┌────────────────┐
                          │ CONFIRMATION   │
                          └────────────────┘
                                     │
                                     ▼
                          ┌────────────────┐
                          │ GUEST PORTAL   │
                          └────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                              KEY INTERACTIONS
═══════════════════════════════════════════════════════════════════════════════

HOMEPAGE → LISTING
├─ Search Hotels (Hero)
├─ View Featured Hotel Card
├─ Explore Area Card
└─ Find Hotels CTA

LISTING → HOTEL DETAIL
├─ Click Hotel Card
└─ Filter + Select Hotel

HOTEL DETAIL → BOOKING
├─ Select Room Button
└─ Choose from Room Cards

BOOKING → AUTH (if needed)
└─ Continue from Step 1

AUTH → BOOKING STEP 2
├─ Login Success
├─ Register Success
└─ Guest Continue

BOOKING → CONFIRMATION
└─ Complete Payment (Step 3)

CONFIRMATION → PORTAL
├─ View in Portal Button
└─ Manage Booking Link

PORTAL → BOOKING AGAIN
├─ Book Again (Past Bookings)
└─ Modify Booking (Upcoming)

HOMEPAGE → BLOG
├─ Travel Guides Nav Link
└─ Blog Article Card

BLOG → ARTICLE
└─ Read Article Card

ARTICLE → LISTING
└─ Book Hotels CTA

ANY PAGE → SUPPORT
└─ Support Nav Link

═══════════════════════════════════════════════════════════════════════════════
                          CONVERSION OPTIMIZATION MAP
═══════════════════════════════════════════════════════════════════════════════

TRUST BUILDING TOUCHPOINTS:

Homepage
├─ ✓ Verified Hotels Badge
├─ ✓ Local Support Badge
├─ ✓ Direct Negotiated Prices Badge
├─ ✓ Hotel Inspection Photo
└─ ✓ "Stay Smart. Stay United." Tagline

Listing Page
├─ ✓ Filter Transparency
├─ ✓ Clear Pricing
└─ ✓ Reviews Count

Hotel Detail
├─ ✓ Photo Gallery (Authenticity)
├─ ✓ OTA vs Direct Comparison
├─ ✓ Amenities List
├─ ✓ Location Map
└─ ✓ Customer Reviews

Booking Flow
├─ ✓ Progress Indicator (Clarity)
├─ ✓ Price Breakdown (Transparency)
├─ ✓ Cancellation Policy (Flexibility)
├─ ✓ Secure Payment Badges
└─ ✓ No Hidden Fees Message

Confirmation
├─ ✓ Booking ID (Professionalism)
├─ ✓ Status Updates (Transparency)
├─ ✓ Download Invoice (Trust)
└─ ✓ Support Contact (Accessibility)

═══════════════════════════════════════════════════════════════════════════════
                            URGENCY & SCARCITY MAP
═══════════════════════════════════════════════════════════════════════════════

HOMEPAGE:
└─ "Rooms starting from $32/night"

LISTING PAGE:
└─ Hotel Cards:
    ├─ "Only 2 rooms left"
    ├─ "Booked 12 times this week"
    └─ "Free cancellation"

HOTEL DETAIL:
└─ Room Cards:
    ├─ Availability indicator
    ├─ "Last room available"
    └─ Savings badge "$15 saved"

BOOKING FLOW:
└─ Timer for price hold (optional future feature)

═══════════════════════════════════════════════════════════════════════════════
                              SUCCESS METRICS
═══════════════════════════════════════════════════════════════════════════════

Discovery → Comparison:
└─ Homepage → Listing Page click-through rate

Comparison → Decision:
└─ Listing Page → Hotel Detail view rate

Decision → Conversion:
└─ Hotel Detail → Booking initiation rate

Conversion Completion:
└─ Booking Step 1 → Confirmation completion rate

Authentication:
├─ New Account Creation rate
├─ Login success rate
└─ Guest checkout rate

Retention:
├─ Portal login frequency
├─ Repeat booking rate
└─ Booking modification rate

Content Engagement:
├─ Blog page visits
├─ Article read time
└─ Article → Booking conversion

Support Effectiveness:
├─ FAQ usage rate
├─ Contact form submissions
└─ Support → Booking recovery

═══════════════════════════════════════════════════════════════════════════════
                                  SUMMARY
═══════════════════════════════════════════════════════════════════════════════

COMPLETE USER JOURNEY INCLUDES:

✅ 5 PHASES
   └─ Discovery → Comparison → Decision → Conversion → Retention

✅ 12 PAGES
   └─ All interconnected with clear navigation

✅ 3 AUTHENTICATION OPTIONS
   └─ Login, Register, Guest

✅ 3 BOOKING STEPS
   └─ Selection → Details → Payment

✅ 2 CONTENT SECTIONS
   └─ Blog + Support

✅ 1 MANAGEMENT PORTAL
   └─ Guest Dashboard

✅ CONVERSION FEATURES
   ├─ Trust signals throughout
   ├─ Urgency indicators
   ├─ Social proof
   ├─ Clear CTAs
   └─ Transparent pricing

✅ COMPLETE PROTOTYPE
   └─ No dead links, fully interactive, ready for review

═══════════════════════════════════════════════════════════════════════════════
```
