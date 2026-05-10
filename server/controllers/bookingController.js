const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

exports.createBooking = async (req, res) => {
    try {
        if (req.user.role !== "Admin" && req.user.role !== "Customer") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { vehicle, startDate, endDate, bookingReason } = req.body;
        const vehicleExist = await Vehicle.findById(vehicle);
        if (!vehicleExist) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        const booking = await Booking.create({
            customer: req.user.id,
            vehicle,
            startDate,
            endDate,
            bookingReason,
            status: "pending"
        });

        // SOCKET: Notify Admin that a new booking is waiting
        const io = req.app.get("io");
        if (io) {
            io.to("adminRoom").emit("notification", {
                title: "New Booking Request",
                message: `${req.user.name} has requested a vehicle.`,
                bookingId: booking._id
            });
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const getMyBookings = await Booking.find({ customer: req.user.id }).populate("vehicle");
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
            .populate("vehicle", "name registrationNumber status");
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

        const booking = await Booking.findById(req.params.id).populate("vehicle customer");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = "accepted";
        await booking.save();

        // Update Vehicle status to match your Model Enum (Capitalized)
        if (booking.vehicle) {
            booking.vehicle.status = "Booked"; 
            await booking.vehicle.save();
        }

        const io = req.app.get("io");
        if (io) {
            // 1. Tell EVERYONE the vehicle is now taken (updates fleet lists)
            io.emit("vehicleUpdated", booking.vehicle);

            // 2. Tell the specific CUSTOMER their booking is approved
            io.to(booking.customer._id.toString()).emit("notification", {
                message: "Your booking has been approved!",
                status: "accepted"
            });

            // 3. Tell ADMINS to update their booking list
            io.to("adminRoom").emit("bookingUpdated", booking);
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

        const booking = await Booking.findById(req.params.id).populate("vehicle customer");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = "rejected";
        await booking.save();

        // Reset Vehicle status to match your Model Enum (Capitalized)
        if (booking.vehicle) {
            booking.vehicle.status = "Available";
            await booking.vehicle.save();
        }

        const io = req.app.get("io");
        if (io) {
            // 1. Tell everyone the vehicle is free again
            io.emit("vehicleUpdated", booking.vehicle);

            // 2. Tell the customer they were rejected
            io.to(booking.customer._id.toString()).emit("notification", {
                message: "Your booking request was rejected.",
                status: "rejected"
            });

            // 3. Update Admin booking list
            io.to("adminRoom").emit("bookingUpdated", booking);
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
