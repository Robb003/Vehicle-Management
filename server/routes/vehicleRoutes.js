const express = require("express");
const {addVehicle, getAllVehicles, updateVehicle, deleteVehicle} = require("../controllers/vehicleController");
const { protect, authorize} = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", protect, authorize(["Admin"]), addVehicle);
router.get("/", protect, getAllVehicles);
router.put("/:id", protect, authorize(["Admin"]), updateVehicle);
router.delete("/:id", protect, authorize(["Admin"]), deleteVehicle);

module.exports = router