const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/rbacMiddleware');
const {
  getDashboardStats,
  getAnalytics,
  getBookingsByCountry,
  getUsersByCountry,
  listUsers,
  adminRegisterUser,
  updateUserRole,
  deleteUser,
  assignVendorToHotel,
  updateRoomPrice,
  listEmailLogs,
} = require('../controllers/admin');
const {
  listGroupRequests,
  updateGroupRequestStatus,
} = require('../controllers/groupRequests');

router.use(authenticate, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/bookings-by-country', getBookingsByCountry);
router.get('/users-by-country', getUsersByCountry);

router.get('/users', listUsers);
router.post('/users', adminRegisterUser);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.patch('/hotels/:id/assign-vendor', assignVendorToHotel);
router.patch('/rooms/:id/price', updateRoomPrice);

router.get('/email-logs', listEmailLogs);

router.get('/group-requests', listGroupRequests);
router.patch('/group-requests/:id', updateGroupRequestStatus);

module.exports = router;
