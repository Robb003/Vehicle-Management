const Booking = require("../models/Booking");
const vehicle = require("../models/Vehicle");
const User = require("../models/User");

exports.createBooking = async(req, res)=>{
    try {
        if(req.user.role !=="Customer"){
            return res.status(403).json({message: "Only a customer can create a booking"});
        }
        const {User, vehicle, startDate, endDate, bookingReason}= req.body
        const booking = await Booking.create({
            User,
            vehicle,
            startDate,
            endDate,
            bookingReason,
            status: "pending"
        })
        res.status(201).json(booking);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.getAllBookings = async(req, res)=>{
    try {
        if(req.user.role !=="Admin"){
            return res.status(403).json({message: "Only Admin can see all bookings"})
        }
        const getbookings = await Booking.find().populate()
        res.json(getbookings);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.acceptBooking =async (req, res)=>{
    try {
        if(req.user.role !=="Admin"){
            return res.status(403).json({message: "Only Admin can accept a booking"});
        }
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({message: "Booking not found"});
        }
        booking.status = "accepted"
        await booking.save();
        res.json(booking);
    } catch(error){
        res.starus(500).json({message: error.message});
    }
};


exports.rejectBooking = async (req, res) =>{
    try {
        if(req.user.role !=="Admin"){
            return res.status(403).json({message: "Only Admin can reject a booking"});
        }
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({message: "Booking not found"});
        }
        booking.status = "rejected"
        await booking.save();
        res.json(booking);
    } catch(error){
        res.status(500).json({message: error.message});
    }
}