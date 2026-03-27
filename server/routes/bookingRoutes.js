const express = require("express");
const {createBooking, getAllBookings, acceptBooking,rejectBooking} = require("../controllers/bookingController");
const { protect, authorize} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, authorize(["Customer"]), createBooking);
router.get("/", protect, authorize(["Admin"]), getAllBookings);
router.put("/accept/id", protect, authorize(["Admin"]), acceptBooking);
router.put("/reject/id", protect, authorize(["Admin"]), rejectBooking);

module.exports = router;