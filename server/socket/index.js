const Booking = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("joinAdmin", () => {
            socket.join("adminRoom");
            console.log("Admin joined adminroom");
        });

        socket.on("joincustomer", (userId) => {
            socket.join(userId);
            console.log(`customer ${userId} joined their room`);
        });

        socket.on("sendBooking", async (data) => {
            try {
                const { customerId, vehicleId, startDate, endDate, bookingReason } = data;
                const newBooking = await Booking.create({
                    customer: customerId,
                    vehicle: vehicleId,
                    startDate,
                    endDate,
                    bookingReason // Added this since it's required in your schema
                });

                const customer = await User.findById(customerId);

                io.to("adminRoom").emit("notification", {
                    title: "New Booking",
                    message: `${customer?.name || "A customer"} booked vehicle ${vehicleId}`,
                    bookingId: newBooking._id
                });
            } catch (error) {
                console.error("Booking error:", error.message);
            }
        });

        socket.on("acceptBooking", async (data) => {
            try {
                const { bookingId } = data;
                // Use lowercase 'accepted' to match your Mongoose enum
                const booking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { status: "accepted" },
                    { new: true }
                ).populate("vehicle customer");

                if (!booking) return;

                // Update vehicle status in DB
                // Note: Ensure your Vehicle schema uses the field name 'status'
                if (booking.vehicle) {
                    booking.vehicle.status = "booked"; 
                    await booking.vehicle.save();
                }

                // Notify specific customer room
                const customerRoom = booking.customer._id.toString();
                io.to(customerRoom).emit("notification", {
                    message: "Your booking has been approved",
                    bookingId: booking._id,
                    status: "accepted"
                });

                // Emit to everyone that vehicle is now booked
                io.emit("vehicle:updated", booking.vehicle);
                // Emit to admin to refresh the list
                io.to("adminRoom").emit("bookingUpdated", booking);

            } catch (error) {
                console.error("Accept booking error:", error.message);
            }
        });

        socket.on("rejectBooking", async (data) => {
            try {
                const { bookingId } = data;
                const booking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { status: "rejected" }, // Lowercase to match enum
                    { new: true }
                ).populate("vehicle customer");

                if (!booking) return;

                if (booking.vehicle) {
                    booking.vehicle.status = "available";
                    await booking.vehicle.save();
                }

                const customerRoom = booking.customer._id.toString();
                io.to(customerRoom).emit("notification", {
                    message: "Your booking has been rejected",
                    bookingId: booking._id,
                    status: "rejected"
                });

                io.emit("vehicle:updated", booking.vehicle);
                io.to("adminRoom").emit("bookingUpdated", booking);

            } catch (error) {
                console.error("Reject booking error:", error.message);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
