const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const {
  getMyHotels, getMyRooms, updateRoomPriceBand, addRoom, getMyBookings, getVendorStats, getVendorAnalytics,
} = require('../controllers/vendor');
const { getNotifications } = require('../controllers/notifications');

// Admins can hit the vendor endpoints too (returns all data instead of just
// their own hotels — see the isAdmin checks in the controller).
router.use(authenticate, authorizeRoles('vendor', 'admin'));

router.get('/stats', getVendorStats);
router.get('/analytics', getVendorAnalytics);
router.get('/hotels', getMyHotels);
router.get('/rooms', getMyRooms);
router.post('/rooms', addRoom);
router.patch('/rooms/:id/price-band', updateRoomPriceBand);
router.get('/bookings', getMyBookings);

// Notification bell feed. Admins get all activity; vendors their hotels' bookings.
router.get('/notifications', getNotifications);

module.exports = router;
