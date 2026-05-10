const Booking = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Admin joins a specific room to receive booking alerts
        socket.on("joinAdmin", () => {
            socket.join("adminRoom");
            console.log("Admin joined adminroom");
        });

        // Customer joins a room named after their User ID for private updates
        socket.on("joincustomer", (userId) => {
            socket.join(userId);
            console.log(`customer ${userId} joined their room`);
        });

        // Handle new booking creation from customer
        socket.on("sendBooking", async (data) => {
            try {
                const { customerId, vehicleId, startDate, endDate, bookingReason } = data;
                const newBooking = await Booking.create({
                    customer: customerId,
                    vehicle: vehicleId,
                    startDate,
                    endDate,
                    bookingReason 
                });

                const customer = await User.findById(customerId);

                // Alert the Admin instantly about the new request
                io.to("adminRoom").emit("notification", {
                    title: "New Booking Request",
                    message: `${customer?.name || "A customer"} is requesting a vehicle.`,
                    bookingId: newBooking._id
                });
            } catch (error) {
                console.error("Booking error:", error.message);
            }
        });

        // Handle Admin approving a booking
        socket.on("acceptBooking", async (data) => {
            try {
                const { bookingId } = data;
                
                // 1. Update Booking status to 'accepted' (lowercase as per Booking model)
                const booking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { status: "accepted" },
                    { new: true }
                ).populate("vehicle customer");

                if (!booking) return;

                // 2. Update Vehicle status to 'Booked' (Capitalised to match Vehicle model enum)
                if (booking.vehicle) {
                    booking.vehicle.status = "Booked"; 
                    await booking.vehicle.save();
                }

                // 3. Notify the specific customer that their request was approved
                const customerRoom = booking.customer?._id?.toString();
                if (customerRoom) {
                    io.to(customerRoom).emit("notification", {
                        message: "Your booking has been approved!",
                        bookingId: booking._id,
                        status: "accepted"
                    });
                }

                // 4. BROADCAST: Update the vehicle card on all Admin dashboards instantly
                // Ensure your frontend listens for "vehicleUpdated"
                io.emit("vehicleUpdated", booking.vehicle);
                
                // 5. Update the admin's booking list specifically
                io.to("adminRoom").emit("bookingUpdated", booking);

            } catch (error) {
                console.error("Accept booking error:", error.message);
            }
        });

        // Handle Admin rejecting a booking
        socket.on("rejectBooking", async (data) => {
            try {
                const { bookingId } = data;
                
                // 1. Update Booking status to 'rejected'
                const booking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { status: "rejected" },
                    { new: true }
                ).populate("vehicle customer");

                if (!booking) return;

                // 2. Reset Vehicle status to 'Available' (Capitalised as per Vehicle model)
                if (booking.vehicle) {
                    booking.vehicle.status = "Available";
                    await booking.vehicle.save();
                }

                // 3. Notify the customer of the rejection
                const customerRoom = booking.customer?._id?.toString();
                if (customerRoom) {
                    io.to(customerRoom).emit("notification", {
                        message: "Sorry, your booking was rejected.",
                        bookingId: booking._id,
                        status: "rejected"
                    });
                }

                // 4. BROADCAST: Update UI to show the vehicle is free again
                io.emit("vehicleUpdated", booking.vehicle);
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
