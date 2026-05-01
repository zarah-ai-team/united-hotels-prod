// routes/hotelsRoute.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/rbacMiddleware');
const {
  getPublicHotels,
  getPublicHotelById,
  getAllHotelsRecommendedPrices,
  getAdminHotels,
  adminCreateHotel,
  adminUpdateHotel,
  adminDeleteHotel
} = require('../controllers/hotels');

const router = express.Router();

/**
 * GET /hotels/public
 * Public endpoint to list all hotels with room details/categories.
 */
router.get('/public', getPublicHotels);
router.get('/public/:id', getPublicHotelById);
router.get('/recommended-prices', getAllHotelsRecommendedPrices);
router.get('/pricing/all', getAllHotelsRecommendedPrices);

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

module.exports = router;
