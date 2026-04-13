const express = require("express");
const {createBooking, getAllBookings, getMyBookings, acceptBooking, rejectBooking} = require("../controllers/bookingController");
const { protect, authorize} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, authorize(["Customer"]), createBooking);
router.get("/", protect, authorize(["Admin"]), getAllBookings);
router.get("/me", protect, authorize(["Customer"]), getMyBookings);
router.put("/accept/:id", protect, authorize(["Admin"]), acceptBooking);
router.put("/reject/:id", protect, authorize(["Admin"]), rejectBooking);

module.exports = router;