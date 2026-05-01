# Hotel RBAC (Role-Based Access Control) Documentation

## Overview

The Hotel Management API now implements comprehensive role-based access control. Users can only see and manage their own hotels, while super admins can view and manage all hotels.

## User Roles

### Super Admin (`isAdmin: true`)
- Can view ALL hotels (active, draft, inactive)
- Can create new hotels
- Can update any hotel
- Can delete any hotel
- Can import hotels from Excel
- See all hotels in search results

### Regular User/Manager (`isAdmin: false`)
- Can view ONLY their own hotels
- Cannot create hotels (returns 403)
- Cannot update hotels (returns 403)
- Cannot delete hotels (returns 403)
- Cannot import hotels (returns 403)
- Search results show only their own hotels

## RBAC Implementation

### Database Association
Hotels are associated with users via the `manager_id` field:

```sql
CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  hotel_id TEXT UNIQUE,
  data JSONB,
  status TEXT,
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

When a hotel is created, the creating admin's ID is automatically set as `manager_id`.

## Endpoint Behavior by Role

### GET /hotels (List Hotels)

**Super Admin:**
```
GET /hotels?status=active
Returns: All active hotels across all users
```

**Regular User:**
```
GET /hotels?status=active
Returns: Only active hotels where manager_id = user_id
```

**Response:**
```json
{
  "hotels": [
    {
      "id": 1,
      "hotel_id": "hagia_sophia_hotel",
      "name": "Hagia Sophia Hotel",
      "status": "active",
      "address": "Istanbul, Turkey",
      "rating": "5",
      "manager_id": 2,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 5,
  "limit": 50,
  "offset": 0
}
```

### GET /hotels/search (Search Hotels)

**Super Admin:**
```
GET /hotels/search?query=Istanbul&minRating=4
Returns: All matching hotels (all users)
```

**Regular User:**
```
GET /hotels/search?query=Istanbul&minRating=4
Returns: Only matching hotels where manager_id = user_id
```

### GET /hotels/:id (Get Specific Hotel)

**Super Admin:**
```
GET /hotels/hagia_sophia_hotel
Returns: Hotel if it exists (any user's hotel)
Status: 200 OK
```

**Regular User:**
```
GET /hotels/hagia_sophia_hotel
- If manager_id == user_id: Returns hotel (200 OK)
- If manager_id != user_id: Returns "Hotel not found or access denied" (404)
```

### POST /hotels (Create Hotel)

**Super Admin:**
```
POST /hotels
Body: {hotelId, name, location, ...}
Status: 201 Created
Created hotel gets current admin's ID as manager_id
```

**Regular User:**
```
POST /hotels
Status: 403 Forbidden
Error: "Only super admins can access this resource"
```

### PUT /hotels/:id (Update Hotel)

**Super Admin:**
```
PUT /hotels/hagia_sophia_hotel
Body: {status: "active", basicInfo: {...}}
Status: 200 OK
Can update any hotel
```

**Regular User:**
```
PUT /hotels/hagia_sophia_hotel
Status: 403 Forbidden
Error: "Only super admins can access this resource"
```

### DELETE /hotels/:id (Delete Hotel)

**Super Admin:**
```
DELETE /hotels/hagia_sophia_hotel
Status: 200 OK
Can delete any hotel
```

**Regular User:**
```
DELETE /hotels/hagia_sophia_hotel
Status: 403 Forbidden
Error: "Only super admins can access this resource"
```

### POST /hotels/import (Import Hotels)

**Super Admin:**
```
POST /hotels/import
Body: {general_informations, child_pet_smoking_policies, google_map_links}
Status: 201 Created
Creates hotels assigned to current admin
```

**Regular User:**
```
POST /hotels/import
Status: 403 Forbidden
Error: "Only super admins can access this resource"
```

## Middleware Stack

### Authentication (`authenticate`)
- Verifies JWT token
- Loads user data including `id`, `email`, `role`, `isAdmin`
- Sets `req.user` with user information

### Authorization for Reads (`authenticate`)
- All GET endpoints require authentication
- Controllers filter results based on `req.user.isAdmin`

### Authorization for Writes (`authenticate` + `authorizeSuperAdmin`)
- All POST, PUT, DELETE require authentication
- All write operations require `isAdmin = true`

## Setting Up RBAC

### 1. Ensure Users Table has Required Fields

```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;
```

### 2. Create Super Admin User

```sql
INSERT INTO users (name, email, password, role, "isAdmin", created_at, updated_at)
VALUES (
  'Super Admin',
  'admin@example.com',
  '$2b$10$...',  -- bcrypt hashed password
  'super_admin',
  true,
  NOW(),
  NOW()
);
```

### 3. Create Regular Manager User

```sql
INSERT INTO users (name, email, password, role, "isAdmin", created_at, updated_at)
VALUES (
  'Hotel Manager',
  'manager@example.com',
  '$2b$10$...',  -- bcrypt hashed password
  'manager',
  false,
  NOW(),
  NOW()
);
```

## Testing RBAC

### Test 1: Super Admin Access

```bash
# Login as super admin
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'

# Copy the token, then list all hotels
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/hotels \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response: Lists ALL hotels (from all users)
```

### Test 2: Regular User Access

```bash
# Login as regular manager
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "password"
  }'

# Copy the token, then list hotels
USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/hotels \
  -H "Authorization: Bearer $USER_TOKEN"

# Response: Lists ONLY hotels where manager_id = user_id (3 hotels)
```

### Test 3: Deny Create for Regular User

```bash
curl -X POST http://localhost:5000/hotels \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "test_hotel",
    "name": {"displayName": "Test"}
  }'

# Response: 403 Forbidden
# Error: "Only super admins can access this resource"
```

### Test 4: Access Denied to Other User's Hotel

```bash
# User2 tries to access User1's hotel
curl -X GET http://localhost:5000/hotels/user1_hotel \
  -H "Authorization: Bearer $USER2_TOKEN"

# Response: 404 Not Found
# Error: "Hotel not found or access denied"
```

## Postman Collection with RBAC

Update your Postman variables:

```
BASE_URL = http://localhost:5000
admin_token = SUPER_ADMIN_JWT_TOKEN
user_token = REGULAR_USER_JWT_TOKEN
```

### Super Admin Requests
Use `admin_token` variable in all requests

### Regular User Requests
Use `user_token` variable

- GET /hotels → Lists only user's hotels
- GET /hotels/search → Searches only user's hotels
- POST /hotels → 403 Forbidden
- PUT /hotels/:id → 403 Forbidden
- DELETE /hotels/:id → 403 Forbidden

## Middleware Functions

### `authenticate`
- Verifies JWT token
- Loads user with role and isAdmin flag
- Required for all endpoints

### `authorizeSuperAdmin`
- Checks if `req.user.isAdmin === true`
- Returns 403 if not admin
- Used for all write operations

## Query Filtering

The controllers automatically filter queries based on user role:

**Super Admin Query:**
```sql
SELECT * FROM hotels WHERE status = 'active'
```

**Regular User Query:**
```sql
SELECT * FROM hotels WHERE status = 'active' AND manager_id = 2
```

This filtering happens at the SQL level, not in application code, ensuring security and performance.

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication token is required"
}
```
**Cause:** No JWT token provided

### 403 Forbidden (No Permission)
```json
{
  "error": "Only super admins can access this resource"
}
```
**Cause:** User is not a super admin, attempted write operation

### 403 Forbidden (Not Owner)
```json
{
  "error": "Access denied: You can only manage your own hotels"
}
```
**Cause:** Trying to access another user's hotel

### 404 Not Found
```json
{
  "error": "Hotel not found or access denied"
}
```
**Cause:** Hotel doesn't exist OR user doesn't have permission to access it

## Best Practices

1. **Always include JWT token** in Authorization header for all requests
2. **Check response status codes** to determine success vs permission denial
3. **404 can mean two things**: Hotel doesn't exist OR user can't access it
4. **Search filters** are applied by user automatically
5. **Super admins should be carefully managed** - limit access to trusted administrators
6. **Manager IDs are immutable** - once assigned, a hotel's manager cannot be changed

## Migration Guide

If you have existing hotels without manager_id:

```sql
-- Assign all hotels to a super admin
UPDATE hotels SET manager_id = 1 WHERE manager_id IS NULL;

-- Or assign to specific managers
UPDATE hotels SET manager_id = 2 
WHERE data->>'hotelId' LIKE 'user_2_%';
```

## Security Considerations

✅ **Protected by JWT** - All endpoints require valid token
✅ **Manager-based access** - Users can only see their hotels
✅ **Super admin override** - Admins can see all
✅ **SQL-level filtering** - No data leaks in application logic
✅ **Role checking** - Every write operation verified
❌ **No public access** - All endpoints now require authentication (removed public listing)

## Future Enhancements

- [ ] Add hotel sharing between users
- [ ] Implement team-level access
- [ ] Add audit logging for admin actions
- [ ] Implement read-only manager roles
- [ ] Add temporary access tokens
- [ ] Manager-to-manager delegation
