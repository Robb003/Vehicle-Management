const mongoose = require("mongoose");
const vehicleSchema = new mongoose.Schema({
    name: {type: String, required: true}, 
    registrationNumber: {type: String, required: true, unique: true}, 
    pricePerDay: {type: Number, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Vehicle", vehicleSchema);