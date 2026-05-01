const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const {
  getMyHotels, getMyRooms, updateRoomPriceBand, addRoom, getMyBookings, getVendorStats,
} = require('../controllers/vendor');

// Admins can hit the vendor endpoints too (returns all data instead of just
// their own hotels — see the isAdmin checks in the controller).
router.use(authenticate, authorizeRoles('vendor', 'admin'));

router.get('/stats', getVendorStats);
router.get('/hotels', getMyHotels);
router.get('/rooms', getMyRooms);
router.post('/rooms', addRoom);
router.patch('/rooms/:id/price-band', updateRoomPriceBand);
router.get('/bookings', getMyBookings);

module.exports = router;
