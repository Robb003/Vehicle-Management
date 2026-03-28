const Booking = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

module.exports=(io)=>{
    io.on("connection", (socket)=>{
        console.log(`Socket connected: ${socket.id}`);
        //Admin joins adminRoom
        socket.on("joinAdmin", ()=>{
            socket.join("adminRoom");
            console.log("Admin joined adminroom");
        });
        //Customer joins a customerRoom
        socket.on("joincustomer", (userId)=>{
            socket.join(userId);
            console.log(`customer ${userId} joined their room`);
        });
        socket.on("sendBooking", async(data)=>{
            try{
                const {customerId, vehicleId, startDate, endDate} = data;
                const newBooking = await Booking.create({
                    customer: customerId,
                    vehicle: vehicleId,
                    startDate,
                    endDate
                });
                //get user info
                const customer = await User.findById(customerId);

                //emit notification to the admin

                io.to("adminRoom").emit("notification", {
                    title: "New Booking",
                    message: `${customer.name} booked vehicle ${vehicleId}`,
                    startDate,
                    endDate,
                    bookingId: newBooking._id
                });
            } catch(error){
                console.error("Booking error.", error.message);
            }
        });

        socket.on("acceptBooking", async(data)=>{
            try {
                const {bookingId} = data;
                const booking = await Booking.findByIdAndUpdate(
                    bookingId,
                    {status: "Accepted"},
                    {new: true}
                ).populate("vehicle customer");
                if(!booking)return;
                //update vehicle availability to already booked
                booking.vehicle.status = "Already Booked";
                await booking.vehicle.save();
                //notify the customer of booking status
                io.to(booking.customer.toString()).emit("notification", {
                    message: "your booking has been approved",
                    bookingId: booking._id
                });
                // emit updated vehicle info to every customer
                io.emit("vehicle:updated", booking.vehicle);
            } catch(error){
                console.error("Accept booking error.", error.message);
            }
        });

        socket.on("rejectBooking", async(data)=>{
            try {
                const {bookingId} = data;
            const booking =  await Booking.findByIdAndUpdate(
                bookingId,
                {status: "Rejected"},
                {new: true}
            ).populate("vehicle customer");
            if(!booking) return;
            //update vehicle availability
            booking.vehicle.status = "Availabe";
            await booking.vehicle.save();

            //notify customer of their booking status
            io.to(booking.customer.toString()).emit("notification", {
                message: "Your Booking has been rejected",
                bookingId: booking._id
            });
            //emit vehicle info to every customer
            io.emit("vehicle:updated", booking.vehicle);
            } catch(error) {
                console.error("Reject booking error", error.message);
            }
        });

        //disconnect connection

        socket.on("disconnect", async()=>{
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};