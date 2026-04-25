import { useState, useEffect } from "react";
import API from "../Services/api";
import VehicleCard from "./VehicleCard"; // Import your fixed card

export default function VehicleList() {
    const [vehicles, setVehicles] = useState([]);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.get("vehicles", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
                <VehicleCard 
                    key={v._id} 
                    vehicle={v} 
                    onDelete={() => console.log("Delete", v._id)} 
                    onEdit={() => console.log("Edit", v)} 
                />
            ))}
        </div>
    );
}
