# Hotel Management API - CRUD & Import Guide

## Overview

This API provides comprehensive hotel management functionality with admin-only CRUD operations and Excel import capabilities. Hotels are stored with complete JSON data including locations, policies, amenities, room types, and rate plans.

## Database Schema

The new hotel schema uses JSONB storage with the following structure:

```
hotels table:
- id (serial primary key)
- hotel_id (text unique) - canonical hotel identifier
- data (jsonb) - complete hotel data object
- status (text) - 'active', 'draft', or 'inactive'
- manager_id (integer) - reference to users table
- created_at (timestamptz)
- updated_at (timestamptz)
```

## API Endpoints

### PUBLIC ENDPOINTS

#### 1. Get All Hotels
```
GET /hotels
Query Parameters:
  - status: 'active' | 'draft' | 'inactive' (default: 'active')
  - search: string (searches hotel name, address, hotelId)
  - limit: number (default: 50, max: 100)
  - offset: number (default: 0)

Response:
{
  "hotels": [
    {
      "id": 1,
      "hotel_id": "hotel_name",
      "name": "...",
      "status": "active",
      "address": "...",
      "rating": "4.5",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 10,
  "limit": 50,
  "offset": 0
}
```

#### 2. Search Hotels
```
GET /hotels/search
Query Parameters:
  - query: string (search term)
  - status: 'active' | 'draft' | 'inactive' (default: 'active')
  - minRating: number (0-5)
  - maxRating: number (0-5)
  - location: string (city or area)
  - limit: number (default: 50)
  - offset: number (default: 0)

Response:
{
  "results": [...hotel objects...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "pages": 2
  }
}
```

#### 3. Get Hotel by ID
```
GET /hotels/:id
Path Parameters:
  - id: hotel database ID or hotelId

Response: Complete hotel object with all data
```

#### 4. Get Hotel by Canonical ID
```
GET /hotels/canonical/:hotelId
Path Parameters:
  - hotelId: canonical hotel ID

Response: Complete hotel object with all data
```

### ADMIN ENDPOINTS (Require Authentication & Admin Role)

#### 1. Import Hotels from Excel
```
POST /hotels/import
Headers:
  - Authorization: Bearer {token}

Body: {
  "general_informations": [
    {
      "HOTEL NAMES": "Hotel Name",
      "INFORMATION": "Hotel description",
      "CONTACT": "Phone number",
      "LOCATION": "Address",
      "E-Mail ADDRESS": "email@example.com",
      "ROOM TYPES": "Single,Double,Suite",
      "PRICES": "100 TRY, 150 TRY, 200 TRY",
      "HOTEL LINK": "https://hotel-website.com",
      "STAR RATINGS": "4",
      "HOTEL AMENITIES": "WiFi, Pool, Restaurant",
      "HOTEL DESCRIPTON": "Short description",
      "CHECK IN AND CHECK OUT": "Check in: 14:00, Check out: 11:00"
    }
  ],
  "child_pet_smoking_policies": [
    {
      "HOTEL NAMES": "Hotel Name",
      "CHILD POLICY": "Children under 12 stay free",
      "PET POLICY": "Pets allowed with fee",
      "SMOKING POLICY": "No smoking except terrace"
    }
  ],
  "google_map_links": [
    {
      "HOTEL NAMES": "Hotel Name",
      "GOOGLE MAP LINK": "https://maps.google.com/..."
    }
  ]
}

Response:
{
  "message": "Hotel import completed",
  "imported": [
    {
      "hotelId": "hotel_name",
      "id": 1,
      "action": "created|updated"
    }
  ],
  "errors": [...],
  "summary": {
    "total": 10,
    "successful": 9,
    "failed": 1
  }
}
```

#### 2. Create Hotel
```
POST /hotels
Headers:
  - Authorization: Bearer {token}

Body: Complete hotel object with required fields:
{
  "hotelId": "hotel_identifier",
  "name": {
    "displayName": "Hotel Name",
    "canonicalName": "hotel_name",
    "sourceNames": ["Hotel Name"]
  },
  "basicInfo": {
    "starRating": 4,
    "propertyType": "hotel",
    "descriptionShort": "Short desc",
    "descriptionLong": "Long description"
  },
  "location": {
    "addressText": "Full address",
    "country": "Turkey",
    "googleMapsUrl": "https://..."
  },
  "contacts": {
    "primaryPhone": "+90...",
    "email": "info@hotel.com",
    "websiteUrl": "https://..."
  },
  "policies": {},
  "amenities": [],
  "roomTypes": [],
  "ratePlans": []
}

Response:
{
  "message": "Hotel created successfully",
  "hotel": {
    "id": 1,
    "hotel_id": "hotel_identifier",
    "data": {...},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Update Hotel
```
PUT /hotels/:id
Headers:
  - Authorization: Bearer {token}

Path Parameters:
  - id: hotel database ID or hotelId

Body: Partial hotel object (will deep merge):
{
  "basicInfo": {
    "starRating": 5
  },
  "status": "active",
  "amenities": [
    {
      "name": "New Amenity",
      "category": "general",
      "isFeatured": true
    }
  ]
}

Response:
{
  "message": "Hotel updated successfully",
  "hotel": {
    "id": 1,
    "hotel_id": "hotel_identifier",
    "data": {...updated data...},
    "status": "active",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. Delete Hotel
```
DELETE /hotels/:id
Headers:
  - Authorization: Bearer {token}

Path Parameters:
  - id: hotel database ID or hotelId

Response:
{
  "message": "Hotel deleted successfully",
  "hotelId": "hotel_identifier"
}
```

## Hotel Data Structure

The complete hotel object stored in the `data` JSONB field:

```json
{
  "hotelId": "string",
  "name": {
    "displayName": "string",
    "canonicalName": "string",
    "sourceNames": ["string"]
  },
  "status": "active|draft|inactive",
  "basicInfo": {
    "starRating": "number|null",
    "propertyType": "string|null",
    "descriptionShort": "string|null",
    "descriptionLong": "string|null",
    "totalRooms": "number|null"
  },
  "location": {
    "addressText": "string",
    "street": "string|null",
    "area": "string|null",
    "city": "string|null",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    },
    "googleMapsUrl": "string|null"
  },
  "contacts": {
    "primaryContactName": "string|null",
    "primaryPhone": "string|null",
    "email": "string|null",
    "websiteUrl": "string|null"
  },
  "checkInOut": {
    "checkInTime": "HH:MM|null",
    "checkOutTime": "HH:MM|null"
  },
  "amenities": [
    {
      "name": "string",
      "category": "string",
      "isFeatured": "boolean"
    }
  ],
  "roomTypes": [
    {
      "roomTypeId": "string",
      "name": "string",
      "bedType": "string|null",
      "occupancy": {
        "adults": "number|null",
        "children": "number|null"
      },
      "isActive": "boolean"
    }
  ],
  "ratePlans": [
    {
      "ratePlanId": "string",
      "roomTypeId": "string|null",
      "currency": "string",
      "basePrice": "number|null",
      "priceUnit": "per_night|per_stay|unknown",
      "boardType": "string|null"
    }
  ],
  "policies": {
    "childPolicy": { "summary": "string|null", "freeChildAgeMax": "number|null" },
    "petPolicy": { "petsAllowed": "boolean|null", "summary": "string|null" },
    "smokingPolicy": { "smokingAllowed": "boolean|null", "summary": "string|null" }
  },
  "media": {
    "coverImageUrl": "string|null",
    "gallery": [
      {
        "url": "string",
        "caption": "string|null",
        "sortOrder": "number|null"
      }
    ]
  },
  "bookingConfig": {
    "instantBookEnabled": "boolean",
    "minStayNights": "number|null",
    "maxStayNights": "number|null"
  },
  "source": {
    "fileName": "string",
    "sheetRefs": ["string"],
    "lastImportedAt": "ISO8601|null",
    "rawRowData": "object"
  },
  "audit": {
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid data or validation error
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks required permissions (not admin)
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate hotel ID or constraint violation

Error Response Format:
```json
{
  "error": "Detailed error message"
}
```

## Authentication

All admin endpoints require:
1. Valid JWT token in `Authorization: Bearer {token}` header
2. User must have `isAdmin` flag set to `true`

## Usage Examples

### Example 1: Import Hotels from Excel Data
```javascript
const importData = {
  general_informations: [
    {
      "HOTEL NAMES": "Hagia Sophia Hotel",
      "INFORMATION": "Luxury 5-star hotel",
      "CONTACT": "+90-212-5551234",
      "LOCATION": "Sultanahmet, Istanbul",
      "E-Mail ADDRESS": "info@hagiasophiahotel.com",
      "ROOM TYPES": "Single,Double,Suite",
      "PRICES": "250 TRY, 350 TRY, 500 TRY",
      "HOTEL LINK": "https://hagiasophiahotel.com",
      "STAR RATINGS": "5",
      "HOTEL AMENITIES": "WiFi, Pool, Spa, Restaurant, Bar",
      "HOTEL DESCRIPTON": "Historic luxury hotel",
      "CHECK IN AND CHECK OUT": "Check in: 14:00, Check out: 11:00"
    }
  ],
  child_pet_smoking_policies: [
    {
      "HOTEL NAMES": "Hagia Sophia Hotel",
      "CHILD POLICY": "Children under 12 stay free with crib available",
      "PET POLICY": "Small pets allowed with 50 TRY fee",
      "SMOKING POLICY": "No smoking, terrace available"
    }
  ],
  google_map_links: [
    {
      "HOTEL NAMES": "Hagia Sophia Hotel",
      "GOOGLE MAP LINK": "https://maps.google.com/?q=Hagia+Sophia+Istanbul"
    }
  ]
};

fetch('/hotels/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify(importData)
})
.then(res => res.json())
.then(data => console.log(data));
```

### Example 2: Search Hotels
```javascript
fetch('/hotels/search?query=Istanbul&minRating=4&maxRating=5&limit=10', {
  method: 'GET'
})
.then(res => res.json())
.then(data => console.log(data.results));
```

### Example 3: Update Hotel Status
```javascript
fetch('/hotels/hagia_sophia_hotel', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({
    status: 'active',
    basicInfo: {
      starRating: 5
    }
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Validation

The import system validates:
1. Required fields present in Excel data
2. Hotel name is not empty
3. Location data exists
4. Valid email format (if provided)
5. Valid star rating (0-5)
6. Valid price format

## Notes

- All hotels are initially imported in 'draft' status
- Use the UPDATE endpoint to change status to 'active'
- Deep merge is used for updates (nested objects are merged)
- Hotel IDs are generated from hotel names and must be unique
- All timestamps are in ISO 8601 format
- Search is case-insensitive for names and addresses
