const express = require('express');
const { authenticate, authenticateOptional } = require('../middleware/authMiddleware');
const { BookRoom, getBookingById, CancelBooking, DeleteBooking, getBookings } = require('../controllers/bookings');
const router = express.Router();

//Bookings Route 
//Allows a user to book a room 
//@public route
router.post("/bookroom", authenticateOptional, BookRoom)

// New explicit booking create endpoint
router.post("/create", authenticateOptional, BookRoom)


// Optional list endpoint for admin/internal tooling
router.get("/", authenticate, getBookings)

// Authenticated user/admin booking history
router.post("/getbookingsbyuserid", authenticate, getBookingById)

// Existing soft-cancel endpoint
router.post("/cancel", CancelBooking)

// New hard-delete endpoint
router.delete("/delete", DeleteBooking)
router.delete("/:bookingid", DeleteBooking)


module.exports = router