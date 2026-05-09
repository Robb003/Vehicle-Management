import { useState, useEffect } from "react";
import VehicleCard from "@/vehicle/VehicleCard.jsx";
import AddVehicle from "@/vehicle/VehicleForm.jsx";
import BookingList from "@/booking/BookingList.jsx";
import socket from "../Services/socket";
import API from "../Services/api"; 
import { useAuthContext } from "@/Context/authContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const { setUser, setToken } = useAuthContext();
    const navigate = useNavigate();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([]); 
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const reload = () => setRefresh(prev => !prev);

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        socket.disconnect();
        localStorage.clear();
        setUser(null);
        setToken(null);
        navigate("/login", { replace: true });
    };

    // --- FETCH VEHICLE LIST ---
    useEffect(() => {
        const fetchFleet = async () => {
            try {
                // FIXED: Rely on the interceptor in api.js. 
                // Note: If this 403s, verify if your backend route is "/vehicle" or "/vehicles"
                const res = await API.get("vehicle");
                
                const data = Array.isArray(res.data) ? res.data : (res.data.vehicles || []);
                setVehicles(data);
            } catch (err) {
                console.error("Error fetching fleet:", err);
                // If 403 persists, the backend doesn't recognize your "Admin" role
                setVehicles([]); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchFleet();
    }, [refresh]);

    // --- SOCKET LOGIC ---
    useEffect(() => {
        // FIXED: Added a check to prevent connection attempts if already connecting
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.emit("joinAdmin");

        const handleNotification = (data) => {
            alert(`${data.title}: ${data.message}`);
            reload();
        };

        socket.on("notification", handleNotification);
        socket.on("vehicle:updated", reload);
        
        // Handle socket errors specifically
        socket.on("connect_error", (err) => {
            console.error("Admin Socket Error:", err.message);
            // If it times out on Render, it often means the initial Auth failed
        });

        return () => {
            socket.off("notification", handleNotification);
            socket.off("vehicle:updated", reload);
            socket.off("connect_error");
        };
    }, []);

    // --- DELETE LOGIC ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            // FIXED: Removed manual headers to prevent double-token conflicts
            await API.delete(`vehicle/${id}`);
            reload();
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Delete failed: Access Denied");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="font-medium text-gray-600">Verifying Admin Access...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <Button onClick={handleLogout} variant="destructive">Logout</Button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Vehicles</h2>
                {/* Ensure AddVehicle uses the plural/singular route correctly */}
                <AddVehicle selectedVehicle={selectedVehicle} refresh={reload} setSelectedVehicle={setSelectedVehicle} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pt-8 border-t">
                    {vehicles.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-10 italic">
                            No vehicles found in the database.
                        </p>
                    ) : (
                        vehicles.map((v) => (
                            <VehicleCard 
                                key={v._id || v.id}
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
