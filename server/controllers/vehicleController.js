const Vehicle = require("../models/Vehicle");

// 1. Add Vehicle
exports.addVehicle = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only admin can add a vehicle" });
        }
        const { name, pricePerDay, registrationNumber } = req.body;

        const vehicleExist = await Vehicle.findOne({ registrationNumber });
        if (vehicleExist) {
            return res.status(400).json({ message: "Vehicle already exists" });
        }

        const vehicle = await Vehicle.create({
            name,
            registrationNumber,
            pricePerDay
        });

        // SOCKET TRIGGER: Tell everyone a new vehicle was added
        const io = req.app.get("io");
        io.emit("vehicleAdded", vehicle); 

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get All Vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const getvehicle = await Vehicle.find({});
        res.json(getvehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Vehicle
exports.updateVehicle = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only Admin can update a vehicle" });
        }
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // SOCKET TRIGGER: Tell everyone a vehicle was updated
        const io = req.app.get("io");
        io.emit("vehicleUpdated", vehicle);

        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Delete Vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only Admin can delete a vehicle" });
        }
        
        await Vehicle.findByIdAndDelete(req.params.id);

        // SOCKET TRIGGER: Send the ID of the deleted vehicle
        const io = req.app.get("io");
        io.emit("vehicleDeleted", req.params.id);

        res.json({ message: "Vehicle deleted successfully", id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
