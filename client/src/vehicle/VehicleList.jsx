import { useState, useEffect } from "react";
import API from "../Services/api";
import VehicleCard from "./VehicleCard";

export default function VehicleList() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.get("vehicle", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // --- FIX: Safety check to ensure we have an array ---
            const data = Array.isArray(res.data) ? res.data : (res.data.vehicles || []);
            setVehicles(data);
        } catch (err) {
            console.error("Fetch error:", err);
            setVehicles([]); // Set empty array on error to prevent .map crash
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    if (loading) return <p className="text-center text-gray-500">Loading vehicles...</p>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.length > 0 ? (
                vehicles.map((v) => (
                    <VehicleCard 
                        key={v._id || v.id} 
                        vehicle={v} 
                        onDelete={() => console.log("Delete", v._id)} 
                        onEdit={() => console.log("Edit", v)} 
                    />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No vehicles available.</p>
            )}
        </div>
    );
}
