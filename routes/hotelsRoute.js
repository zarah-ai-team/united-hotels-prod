// routes/hotelsRoute.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/rbacMiddleware');
const { createImageUploader, uploadDirFor } = require('../utils/imageUpload');
const {
  getPublicHotels,
  getPublicHotelById,
  getAllHotelsRecommendedPrices,
  getAdminHotels,
  adminCreateHotel,
  adminUpdateHotel,
  adminDeleteHotel,
  uploadHotelImages,
  serveDbImage,
  serveFallbackImage
} = require('../controllers/hotels');

const router = express.Router();

// Hotel + room-category photos uploaded from the admin portal.
const uploadHotelMedia = createImageUploader();

/**
 * GET /hotels/public
 * Public endpoint to list all hotels with room details/categories.
 */
router.get('/public', getPublicHotels);
router.get('/public/:id', getPublicHotelById);
router.get('/recommended-prices', getAllHotelsRecommendedPrices);
router.get('/pricing/all', getAllHotelsRecommendedPrices);

/**
 * Images kept in Postgres:
 *   GET /hotels/media/db/:id           stored only in the database (ImageKit
 *                                      was unavailable at upload time)
 *   GET /hotels/media/fallback?url=... database copy of an ImageKit image,
 *                                      used when ImageKit fails to deliver
 */
router.get('/media/db/:id', serveDbImage);
router.get('/media/fallback', serveFallbackImage);

/**
 * GET /hotels/media/<file>
 * Legacy: images from the earlier disk-based uploads, if any exist.
 */
router.use(
  '/media',
  express.static(uploadDirFor('hotels'), {
    index: false,
    setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'),
  }),
);

/**
 * GET /hotels/admin
 * Admin portal endpoint to list hotels filtered by manager/user id.
 * Query params: managerId (or userId), limit, offset
 */
router.get('/admin', authenticate, getAdminHotels);

/**
 * Admin CRUD for hotels
 */
router.post('/admin/create', authenticate, authorizeAdmin, adminCreateHotel);
router.put('/admin/:id/update', authenticate, authorizeAdmin, adminUpdateHotel);
router.delete('/admin/:id/delete', authenticate, authorizeAdmin, adminDeleteHotel);

/**
 * POST /hotels/admin/upload  (multipart, field `files` or `file`)
 * Uploads images to ImageKit and returns their URLs. Query: hotelId, roomId. The caller then saves those
 * URLs onto a hotel (images/image) or a room (images) via the update routes.
 */
router.post('/admin/upload', authenticate, authorizeAdmin, uploadHotelMedia, uploadHotelImages);

module.exports = router;
