const express = require("express")
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles, authorizeAdmin } = require("../middleware/rbacMiddleware");
const {
  getRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
  adminCreateRoom,
  adminUpdateRoom,
  adminDeleteRoom
} = require("../controllers/rooms");

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/", authenticate, authorizeRoles('super_admin', 'manager', 'hotel_manager'), addRoom);
router.put("/:id", authenticate, authorizeRoles('super_admin', 'manager', 'hotel_manager'), updateRoom);
router.delete("/:id", authenticate, authorizeRoles('super_admin', 'manager', 'hotel_manager'), deleteRoom);

router.post('/admin/create', authenticate, authorizeAdmin, adminCreateRoom);
router.put('/admin/:id/update', authenticate, authorizeAdmin, adminUpdateRoom);
router.delete('/admin/:id/delete', authenticate, authorizeAdmin, adminDeleteRoom);

module.exports = router;