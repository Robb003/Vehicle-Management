import { useState, useEffect } from "react";
import VehicleCard from "@/Vehicle/VehicleCard.jsx";
import AddVehicle from "@/Vehicle/VehicleForm.jsx";
import BookingList from "@/Booking/BookingList.jsx";
import socket from "@/Services/socket";
import API from "@/Services/api"; // Added API import
import { useAuthContext } from "@/Context/authContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const { setUser, setToken } = useAuthContext();
    const navigate = useNavigate();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicle, setVehicle] = useState([]); // State named 'vehicle' as requested
    const [refresh, setRefresh] = useState(false);
    const reload = () => setRefresh(prev => !prev);

    // --- FETCH VEHICLE LIST ---
    useEffect(() => {
        const fetchFleet = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await API.get("vehicle", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Ensure we always set an array
                setVehicle(Array.isArray(res.data) ? res.data : res.data.vehicles || []);
            } catch (err) {
                console.error("Error fetching fleet:", err);
            }
        };
        fetchFleet();
    }, [refresh]);

    // --- DELETE LOGIC ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`vehicles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            reload();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        setToken(null);
        socket.disconnect();
        navigate("/login");
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        if (!socket.connected) socket.connect();
        socket.emit("joinAdmin");

        const handleNotification = (data) => {
            alert(`${data.title}: ${data.message}`);
            reload();
        };

        socket.on("notification", handleNotification);
        socket.on("vehicle:updated", reload);

        return () => {
            socket.off("notification", handleNotification);
            socket.off("vehicle:updated", reload);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <Button onClick={handleLogout} variant="destructive">Logout</Button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Vehicles</h2>
                <AddVehicle selectedVehicle={selectedVehicle} refresh={reload} />
                
                {/* --- VEHICLE LIST GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pt-8 border-t">
                    {vehicle.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center">No vehicles found.</p>
                    ) : (
                        vehicle.map((v) => (
                            <VehicleCard 
                                key={v._id}
                                vehicle={v} 
                                onEdit={setSelectedVehicle}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Bookings</h2>
                <BookingList key={refresh} />
            </div>
        </div>
    );
}
