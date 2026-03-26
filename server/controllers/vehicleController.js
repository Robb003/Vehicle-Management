const Vehicle = require("../models/Vehicle")
//add vehicle

exports.addVehicle = async(req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({message: "Only admin can add a vehicle"})
        }
        const {name, pricePerDay, registrationNumber} = req.body;
        //check if vehicle exist{
        const vehicleExist = await Vehicle.findOne({registrationNumber});
        if(vehicleExist){
            return res.status(400).json({message: "Vehicle already exist"});
        }
        const vehicle = await Vehicle.create({
            name,
            registrationNumber,
            pricePerDay
        });
        res.status(201).json(vehicle);
    } catch(error){
        res.status(500).json({message: error.message})
    }
};

//Get all vehicle

exports.getAllVehicles = async(req, res)=> {
    try{
        let query = {};
        if (req.user.role ===("Customer")){
            query = {customer: req.user.id}
        } else if(req.user.role ==="Admin"){
            query ={Admin: req.user.id}
        }
        const getvehicle = await Vehicle.find(query)
        res.json(getvehicle);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};
exports.updateVehicle = async(req, res)=>{
    try {
        if(req.user.role !== "Admin"){
          return res.status(403).json({message: "Only Admin  can update a vehicle"})
        }
        const updateVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(updateVehicle);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.deleteVehicle = async(req, res)=>{
    try {
        if(req.user.role !=="Admin"){
            return res.status(403).json({message: "Only  Admin can delete a vehicle"});
        }
        const deleteVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        res.json(deleteVehicle);
    } catch(error){
        res.status(500).json({message: error.message})
    }
}