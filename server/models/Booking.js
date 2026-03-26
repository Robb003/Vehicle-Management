const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    vehicle: {type: mongoose.Schema.Types.ObjectId, ref: "Vehicle"},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    bookingReason: {type: String, required: true},
    status: {type: String, required: true, enum: ["pending", "accepted", "rejected"], default: "pending"}
},{timestamps: true});

module.exports = mongoose.model("Booking", bookingSchema);