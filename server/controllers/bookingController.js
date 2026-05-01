const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

exports.createBooking = async (req, res) => {
    try {
        if (req.user.role !== "Customer") {
            return res.status(403).json({ message: "Only a customer can create a booking" });
        }
        const { vehicle, startDate, endDate, bookingReason } = req.body;
        const vehicleExist = await Vehicle.findById(vehicle);
        if (!vehicleExist) {
            return res.status(404).json({ message: "vehicle not found" });
        }

        const booking = await Booking.create({
            customer: req.user.id,
            vehicle,
            startDate,
            endDate,
            bookingReason,
            status: "pending"
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const getMyBookings = await Booking.find({ customer: req.user.id })
            .populate("vehicle");
        res.json(getMyBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only Admin can see all bookings" });
        }
        const getbookings = await Booking.find()
            .populate("customer", "name email")
            .populate("vehicle", "name registrationNumber status"); // Added status
        res.json(getbookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptBooking = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only Admin can accept a booking" });
        }

        // Populate vehicle so we can use save() on it directly
        const booking = await Booking.findById(req.params.id).populate("vehicle");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 1. Update Booking status
        booking.status = "accepted";
        await booking.save();

        // 2. Update Vehicle status (Matching your Socket handler's field name)
        if (booking.vehicle) {
            booking.vehicle.status = "booked"; 
            await booking.vehicle.save();
        }

        // 3. Socket Notification
        const io = req.app.get("socketio");
        if (io) {
            // Match the event name your frontend listens to
            io.emit("vehicle:updated", booking.vehicle);
            io.emit("bookingStatusChanged", {
                bookingId: booking._id,
                status: "accepted"
            });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectBooking = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only Admin can reject a booking" });
        }

        const booking = await Booking.findById(req.params.id).populate("vehicle");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = "rejected";
        await booking.save();

        if (booking.vehicle) {
            booking.vehicle.status = "available";
            await booking.vehicle.save();
        }

        const io = req.app.get("socketio");
        if (io) {
            io.emit("vehicle:updated", booking.vehicle);
            io.emit("bookingStatusChanged", {
                bookingId: booking._id,
                status: "rejected"
            });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
