# Hotel Management System - Setup & Installation Guide

## Overview

This guide will walk you through setting up the new hotel management system with CRUD operations and Excel import capabilities.

## Prerequisites

- Node.js 14+ with npm
- PostgreSQL 12+
- Admin access to the database

## Installation Steps

### Step 1: Install Dependencies

```bash
cd united-hotels-backend
npm install

# Verify ajv was installed
npm list ajv
```

Expected output should show `ajv@^8.12.0`

### Step 2: Update Database Schema

You have two options for updating the database:

#### Option A: Fresh Installation (No Existing Data)

Run the new schema directly:

```bash
psql -U your_user -d your_database -f db/schema.sql
```

#### Option B: Migrate Existing Data

If you have existing hotel data, use the migration guide:

```bash
# First, create a backup
psql -U your_user -d your_database -c "CREATE TABLE hotels_backup AS SELECT * FROM hotels;"

# Run migration steps from MIGRATION_GUIDE.sql
psql -U your_user -d your_database -f db/MIGRATION_GUIDE.sql

# After verification, drop old table and rename new one
psql -U your_user -d your_database -c "DROP TABLE IF EXISTS hotels CASCADE; ALTER TABLE hotels_new RENAME TO hotels;"
```

### Step 3: Verify Database Changes

```bash
psql -U your_user -d your_database

# Check new hotels table structure
\d hotels

# Should see:
# - hotel_id (text, unique)
# - data (jsonb)
# - status (text)
# - manager_id (integer)
# - created_at, updated_at (timestamptz)
```

### Step 4: Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server should start without errors. Check the console for:
```
Server running on port 5000
```

### Step 5: Obtain Admin Token

To use admin endpoints, you need an admin user with a valid JWT token.

#### Create Admin User (if needed):

```sql
INSERT INTO users (name, email, password, "isAdmin", role)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$...hashed_password...',
  true,
  'super_admin'
);
```

#### Get JWT Token:

Use the authentication endpoint:

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

Response should include:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## File Structure

```
united-hotels-backend/
├── db/
│   ├── schema.sql              # New database schema
│   └── MIGRATION_GUIDE.sql     # Migration script for existing data
├── schemas/
│   └── hotelExcelImport.schema.json  # JSON schema for Excel import
├── utils/
│   ├── hotelValidator.js       # Schema validation
│   ├── hotelImportService.js   # Excel data parser
│   └── mailer.js               # (existing)
├── controllers/
│   ├── hotels.js               # Hotel CRUD endpoints (UPDATED)
│   └── ...
├── routes/
│   ├── hotelsRoute.js          # Hotel routes (UPDATED)
│   └── ...
├── middleware/
│   ├── authMiddleware.js       # Authentication
│   ├── rbacMiddleware.js       # Role-based access (UPDATED)
│   └── ...
├── HOTEL_API_GUIDE.md          # Complete API documentation
├── MIGRATION_GUIDE.sql         # Database migration
└── package.json                # Dependencies (UPDATED)
```

## Quick Start: Testing the API

### 1. Import Hotels from Excel

```bash
curl -X POST http://localhost:5000/hotels/import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "general_informations": [
    {
      "HOTEL NAMES": "Test Hotel",
      "INFORMATION": "A test hotel",
      "CONTACT": "+90-212-555-1234",
      "LOCATION": "Istanbul, Turkey",
      "E-Mail ADDRESS": "info@testhotel.com",
      "ROOM TYPES": "Single,Double",
      "PRICES": "100 TRY, 200 TRY",
      "HOTEL LINK": "https://testhotel.com",
      "STAR RATINGS": "4",
      "HOTEL AMENITIES": "WiFi, Pool",
      "HOTEL DESCRIPTON": "Test description",
      "CHECK IN AND CHECK OUT": "Check in: 14:00, Check out: 11:00"
    }
  ],
  "child_pet_smoking_policies": [
    {
      "HOTEL NAMES": "Test Hotel",
      "CHILD POLICY": "Children under 12 stay free",
      "PET POLICY": "Pets allowed",
      "SMOKING POLICY": "No smoking"
    }
  ],
  "google_map_links": [
    {
      "HOTEL NAMES": "Test Hotel",
      "GOOGLE MAP LINK": "https://maps.google.com/..."
    }
  ]
}
EOF
```

### 2. Get All Active Hotels

```bash
curl -X GET "http://localhost:5000/hotels?status=active&limit=10"
```

### 3. Search Hotels

```bash
curl -X GET "http://localhost:5000/hotels/search?query=Istanbul&minRating=4&limit=5"
```

### 4. Update Hotel Status

```bash
curl -X PUT http://localhost:5000/hotels/test_hotel \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

## Troubleshooting

### Issue: "ajv module not found"

**Solution:**
```bash
npm install ajv@^8.12.0
npm install
```

### Issue: Database connection errors

**Solution:**
```bash
# Check PostgreSQL is running
psql -U your_user -d your_database -c "SELECT 1"

# Verify credentials in .env
cat .env | grep -i "database\|postgres"
```

### Issue: Admin endpoints return 403

**Solution:**
- Verify user has `isAdmin` = true in database
- Check JWT token is valid and not expired
- Include `Authorization: Bearer {token}` header

### Issue: Hotel import fails with validation errors

**Solution:**
- Verify all required fields are present in Excel data
- Check HOTEL NAMES field is not empty
- Ensure LOCATION field has a value
- See HOTEL_API_GUIDE.md for required fields

### Issue: Duplicate hotel_id errors

**Solution:**
```bash
# Check for duplicates
SELECT hotel_id, COUNT(*) FROM hotels GROUP BY hotel_id HAVING COUNT(*) > 1;

# Delete duplicates or rename
UPDATE hotels SET hotel_id = hotel_id || '_' || id WHERE hotel_id IN (...);
```

## Environment Variables

Add these to your `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=5000
NODE_ENV=development

# Email (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## API Documentation

For complete API documentation, see [HOTEL_API_GUIDE.md](./HOTEL_API_GUIDE.md)

## Key Features

✅ **Excel Data Import** - Bulk import hotels from Excel sheets
✅ **Full CRUD** - Create, Read, Update, Delete hotels (admin only)
✅ **Advanced Search** - Search by name, rating, location
✅ **Status Management** - Draft/Active/Inactive states
✅ **Data Validation** - JSON schema validation
✅ **Deep Merge Updates** - Partial updates preserve nested data
✅ **Audit Tracking** - Created/Updated timestamps

## Architecture

```
Excel Data
    ↓
[hotelImportService] - Parse & normalize
    ↓
[hotelValidator] - Validate against schema
    ↓
[Hotels Controller] - CRUD operations
    ↓
[PostgreSQL JSONB] - Store as documents
```

## Performance Tips

1. **Indexing**: Hotel IDs and status are indexed for fast lookups
2. **Pagination**: Always use limit/offset for large datasets
3. **Search**: Use specific queries; full table scans are avoided
4. **Caching**: Consider adding Redis caching for frequently accessed hotels

## Security

- ✅ All admin endpoints require JWT authentication
- ✅ Admin flag verification on every write operation
- ✅ SQL injection protected (parameterized queries)
- ✅ CORS enabled for frontend access
- ✅ Password hashing with bcrypt

## Support

For issues or questions:
1. Check [HOTEL_API_GUIDE.md](./HOTEL_API_GUIDE.md)
2. Use the Postman collection: [postman_collection.json](./postman_collection.json)
3. Check migration guide: [MIGRATION_GUIDE.sql](./db/MIGRATION_GUIDE.sql)

## Next Steps

1. ✅ Set up database with new schema
2. ✅ Install dependencies (npm install)
3. ✅ Create admin user and get JWT token
4. ✅ Test import endpoint with sample data
5. ✅ Update frontend to use new search/filter endpoints
6. ✅ Configure production environment variables

